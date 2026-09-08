import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quiz } from '../entities/quiz.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { QuizResult } from '../entities/quiz-result.entity';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { FormationCompetence } from '../entities/formation-competence.entity';
import { EmployeeCompetence } from '../../competences/entities/employee-competence.entity';
import { LearningTasksService } from '../learning-tasks/learning-tasks.service';
import { Certification } from '../../competences/entities/certification.entity';
import { PerformanceEventsService } from '../performance-events/performance-events.service';
import { LinkCertificationFormation } from '../entities/link-certifications-formation.entity';

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,

    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,

    @InjectRepository(QuizAnswer)
    private readonly quizAnswerRepository: Repository<QuizAnswer>,

    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,

    @InjectRepository(FormationCompetence)
    private readonly formationCompetenceRepository: Repository<FormationCompetence>,

    @InjectRepository(EmployeeCompetence)
    private readonly employeeCompetenceRepository: Repository<EmployeeCompetence>,

    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,

    @InjectRepository(LinkCertificationFormation)
    private readonly linkCertificationFormationRepository: Repository<LinkCertificationFormation>,

    private readonly learningTasksService: LearningTasksService,
    private readonly performanceEventsService: PerformanceEventsService,
  ) {}

  async submit(dto: SubmitQuizAttemptDto) {
    const quiz = await this.quizRepository.findOne({
      where: { id: dto.quiz_id },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz avec l'id ${dto.quiz_id} introuvable`);
    }

    const questions = await this.quizQuestionRepository.find({
      where: { quiz_id: dto.quiz_id },
    });

    if (questions.length === 0) {
      throw new NotFoundException(`Aucune question trouvée pour ce quiz`);
    }

    let correctCount = 0;
    const detail: {
      question_id: string;
      correcte: boolean;
      reponses_attendues: string[];
      reponses_soumises: string[];
    }[] = [];

    for (const question of questions) {
      const reponseSoumise = dto.reponses.find(
        (r) => r.question_id === question.id,
      );

      let estCorrecte: boolean;
      let idsAttendus: string[] = [];
      let idsSoumis: string[] = [];

      if (question.type === 'reponse_libre') {
        // Comparaison texte : insensible à la casse et aux espaces superflus
        const bonneReponse = await this.quizAnswerRepository.findOne({
          where: { question_id: question.id, est_correcte: true },
        });

        const normaliser = (texte: string) => texte.trim().toLowerCase();
        const texteAttendu = bonneReponse ? normaliser(bonneReponse.answer) : '';
        const texteSoumis = normaliser(reponseSoumise?.texte_libre ?? '');

        estCorrecte = texteAttendu.length > 0 && texteAttendu === texteSoumis;
      } else {
        // Choix multiples / vrai-faux : comparaison par identifiants de réponse
        const bonnesReponses = await this.quizAnswerRepository.find({
          where: { question_id: question.id, est_correcte: true },
        });

        idsAttendus = bonnesReponses.map((a) => a.id).sort();
        idsSoumis = (reponseSoumise?.answer_ids ?? []).slice().sort();

        estCorrecte =
          idsAttendus.length === idsSoumis.length &&
          idsAttendus.every((id, i) => id === idsSoumis[i]);
      }

      if (estCorrecte) correctCount++;

      detail.push({
        question_id: question.id,
        correcte: estCorrecte,
        reponses_attendues: idsAttendus,
        reponses_soumises: idsSoumis,
      });
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const reussi = score >= (quiz.score_requis ?? 0);

    const result = this.quizResultRepository.create({
      quiz_id: dto.quiz_id,
      utilisateur_id: dto.utilisateur_id,
      score,
      score_max: 100,
      reussi,
      date_passage: new Date(),
    });

    const saved = await this.quizResultRepository.save(result);

    const competencesUpdated = reussi
      ? await this.updateProfileFromPassedQuiz(quiz.formation_id, dto.utilisateur_id)
      : 0;
    const certificationsCreated = reussi
      ? await this.createCertifications(quiz.formation_id, dto.utilisateur_id, quiz.titre)
      : 0;

    await this.learningTasksService.create({
      utilisateur_id: dto.utilisateur_id,
      type: reussi ? 'formation_validee' : 'revoir_quiz',
      reference_id: saved.id,
      message: reussi
        ? 'Quiz validé : votre profil de compétences a été mis à jour.'
        : 'Quiz terminé : consultez vos réponses avant une nouvelle tentative.',
      payload: { quiz_id: dto.quiz_id, score, reussi, competences_updated: competencesUpdated, certifications_created: certificationsCreated },
    });
    await this.performanceEventsService.publish({
      utilisateur_id: dto.utilisateur_id,
      type: 'quiz_termine',
      reference_id: saved.id,
      payload: { quiz_id: dto.quiz_id, score, reussi, competences_updated: competencesUpdated },
    });

    return {
      ...saved,
      total_questions: questions.length,
      bonnes_reponses: correctCount,
      detail,
      competences_updated: competencesUpdated,
      certifications_created: certificationsCreated,
    };
  }

  private async updateProfileFromPassedQuiz(formationId: string, utilisateurId: string) {
    const links = await this.formationCompetenceRepository.find({ where: { formation_id: formationId } });
    let updated = 0;

    for (const link of links) {
      if (!link.niveau_vise) continue;
      const existing = await this.employeeCompetenceRepository.findOne({
        where: { utilisateur_id: utilisateurId, competence_id: link.competence_id },
      });
      if (!existing || existing.niveau < link.niveau_vise) {
        await this.employeeCompetenceRepository.save(
          existing
            ? Object.assign(existing, { niveau: link.niveau_vise, source: 'quiz', date_evaluation: new Date() })
            : this.employeeCompetenceRepository.create({
                utilisateur_id: utilisateurId,
                competence_id: link.competence_id,
                niveau: link.niveau_vise,
                source: 'quiz',
                date_evaluation: new Date(),
              }),
        );
        updated++;
      }
    }

    return updated;
  }

  private async createCertifications(formationId: string, utilisateurId: string, quizTitle: string) {
    const links = await this.formationCompetenceRepository.find({ where: { formation_id: formationId } });
    let created = 0;
    const dateObtention = new Date().toISOString().slice(0, 10);

    for (const link of links) {
      const nomCertification = `Validation — ${quizTitle}`;
      const existing = await this.certificationRepository.findOne({
        where: { utilisateur_id: utilisateurId, competence_id: link.competence_id, nom_certification: nomCertification },
      });
      const certification = existing ?? await this.certificationRepository.save(this.certificationRepository.create({
          utilisateur_id: utilisateurId,
          competence_id: link.competence_id,
          nom_certification: nomCertification,
          organisme: 'RH Manager',
          date_obtention: dateObtention,
          date_expiration: null,
        }));
      const certificateLink = await this.linkCertificationFormationRepository.findOne({
        where: { certification_id: certification.id, formation_id: formationId },
      });
      if (!certificateLink) {
        await this.linkCertificationFormationRepository.save(
          this.linkCertificationFormationRepository.create({
            certification_id: certification.id,
            formation_id: formationId,
          }),
        );
      }
      if (!existing) {
        created++;
      }
    }
    return created;
  }
}
