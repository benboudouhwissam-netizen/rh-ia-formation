'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

type Notice = {
  id: string;
  message: string;
  created_at: string;
  href?: string;
  priority?: number;
};

type LearningTask = {
  id: string;
  message: string;
  created_at: string;
};

type PerformanceEvent = {
  id: string;
  type: string;
  created_at: string;
};

type Enrollment = {
  id: string;
  training_session?: {
    date_debut: string;
  };
};

type EnrollmentResponse = {
  data?: Enrollment[];
};

type Certification = {
  id: string;
  nom_certification: string;
  date_obtention: string;
};

export function NotificationCenter() {
  const { employee } = useAuth();

  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!employee) {
      setNotices([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const [
          tasksResponse,
          eventsResponse,
          enrollmentsResponse,
          certificationsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/learning-tasks?utilisateur_id=${employee.id}`,
          ),

          fetch(
            `${API_URL}/performance-events?utilisateur_id=${employee.id}`,
          ),

          fetch(
            `${API_URL}/enrollments?utilisateur_id=${employee.id}&limit=20`,
          ),

          fetch(
            `${API_URL}/certifications/utilisateur/${employee.id}`,
          ),
        ]);

        const tasks: LearningTask[] = tasksResponse.ok
          ? await tasksResponse.json()
          : [];

        const events: PerformanceEvent[] = eventsResponse.ok
          ? await eventsResponse.json()
          : [];

        const enrollmentsResponseData: EnrollmentResponse =
          enrollmentsResponse.ok
            ? await enrollmentsResponse.json()
            : { data: [] };

        const certifications: Certification[] =
          certificationsResponse.ok
            ? await certificationsResponse.json()
            : [];

        /*
         * ---------------------------------------------------------
         * 1. TÂCHES D'APPRENTISSAGE
         * ---------------------------------------------------------
         */

        const taskNotices: Notice[] = tasks.map((item) => ({
          id: `task-${item.id}`,
          message: item.message,
          created_at: item.created_at,
        }));

        /*
         * ---------------------------------------------------------
         * 2. ÉVÉNEMENTS PERFORMANCE
         * ---------------------------------------------------------
         */

        const eventNotices: Notice[] = events.map((item) => {
          let message = 'Nouvel événement disponible.';

          if (item.type === 'quiz_termine') {
            message =
              'Quiz terminé : votre résultat est disponible.';
          } else if (item.type === 'inscription_formation') {
            message =
              'Inscription à une formation confirmée.';
          } else if (item.type === 'profil_modifie') {
            message = 'Profil mis à jour avec succès.';
          } else if (item.type === 'competence_mise_a_jour') {
            message = 'Vos compétences ont été mises à jour.';
          }

          return {
            id: `event-${item.id}`,
            message,
            created_at: item.created_at,
          };
        });

        /*
         * ---------------------------------------------------------
         * 3. SESSIONS DE FORMATION
         * ---------------------------------------------------------
         */

        const sessionNotices: Notice[] = (
          enrollmentsResponseData.data ?? []
        )
          .filter(
            (item) =>
              item.training_session?.date_debut,
          )
          .map((item) => ({
            id: `session-${item.id}`,
            message: `Session prévue le ${new Date(
              item.training_session!.date_debut,
            ).toLocaleDateString('fr-FR')} : votre quiz sera disponible après la formation.`,
            created_at:
              item.training_session!.date_debut,
          }));

        /*
         * ---------------------------------------------------------
         * 4. CERTIFICATIONS
         *
         * C'est ici que nous ajoutons le lien vers le certificat.
         * ---------------------------------------------------------
         */

        const certificateNotices: Notice[] =
          certifications.map((item) => ({
            id: `certificate-${item.id}`,

            message: `Certificat reçu : ${item.nom_certification}.`,

            created_at: item.date_obtention,

            // IMPORTANT :
            // clic sur la notification => page du certificat
            href: `/certifications/${item.id}`,
            priority: 1,
          }));

        /*
         * ---------------------------------------------------------
         * 5. FUSION + TRI
         * ---------------------------------------------------------
         */

        const allNotices = [
          ...taskNotices,
          ...eventNotices,
          ...sessionNotices,
          ...certificateNotices,
        ];

        allNotices.sort((a, b) =>
          (b.priority ?? 0) - (a.priority ?? 0) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setNotices(allNotices.slice(0, 20));
      } catch (error) {
        console.error(
          'Erreur lors du chargement des notifications :',
          error,
        );

        setNotices([]);
      }
    };

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30_000);
    return () => window.clearInterval(timer);
  }, [employee, refreshKey]);

  /*
   * -----------------------------------------------------------
   * ÉCOUTE DES ÉVÉNEMENTS DE RAFRAÎCHISSEMENT
   * -----------------------------------------------------------
   */

  useEffect(() => {
    if (!employee) {
      return;
    }

    const refresh = () => {
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener(
      'rh-notifications-refresh',
      refresh,
    );

    return () => {
      window.removeEventListener(
        'rh-notifications-refresh',
        refresh,
      );
    };
  }, [employee]);

  /*
   * -----------------------------------------------------------
   * CLIC SUR UNE NOTIFICATION
   * -----------------------------------------------------------
   */

  const handleNoticeClick = () => {
    setOpen(false);
  };

  /*
   * -----------------------------------------------------------
   * AFFICHAGE
   * -----------------------------------------------------------
   */

  return (
    <div className="relative">
      {/* BOUTON NOTIFICATIONS */}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-encre hover:bg-sauge-50"
        aria-label="Ouvrir les notifications"
        aria-expanded={open}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-[1.8]">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {notices.length > 0 && (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-alerte"
            aria-label="Nouvelles notifications"
          />
        )}
      </button>

      {/* PANNEAU */}

      {open && (
        <section
          className="absolute right-0 top-11 z-30 w-80 rounded-lg border border-ardoise/12 bg-white p-3 shadow-lg"
          aria-label="Notifications"
        >
          <h2 className="font-heading text-base font-semibold text-encre">
            Notifications
          </h2>

          {notices.length === 0 ? (
            <p className="mt-3 font-body text-sm text-ardoise">
              Aucune notification pour le moment.
            </p>
          ) : (
            <ul className="mt-3 max-h-[400px] space-y-2 overflow-y-auto pr-1">
              {notices.map((notice) => (
                <li key={notice.id}>
                  {notice.href ? (
                    /*
                     * ------------------------------------------------
                     * NOTIFICATION CLIQUABLE
                     * ------------------------------------------------
                     */

                    <a
                      href={notice.href}
                      onClick={handleNoticeClick}
                      className="block rounded-lg bg-sauge-50 p-3 transition hover:bg-sauge-100 focus:outline-none focus:ring-2 focus:ring-sauge-300"
                    >
                      <p className="font-body text-sm text-encre">
                        {notice.message}
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-ardoise">
                        {new Date(
                          notice.created_at,
                        ).toLocaleDateString('fr-FR')}
                      </p>

                      <p className="mt-2 font-body text-xs font-medium text-encre">
                        Voir le certificat →
                      </p>
                    </a>
                  ) : (
                    /*
                     * ------------------------------------------------
                     * NOTIFICATION NON CLIQUABLE
                     * ------------------------------------------------
                     */

                    <div className="rounded-lg bg-sauge-50 p-3">
                      <p className="font-body text-sm text-encre">
                        {notice.message}
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-ardoise">
                        {new Date(
                          notice.created_at,
                        ).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
