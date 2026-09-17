import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type ChatbotAction = { label: string; url: string };

@Injectable()
export class ChatbotService {
  constructor(private readonly dataSource: DataSource) {}

  async answer(utilisateurId: string, message: string) {
    const normalized = message
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (!utilisateurId) {
      const publicMessage = message
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      if (
        /(difference|différence|comparer|comparaison)/.test(publicMessage) &&
        /(e-learning|elearning|presentiel|en ligne)/.test(publicMessage)
      ) {
        return {
          message:
            'Le e-learning se suit en ligne, à votre rythme, depuis la plateforme. Le présentiel se déroule dans une salle à une date fixée par le manager, avec un nombre de places limité.',
          actions: [{ label: 'Voir le catalogue', url: '/' }],
        };
      }
      if (/(inscri|inscription|inscrire)/.test(publicMessage)) {
        return {
          message:
            'Pour vous inscrire, ouvrez le catalogue, choisissez une formation puis cliquez sur une session ou sur le bouton d’inscription. Les formations présentielles affichent directement la date, la salle et les places restantes.',
          actions: [{ label: 'Ouvrir le catalogue', url: '/' }],
        };
      }
      if (
        /(recommand|populaire|populaires|conseille|suggere|suggerees|adapte|poste)/.test(
          publicMessage,
        )
      ) {
        const formations = await this.popularFormations();
        const liste = formations.length
          ? formations
              .map(
                (formation) =>
                  `• ${formation.titre} (${formation.niveau ?? 'niveau à définir'})`,
              )
              .join('\n')
          : 'Consultez le catalogue pour découvrir les formations disponibles.';
        return {
          message: `Voici les formations populaires du catalogue :\n${liste}`,
          actions: formations.map((formation) => ({
            label: formation.titre,
            url: `/formations/${formation.id}`,
          })),
        };
      }
      const formations = await this.searchPublicFormations(message);
      if (formations) {
        const liste = formations.length
          ? formations
              .map(
                (formation) =>
                  `• ${formation.titre} (${formation.niveau ?? 'niveau à définir'})`,
              )
              .join('\n')
          : 'Aucune formation ne correspond à ces critères pour le moment.';
        return {
          message: `Voici les formations correspondant à votre recherche :\n${liste}`,
          actions: formations.slice(0, 5).map((formation) => ({
            label: formation.titre,
            url: `/formations/${formation.id}`,
          })),
        };
      }
      return {
        message:
          'Je peux vous renseigner sur les formations, les modalités présentiel/e-learning et le fonctionnement de la plateforme. Connectez-vous pour obtenir des recommandations liées à votre poste, votre profil ou vos certificats.',
        actions: [
          { label: 'Voir les formations', url: '/' },
          { label: 'Se connecter', url: '/connexion' },
        ],
      };
    }

    const employee = await this.dataSource.query(
      'SELECT nom_complet, poste_id, job_title FROM employee_accounts WHERE id = $1',
      [utilisateurId],
    );

    if (!employee[0]) {
      return {
        message:
          'Votre session employé est introuvable. Reconnectez-vous pour continuer.',
        actions: [{ label: 'Se connecter', url: '/connexion' }],
      };
    }

    if (/(difference|différence|comparer|comparaison)/.test(normalized) && /(e-learning|elearning|presentiel|en ligne)/.test(normalized)) {
      return {
        message: 'Le e-learning se suit en ligne, à votre rythme, depuis la plateforme. Le présentiel se déroule dans une salle à une date fixée par le manager, avec un nombre de places limité.',
        actions: [{ label: 'Voir le catalogue', url: '/' }],
      };
    }

    const formatFormationList = (formations: Array<{ id: string; titre: string; niveau?: string }>, introduction: string) => ({
      message: `${introduction}\n${formations.length ? formations.map((formation) => `• ${formation.titre} (${formation.niveau ?? 'niveau à définir'})`).join('\n') : 'Aucune formation ne correspond à votre recherche pour le moment.'}`,
      actions: formations.slice(0, 5).map((formation) => ({ label: formation.titre, url: `/formations/${formation.id}` })),
    });
    if (/(formation|formations)/.test(normalized) && /populaire|presentiel|présentiel|e-learning|elearning/.test(normalized)) {
      if (/populaire/.test(normalized)) return formatFormationList(await this.popularFormations(), 'Voici les formations populaires du catalogue :');
      if (/presentiel|présentiel/.test(normalized)) return formatFormationList(await this.searchFormations({ modalite: 'presentiel' }), 'Voici les formations présentielles disponibles :');
      return formatFormationList(await this.searchFormations({ modalite: 'e_learning' }), 'Voici les formations e-learning disponibles :');
    }

    if (/(profil|informations personnelles|modifier)/.test(normalized)) {
      return {
        message:
          'Pour modifier vos informations, ouvrez votre profil puis cliquez sur « Modifier ». Vous pourrez ensuite enregistrer vos changements.',
        actions: [{ label: 'Ouvrir mon profil', url: '/profil' }],
      };
    }

    if (/(certificat|certificate|telecharger|telecharge)/.test(normalized)) {
      return {
        message:
          'Vos certificats sont disponibles dans « Mes formations ». Ouvrez un certificat pour consulter ses détails ou télécharger le PDF.',
        actions: [{ label: 'Voir mes formations', url: '/' }],
      };
    }

    if (/(matrice|graphe|graphique|competence|ecart)/.test(normalized)) {
      return {
        message:
          'La matrice compare vos compétences actuelles au niveau attendu pour votre poste. Les écarts indiquent les compétences à renforcer ; le graphe résume visuellement vos niveaux et vos priorités de progression.',
        actions: [{ label: 'Voir mes compétences', url: '/competences' }],
      };
    }

    if (
      /(presentiel|présentiel|sur place|salle|en presentiel)/.test(
        normalized,
      ) &&
      !/(niveau|categorie|catégorie)/.test(normalized)
    ) {
      return {
        message:
          'Les formations présentielles se déroulent dans une salle à la date fixée par le manager. Ouvrez une formation pour voir la date, la salle et les places restantes, puis inscrivez-vous à la session proposée.',
        actions: [{ label: 'Voir les formations présentielles', url: '/' }],
      };
    }

    if (
      /(e-learning|elearning|en ligne|à distance|a distance|en ligne)/.test(
        normalized,
      ) &&
      !/(niveau|categorie|catégorie)/.test(normalized)
    ) {
      return {
        message:
          'Les formations e-learning se suivent directement en ligne à votre rythme. Depuis le catalogue, ouvrez une formation e-learning puis cliquez sur le bouton d’accès au parcours après votre inscription.',
        actions: [{ label: 'Voir les formations e-learning', url: '/' }],
      };
    }

    if (/(inscri|inscription|inscrire|session)/.test(normalized)) {
      return {
        message:
          'Ouvrez une formation dans le catalogue, choisissez une session programmée, puis cliquez sur « S’inscrire ». Pour une formation présentielle, la date et la salle sont déjà décidées par le manager.',
        actions: [{ label: 'Ouvrir le catalogue', url: '/' }],
      };
    }

    const listeFormations = (formations: Array<{ id: string; titre: string; niveau?: string }>, introduction: string) => ({
      message: `${introduction}\n${formations.length ? formations.map((formation) => `• ${formation.titre} (${formation.niveau ?? 'niveau à définir'})`).join('\n') : 'Aucune formation ne correspond à votre recherche pour le moment.'}`,
      actions: formations.slice(0, 5).map((formation) => ({ label: formation.titre, url: `/formations/${formation.id}` })),
    });
    if (/(populaire|populaires)/.test(normalized)) {
      return listeFormations(await this.popularFormations(), 'Voici les formations populaires du catalogue :');
    }
    if (/(presentiel|présentiel)/.test(normalized)) {
      return listeFormations(await this.searchFormations({ modalite: 'presentiel' }), 'Voici les formations présentielles disponibles :');
    }
    if (/(e-learning|elearning)/.test(normalized)) {
      return listeFormations(await this.searchFormations({ modalite: 'e_learning' }), 'Voici les formations e-learning disponibles :');
    }

    const niveauDemande = normalized.includes('debutant')
      ? 'Débutant'
      : normalized.includes('intermediaire')
        ? 'Intermédiaire'
        : normalized.includes('avance')
          ? 'Avancé'
          : undefined;
    const modaliteDemande = normalized.includes('presentiel')
      ? 'presentiel'
      : normalized.includes('e-learning') ||
          normalized.includes('elearning') ||
          normalized.includes('en ligne')
        ? 'e_learning'
        : undefined;
    const categorieDemande = normalized.includes('cybersecurite')
      ? 'Cybersécurité'
      : normalized.includes('reseau')
        ? 'Réseaux'
        : normalized.includes('intelligence artificielle')
          ? 'Intelligence artificielle'
          : normalized.includes('base de donnees')
            ? 'Bases de données'
            : normalized.includes('gestion de projet')
              ? 'Gestion de projet'
              : normalized.includes('backend')
                ? 'Backend'
                : normalized.includes('frontend')
                  ? 'Frontend'
                  : normalized.includes('informatique')
                    ? 'informatique'
                    : undefined;
    if (niveauDemande || modaliteDemande || categorieDemande) {
      const formations = await this.searchFormations({
        niveau: niveauDemande,
        modalite: modaliteDemande,
        categorie: categorieDemande,
      });
      const liste = formations.length
        ? formations
            .map(
              (formation) =>
                `• ${formation.titre} (${formation.niveau ?? 'niveau à définir'})`,
            )
            .join('\n')
        : 'Aucune formation ne correspond à ces critères pour le moment.';
      return {
        message: `Voici les formations${modaliteDemande ? ` en ${modaliteDemande === 'presentiel' ? 'présentiel' : 'e-learning'}` : ''}${niveauDemande ? ` de niveau ${niveauDemande}` : ''}${categorieDemande ? ` dans la catégorie ${categorieDemande}` : ''} :\n${liste}`,
        actions: formations.slice(0, 5).map((formation) => ({
          label: formation.titre,
          url: `/formations/${formation.id}`,
        })),
      };
    }

    if (
      /(populaire|populaires|recommande|conseille|adapte|poste|profil)/.test(
        normalized,
      )
    ) {
      const formations = await this.recommendedFormations(
        utilisateurId,
        employee[0].poste_id,
      );
      if (formations.length === 0) {
        return {
          message:
            'Je ne trouve pas encore de recommandation personnalisée. Consultez le catalogue pour découvrir les formations disponibles.',
          actions: [{ label: 'Voir le catalogue', url: '/' }],
        };
      }
      const liste = formations
        .map(
          (formation) =>
            `• ${formation.titre} (${formation.niveau ?? 'niveau à définir'})`,
        )
        .join('\n');
      return {
        message: `Pour votre profil${employee[0].job_title ? ` (${employee[0].job_title})` : ''}, je vous recommande :\n${liste}\n\nCes suggestions tiennent compte des compétences liées à votre poste et de la popularité des formations.`,
        actions: formations.slice(0, 3).map((formation) => ({
          label: formation.titre,
          url: `/formations/${formation.id}`,
        })),
      };
    }

    const platformQuestion =
      /(formation|cours|catalogue|competence|matrice|graphe|profil|certificat|inscri|session|quiz|plateforme|connexion|compte|notification|salle|presentiel|e-learning|apprendre)/.test(
        normalized,
      );
    if (!platformQuestion) {
      return {
        message:
          'Je suis l’assistant RH et je réponds uniquement aux questions liées à la plateforme, aux formations et à la gestion des compétences.',
        actions: [{ label: 'Voir les formations', url: '/' }],
      };
    }

    if (platformQuestion) {
      return {
        message:
          'Je ne peux pas répondre précisément à cette demande pour le moment. Veuillez contacter le responsable RH pour obtenir de l’aide.',
        actions: [{ label: 'Contacter le responsable', url: '/support' }],
      };
    }

    return {
      message:
        'Je peux vous aider à trouver une formation, modifier votre profil, vous inscrire à une session, obtenir un certificat ou comprendre votre matrice de compétences. Que souhaitez-vous faire ?',
      actions: [
        { label: 'Formations recommandées', url: '/' },
        { label: 'Modifier mon profil', url: '/profil' },
        { label: 'Comprendre mes compétences', url: '/competences' },
      ],
    };
  }

  private recommendedFormations(utilisateurId: string, posteId: string) {
    return this.dataSource.query(
      `SELECT f.id, f.titre, f.niveau, COUNT(DISTINCT e.id)::int AS inscriptions,
        MAX(CASE WHEN ec.id IS NULL OR ec.niveau < fc.niveau_vise THEN 1 ELSE 0 END) AS correspond_a_un_ecart
       FROM formations f
       JOIN formation_competences fc ON fc.formation_id = f.id
       LEFT JOIN competence_matrices cm ON cm.competence_id = fc.competence_id AND cm.poste_id = $2
       LEFT JOIN employee_competences ec ON ec.competence_id = fc.competence_id AND ec.utilisateur_id = $1
       LEFT JOIN training_sessions ts ON ts.formation_id = f.id
       LEFT JOIN enrollments e ON e.training_session_id = ts.id
       WHERE f.statut = 'active' AND (cm.id IS NOT NULL OR e.id IS NOT NULL)
       GROUP BY f.id, f.titre, f.niveau
       ORDER BY correspond_a_un_ecart DESC, inscriptions DESC, f.titre ASC
       LIMIT 5`,
      [utilisateurId, posteId],
    );
  }

  private searchFormations(filters: {
    niveau?: string;
    modalite?: string;
    categorie?: string;
  }) {
    const conditions = [`f.statut = 'active'`];
    const values: string[] = [];
    if (filters.niveau) {
      values.push(filters.niveau);
      conditions.push(`f.niveau = $${values.length}`);
    }
    if (filters.modalite) {
      values.push(filters.modalite);
      conditions.push(`f.modalite = $${values.length}`);
    }
    if (filters.categorie === 'informatique') {
      conditions.push(
        "LOWER(f.categorie) IN ('backend', 'frontend', 'réseaux', 'cybersécurité', 'intelligence artificielle', 'bases de données')",
      );
    } else if (filters.categorie) {
      values.push(`%${filters.categorie}%`);
      conditions.push(`LOWER(f.categorie) LIKE LOWER($${values.length})`);
    }
    return this.dataSource.query(
      `SELECT f.id, f.titre, f.niveau, f.categorie, f.modalite FROM formations f WHERE ${conditions.join(' AND ')} ORDER BY f.titre ASC LIMIT 8`,
      values,
    );
  }

  private async searchPublicFormations(message: string) {
    const normalized = message
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const niveau = normalized.includes('debutant')
      ? 'Débutant'
      : normalized.includes('intermediaire')
        ? 'Intermédiaire'
        : normalized.includes('avance')
          ? 'Avancé'
          : undefined;
    const modalite = normalized.includes('presentiel')
      ? 'presentiel'
      : normalized.includes('e-learning') ||
          normalized.includes('elearning') ||
          normalized.includes('en ligne')
        ? 'e_learning'
        : undefined;
    const categories = await this.dataSource.query(
      'SELECT DISTINCT categorie FROM formations WHERE categorie IS NOT NULL',
    );
    const categorie = categories
      .map((row: { categorie: string }) => row.categorie)
      .find((value: string) => {
        const key = value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        return normalized.includes(key);
      });
    if (!niveau && !modalite && !categorie) return null;
    return this.searchFormations({ niveau, modalite, categorie });
  }

  private popularFormations() {
    return this.dataSource.query(
      `SELECT f.id, f.titre, f.niveau, COUNT(e.id)::int AS inscriptions
       FROM formations f
       LEFT JOIN training_sessions ts ON ts.formation_id = f.id
       LEFT JOIN enrollments e ON e.training_session_id = ts.id
       WHERE f.statut = 'active'
       GROUP BY f.id, f.titre, f.niveau
       ORDER BY inscriptions DESC, f.titre ASC
       LIMIT 5`,
    );
  }
}
