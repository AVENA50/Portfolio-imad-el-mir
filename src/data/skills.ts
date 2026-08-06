import type { TechSlug } from "@/config/tech-stack";
import type { Accent, IconName } from "@/types";

/**
 * Competenze tecniche (M9-T1).
 *
 * **Niente percentuali, niente stelline.** "Python 85%" non significa
 * niente: nessuno sa cosa distingue 85 da 70, e chi legge profili tecnici
 * quelle barre le salta da anni. Al loro posto una distinzione che si puo
 * verificare:
 *
 * - `proven` — usata in un progetto che sta in questo sito. Chi vuole la
 *   prova clicca e la vede.
 * - `learning` — in programma all'ITS o dentro un progetto pianificato.
 *   Dichiararla allo stesso livello delle altre sarebbe un rischio
 *   inutile: distinguerla mostra che si sa dove si e.
 *
 * Il campo `projects` non e decorativo: e il collegamento fra cio che si
 * dichiara e cio che lo dimostra, ed e la ragione per cui questa pagina
 * vale piu di un elenco.
 */

export type SkillLevel = "proven" | "learning";

export interface Skill {
  /** Nome mostrato. Per le tecnologie con marchio arriva da tech-stack. */
  name: string;
  level: SkillLevel;
  /** Se presente, si disegna il logo del marchio. */
  tech?: TechSlug;
  /** Ripiego quando la competenza non ha un marchio (SQL, REST, ML...). */
  icon?: IconName;
  /** Slug dei progetti che la dimostrano. */
  projects?: readonly string[];
}

export interface SkillGroup {
  /** Chiave del testo nel dizionario (skills.groups.<key>). */
  key: string;
  icon: IconName;
  /**
   * Colore del gruppo.
   *
   * Gli accenti sono gli stessi delle categorie di progetto: cinque gruppi,
   * cinque accenti gia esistenti nel design system. Nessun colore nuovo —
   * il gruppo si riconosce a colpo d'occhio senza aggiungere un dialetto
   * cromatico che poi va mantenuto.
   */
  accent: Accent;
  skills: readonly Skill[];
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    key: "languages",
    accent: "violet",
    icon: "code",
    skills: [
      {
        name: "Python",
        tech: "python",
        level: "proven",
        projects: ["beewatch-ai", "arcadium"],
      },
      { name: "Java", tech: "java", level: "proven", projects: ["arcadium"] },
      {
        name: "JavaScript",
        tech: "javascript",
        level: "proven",
        projects: ["arcadium"],
      },
      {
        name: "SQL",
        icon: "database",
        level: "proven",
        projects: ["arcadium"],
      },
      { name: "TypeScript", tech: "typescript", level: "learning" },
    ],
  },
  {
    key: "frontend",
    accent: "cyan",
    icon: "layers",
    skills: [
      { name: "HTML", tech: "html", level: "proven" },
      { name: "CSS", tech: "css", level: "proven" },
      { name: "React", tech: "react", level: "proven", projects: ["arcadium"] },
      {
        name: "Next.js",
        tech: "nextjs",
        level: "proven",
        projects: ["arcadium"],
      },
      { name: "Streamlit", tech: "streamlit", level: "proven" },
    ],
  },
  {
    key: "backend",
    accent: "indigo",
    icon: "server",
    skills: [
      {
        name: "Spring Boot",
        tech: "spring",
        level: "proven",
        projects: ["arcadium"],
      },
      {
        name: "REST API",
        icon: "route",
        level: "proven",
        projects: ["arcadium"],
      },
      {
        name: "JWT e autenticazione",
        icon: "lock",
        level: "proven",
        projects: ["arcadium"],
      },
      { name: "Node.js", tech: "nodejs", level: "learning" },
    ],
  },
  {
    key: "data",
    accent: "blue",
    icon: "database",
    skills: [
      {
        name: "PostgreSQL",
        tech: "postgres",
        level: "proven",
        projects: ["arcadium"],
      },
      {
        name: "MySQL",
        tech: "mysql",
        level: "proven",
        projects: ["beewatch-ai"],
      },
      {
        name: "pandas",
        tech: "pandas",
        level: "proven",
        projects: ["beewatch-ai"],
      },
      {
        name: "scikit-learn",
        tech: "scikit",
        level: "proven",
        projects: ["beewatch-ai"],
      },
      {
        name: "ETL",
        icon: "workflow",
        level: "proven",
        projects: ["arcadium"],
      },
      { name: "NumPy", tech: "numpy", level: "learning" },
      { name: "dbt", tech: "dbt", level: "learning" },
      { name: "Prefect", tech: "prefect", level: "learning" },
      { name: "Metabase", tech: "metabase", level: "learning" },
      { name: "Plotly", tech: "plotly", level: "learning" },
      { name: "NoSQL", icon: "boxes", level: "learning" },
    ],
  },
  {
    key: "devops",
    accent: "teal",
    icon: "container",
    skills: [
      {
        name: "Docker",
        tech: "docker",
        level: "proven",
        projects: ["arcadium", "beewatch-ai"],
      },
      { name: "Git", tech: "git", level: "proven" },
      {
        name: "GitHub Actions",
        tech: "github",
        level: "proven",
        projects: ["beewatch-ai"],
      },
      { name: "Linux", tech: "linux", level: "proven" },
      { name: "Cloud", icon: "globe", level: "proven" },
    ],
  },
];
