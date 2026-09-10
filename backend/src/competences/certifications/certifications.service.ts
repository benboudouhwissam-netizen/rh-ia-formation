import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Certification } from '../entities/certification.entity';
import { Formation } from '../../formations/entities/formation.entity';
import { LinkCertificationFormation } from '../../formations/entities/link-certifications-formation.entity';
import { Quiz } from '../../formations/entities/quiz.entity';
import { QuizResult } from '../../formations/entities/quiz-result.entity';
import { FormationCompetence } from '../../formations/entities/formation-competence.entity';
import { CreateCertificationDto } from '../dto/create-certification.dto';
import { UpdateCertificationDto } from '../dto/update-certification.dto';
import { FilterCertificationDto } from '../dto/filter-certification.dto';
import { MinioService } from '../../storage/minio.service';
import { EmployeeAccount } from '../../auth/entities/employee-account.entity';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,

    @InjectRepository(Formation)
    private readonly formationRepository: Repository<Formation>,

    @InjectRepository(LinkCertificationFormation)
    private readonly linkCertificationFormationRepository: Repository<LinkCertificationFormation>,

    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,

    @InjectRepository(QuizResult)
    private readonly quizResultRepository: Repository<QuizResult>,

    @InjectRepository(FormationCompetence)
    private readonly formationCompetenceRepository: Repository<FormationCompetence>,
    private readonly minioService: MinioService,
    @InjectRepository(EmployeeAccount)
    private readonly employeeRepository: Repository<EmployeeAccount>,
  ) {}

  async findAll(filterDto: FilterCertificationDto) {
    const {
      utilisateur_id,
      competence_id,
      limit = 10,
      offset = 0,
    } = filterDto;

    const where: any = {};

    if (utilisateur_id) {
      where.utilisateur_id = utilisateur_id;
    }

    if (competence_id) {
      where.competence_id = competence_id;
    }

    const [data, total] =
      await this.certificationRepository.findAndCount({
        where,
        order: {
          date_obtention: 'DESC',
        },
        take: limit,
        skip: offset,
      });

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const certification =
      await this.certificationRepository.findOne({
        where: {
          id,
        },
      });

    if (!certification) {
      throw new NotFoundException(
        `Certification avec l'id ${id} introuvable`,
      );
    }

    const link = await this.linkCertificationFormationRepository.findOne({
      where: { certification_id: certification.id },
      relations: { formation: true },
    });
    const passedResults = await this.quizResultRepository.find({
      where: { utilisateur_id: certification.utilisateur_id, reussi: true },
      relations: { quiz: true },
      order: { date_passage: 'DESC' },
      take: 20,
    });
    const certificateQuizResult = passedResults.find((result) =>
      certification.nom_certification.includes(result.quiz?.titre ?? ''),
    ) ?? null;
    const formationCompetence = link || certificateQuizResult
      ? null
      : await this.formationCompetenceRepository.findOne({
          where: { competence_id: certification.competence_id },
        });
    const formation = link?.formation
      ?? (certificateQuizResult?.quiz
        ? await this.formationRepository.findOne({ where: { id: certificateQuizResult.quiz.formation_id } })
        : null)
      ?? (formationCompetence
        ? await this.formationRepository.findOne({ where: { id: formationCompetence.formation_id } })
        : null);
    const quiz = formation
      ? await this.quizRepository.findOne({ where: { formation_id: formation.id } })
      : null;
    const resultatQuiz = certificateQuizResult ?? (quiz
      ? await this.quizResultRepository.findOne({
          where: { quiz_id: quiz.id, utilisateur_id: certification.utilisateur_id },
          order: { date_passage: 'DESC' },
        })
      : null);

    const recommandations = await this.formationRepository.find({
      where: { statut: 'active' },
      order: { created_at: 'DESC' },
      take: 4,
    });

    return {
      ...certification,
      formation,
      statistiques: {
        score_quiz: resultatQuiz?.score ?? null,
        score_requis: quiz?.score_requis ?? null,
        date_passage: resultatQuiz?.date_passage ?? null,
        progression: resultatQuiz?.reussi ? 100 : null,
      },
      recommandations: recommandations.filter((item) => item.id !== formation?.id).slice(0, 3),
    };
  }

  async findByUtilisateur(utilisateurId: string) {
    const certifications = await this.certificationRepository.find({
      where: {
        utilisateur_id: utilisateurId,
      },
      order: {
        date_obtention: 'DESC',
      },
    });
    // Ne jamais exposer deux fois le même certificat pendant la transition
    // des anciennes données. La migration 024 empêche désormais la création
    // de nouveaux doublons, mais cette protection reste utile pour les lignes
    // historiques déjà présentes.
    return Array.from(
      new Map(
        certifications.map((item) => [
          `${item.competence_id}|${item.nom_certification}`,
          item,
        ]),
      ).values(),
    );
  }

  async generatePdf(id: string) {
    const certification = await this.findOne(id);
    const score = certification.statistiques.score_quiz;
    const required = certification.statistiques.score_requis;
    if (score === null || (required !== null && score < required)) {
      throw new ForbiddenException('Le quiz n’est pas réussi : certificat indisponible.');
    }
    const title = certification.formation?.titre ?? certification.nom_certification;
    const date = certification.date_obtention;
    const employee = await this.employeeRepository.findOne({ where: { id: certification.utilisateur_id } });
    const employeeName = employee?.nom_complet ?? 'Employé RH IA';
    const duration = certification.formation?.duree ? `${certification.formation.duree} min` : 'Non renseignée';
    const pdf = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 48 });
    const chunks: Buffer[] = [];
    const buffer = new Promise<Buffer>((resolve, reject) => {
      pdf.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);
    });
    pdf.rect(20, 20, 802, 555).fill('#edf1f0');
    pdf.roundedRect(35, 35, 772, 525, 10).fill('#ffffff').stroke('#3e7c74');
    pdf.roundedRect(40, 40, 762, 515, 8).stroke('#3e7c74');
    pdf.roundedRect(385, 75, 72, 72, 8).fill('#1c2b39');
    pdf.fontSize(16).fillColor('#ffffff').text('RH', 385, 104, { width: 72, align: 'center' });
    pdf.fontSize(13).fillColor('#3e7c74').text('C E R T I F I C A T   D E   R É U S S I T E', 0, 185, { width: 842, align: 'center' });
    pdf.moveTo(350, 215).lineTo(492, 215).stroke('#c89b3c');
    pdf.fontSize(13).fillColor('#657681').text('Ce certificat est décerné à', 0, 260, { width: 842, align: 'center' });
    pdf.fontSize(25).fillColor('#1c2b39').text(employeeName, 0, 290, { width: 842, align: 'center' });
    pdf.fontSize(13).fillColor('#657681').text('pour avoir validé avec succès la formation', 0, 345, { width: 842, align: 'center' });
    pdf.fontSize(18).fillColor('#1c2b39').text(title, 0, 375, { width: 842, align: 'center' });
    pdf.fontSize(11).fillColor('#657681').text(`Date d’obtention : ${date}    •    Durée : ${duration}    •    Score : ${score}%`, 0, 425, { width: 842, align: 'center' });
    pdf.moveTo(300, 475).lineTo(542, 475).stroke('#d8e3e1');
    pdf.fontSize(10).fillColor('#657681').text(`Identifiant : RH-IA-${id.slice(0, 8).toUpperCase()}`, 0, 495, { width: 842, align: 'center' });
    pdf.fontSize(11).fillColor('#657681').text('Signature autorisée', 600, 495, { width: 130, align: 'center' });
    pdf.fontSize(14).fillColor('#1c2b39').text('RH IA', 600, 515, { width: 130, align: 'center' });
    pdf.end();
    const content = await buffer;
    const objectKey = `certificate-${id}.pdf`;
    await this.minioService.uploadCertificate(objectKey, content);
    return { content, objectKey, fileName: objectKey };
  }

  async create(createDto: CreateCertificationDto) {
    const certification =
      this.certificationRepository.create(createDto);

    return this.certificationRepository.save(certification);
  }

  async update(
    id: string,
    updateDto: UpdateCertificationDto,
  ) {
    const certification = await this.findOne(id);

    Object.assign(certification, updateDto);

    return this.certificationRepository.save(
      certification,
    );
  }

  async remove(id: string) {
    const certification = await this.findOne(id);

    await this.certificationRepository.remove(
      certification,
    );

    return {
      message: 'Certification deleted successfully',
    };
  }
}
