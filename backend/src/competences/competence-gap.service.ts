import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeCompetence } from './entities/employee-competence.entity';
import { CompetenceMatrice } from './entities/competence-matrice.entity';
import { Formation } from '../formations/entities/formation.entity';

@Injectable()
export class CompetenceGapService {
  constructor(
    @InjectRepository(EmployeeCompetence)
    private readonly employeeCompetenceRepository: Repository<EmployeeCompetence>,

    @InjectRepository(CompetenceMatrice)
    private readonly competenceMatriceRepository: Repository<CompetenceMatrice>,

    @InjectRepository(Formation)
    private readonly formationRepository: Repository<Formation>,
  ) {}

  async getCompetenceGaps(
    utilisateurId: string,
    posteId: string,
  ) {
    const currentCompetences =
      await this.employeeCompetenceRepository.find({
        where: {
          utilisateur_id: utilisateurId,
        },
        relations: {
          competence: true,
        },
      });

    const requiredCompetences =
      await this.competenceMatriceRepository.find({
        where: {
          poste_id: posteId,
        },
        relations: {
          competence: true,
        },
      });

    // Seuil à partir duquel on considère qu'une compétence différente
    // couvre sémantiquement le besoin (ex: "React" ≈ "Frontend Development")
    const SEUIL_SIMILARITE = 0.8;

    const gaps = await Promise.all(
      requiredCompetences.map(async (required) => {
        // 1. Correspondance exacte : l'employé possède-t-il déjà cette compétence ?
        const exactMatch = currentCompetences.find(
          (item) => item.competence_id === required.competence_id,
        );

        // 2. Comparaison sémantique via pgvector : recherche, parmi les
        // compétences actuelles de l'employé, celle la plus proche
        // vectoriellement de la compétence exigée (hors correspondance exacte).
        let competenceProche: {
          competence_id: string;
          competence_nom: string;
          niveau: number;
          similarite: number;
        } | null = null;

        if (required.competence?.embedding && currentCompetences.length > 0) {
          const vector = `[${required.competence.embedding.join(',')}]`;

          const resultats = await this.employeeCompetenceRepository.query(
            `
            SELECT
              ec.competence_id,
              c.nom AS competence_nom,
              ec.niveau,
              1 - (c.embedding <=> $1::vector) AS similarite
            FROM employee_competences ec
            JOIN competences c ON c.id = ec.competence_id
            WHERE ec.utilisateur_id = $2
              AND c.embedding IS NOT NULL
              AND ec.competence_id != $3
            ORDER BY c.embedding <=> $1::vector
            LIMIT 1
            `,
            [vector, utilisateurId, required.competence_id],
          );

          if (resultats.length > 0 && Number(resultats[0].similarite) >= SEUIL_SIMILARITE) {
            competenceProche = {
              competence_id: resultats[0].competence_id,
              competence_nom: resultats[0].competence_nom,
              niveau: resultats[0].niveau,
              similarite: Number(resultats[0].similarite),
            };
          }
        }

        const currentLevel = exactMatch?.niveau ?? 0;
        const requiredLevel = required.niveau_requis;

        return {
          competence_id: required.competence_id,
          competence: required.competence,
          current_level: currentLevel,
          required_level: requiredLevel,
          gap: Math.max(requiredLevel - currentLevel, 0),
          missing: currentLevel < requiredLevel,
          // Compétence proche détectée via pgvector, si l'employé n'a pas
          // la compétence exacte mais une compétence sémantiquement proche
          competence_proche: exactMatch ? null : competenceProche,
        };
      }),
    );

    const gapsDetectes = gaps.filter((item) => item.missing);

    return {
      utilisateur_id: utilisateurId,
      poste_id: posteId,
      current_competences: currentCompetences,
      required_competences: requiredCompetences,
      gaps: gapsDetectes,
    };
  }

  async getTopRecommendedFormations(
    utilisateurId: string,
    posteId: string,
  ) {
    const { gaps } = await this.getCompetenceGaps(
      utilisateurId,
      posteId,
    );

    // Étape 1 : pour chaque écart (compétence manquante), on récupère
    // ses meilleures formations candidates, triées par similarité
    // décroissante. On garde ces listes SÉPARÉES par compétence
    // (au lieu de tout fusionner tout de suite) pour pouvoir ensuite
    // faire un tirage équilibré entre compétences.
    const candidatsParCompetence: {
      competenceId: string;
      candidats: any[];
    }[] = [];

    for (const gap of gaps) {
      const competence = gap.competence;

      if (!competence?.embedding) {
        continue;
      }

      const vector = `[${competence.embedding.join(',')}]`;

      const formations = await this.formationRepository.query(
        `
        SELECT
          f.id,
          f.titre,
          f.description,
          f.categorie,
          f.duree,
          f.statut,
          f.niveau,
          1 - (f.embedding <=> $1::vector) AS similarity
        FROM formations f
        WHERE f.embedding IS NOT NULL
          AND f.statut = 'active'
        ORDER BY f.embedding <=> $1::vector
        LIMIT 5
        `,
        [vector],
      );

      const candidats = formations.map((formation: any) => ({
        formation_id: formation.id,
        titre: formation.titre,
        description: formation.description,
        categorie: formation.categorie,
        duree: formation.duree,
        niveau: formation.niveau,

        score_pertinence: Number(formation.similarity),

        competence_id: gap.competence_id,
        competence_nom: competence.nom,

        current_level: gap.current_level,
        required_level: gap.required_level,
        gap: gap.gap,

        motif: `Recommandée pour combler l'écart sur "${competence.nom}" (niveau ${gap.current_level} → ${gap.required_level})`,
      }));

      if (candidats.length > 0) {
        candidatsParCompetence.push({
          competenceId: gap.competence_id,
          candidats,
        });
      }
    }

    // Étape 2 : ordonne les compétences par leur meilleur score
    // (celle dont la meilleure formation est la plus pertinente passe
    // en premier dans le tirage round-robin)
    candidatsParCompetence.sort(
      (a, b) => b.candidats[0].score_pertinence - a.candidats[0].score_pertinence,
    );

    // Étape 3 : round-robin — on prend une formation par compétence,
    // à tour de rôle, plutôt qu'un simple top 5 global qui pourrait
    // être écrasé par une seule compétence dominante.
    const dejaChoisi = new Set<string>();
    const top5: any[] = [];
    let tour = 0;

    while (
      top5.length < 5 &&
      candidatsParCompetence.some((c) => c.candidats.length > tour)
    ) {
      for (const { candidats } of candidatsParCompetence) {
        if (top5.length >= 5) break;

        const candidat = candidats[tour];
        if (candidat && !dejaChoisi.has(candidat.formation_id)) {
          top5.push(candidat);
          dejaChoisi.add(candidat.formation_id);
        }
      }
      tour++;
    }

    return {
      utilisateur_id: utilisateurId,
      poste_id: posteId,
      recommandations: top5,
    };
  }
}