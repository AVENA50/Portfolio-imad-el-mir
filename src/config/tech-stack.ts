/**
 * Registro delle tecnologie.
 *
 * Fonte unica per nome e colore di ogni tecnologia. Serve a tre posti che
 * altrimenti divergerebbero: l'orbita dell'hero (M8-T4), il componente
 * TechIcon e lo stack tecnologico dei case study (M7-T7).
 *
 * Il tipo `Record<TechSlug, Tech>` e la chiave: se aggiungi uno slug a
 * TECH_SLUGS e dimentichi la voce nell'oggetto, TypeScript non compila.
 * Impossibile avere una tecnologia senza nome o senza colore.
 *
 * Nota rispetto al documento di struttura: li ogni tecnologia aveva un
 * campo `icon` con il percorso di un SVG in /public. Qui non c'e, perche
 * i glifi arrivano da react-icons — marchi ufficiali, gia ottimizzati e
 * tree-shaken. Il collegamento slug -> glifo vive in components/shared/
 * tech-icon.tsx, che e l'unico file da toccare per cambiare libreria.
 */

export const TECH_SLUGS = [
  // Linguaggi
  "typescript",
  "javascript",
  "python",
  "java",
  // Frontend
  "react",
  "nextjs",
  "tailwind",
  // Backend
  "nodejs",
  "spring",
  "fastapi",
  // Dati
  "postgres",
  "mysql",
  "mongodb",
  "pandas",
  "numpy",
  "scikit",
  "tensorflow",
  "streamlit",
  "plotly",
  "dbt",
  "prefect",
  "metabase",
  // DevOps
  "docker",
  "git",
  "github",
  "vercel",
  "linux",
] as const;

export type TechSlug = (typeof TECH_SLUGS)[number];

export type TechGroup = "language" | "frontend" | "backend" | "data" | "devops";

export interface Tech {
  slug: TechSlug;
  name: string;
  group: TechGroup;
  /** Colore del marchio, usato per glow e bordi. */
  color: string;
}

export const TECH_STACK: Record<TechSlug, Tech> = {
  typescript: {
    slug: "typescript",
    name: "TypeScript",
    group: "language",
    color: "#3178C6",
  },
  javascript: {
    slug: "javascript",
    name: "JavaScript",
    group: "language",
    color: "#F7DF1E",
  },
  python: {
    slug: "python",
    name: "Python",
    group: "language",
    color: "#3776AB",
  },
  java: { slug: "java", name: "Java", group: "language", color: "#EA2D2E" },

  react: { slug: "react", name: "React", group: "frontend", color: "#61DAFB" },
  nextjs: {
    slug: "nextjs",
    name: "Next.js",
    group: "frontend",
    color: "#FFFFFF",
  },
  tailwind: {
    slug: "tailwind",
    name: "Tailwind CSS",
    group: "frontend",
    color: "#38BDF8",
  },

  nodejs: {
    slug: "nodejs",
    name: "Node.js",
    group: "backend",
    color: "#5FA04E",
  },
  spring: {
    slug: "spring",
    name: "Spring Boot",
    group: "backend",
    color: "#6DB33F",
  },
  fastapi: {
    slug: "fastapi",
    name: "FastAPI",
    group: "backend",
    color: "#009688",
  },

  postgres: {
    slug: "postgres",
    name: "PostgreSQL",
    group: "data",
    color: "#4169E1",
  },
  mysql: { slug: "mysql", name: "MySQL", group: "data", color: "#4479A1" },
  mongodb: {
    slug: "mongodb",
    name: "MongoDB",
    group: "data",
    color: "#47A248",
  },
  pandas: { slug: "pandas", name: "pandas", group: "data", color: "#E70488" },
  numpy: { slug: "numpy", name: "NumPy", group: "data", color: "#4DABCF" },
  scikit: {
    slug: "scikit",
    name: "scikit-learn",
    group: "data",
    color: "#F7931E",
  },
  tensorflow: {
    slug: "tensorflow",
    name: "TensorFlow",
    group: "data",
    color: "#FF6F00",
  },
  streamlit: {
    slug: "streamlit",
    name: "Streamlit",
    group: "data",
    color: "#FF4B4B",
  },
  plotly: { slug: "plotly", name: "Plotly", group: "data", color: "#7A76FF" },
  dbt: { slug: "dbt", name: "dbt", group: "data", color: "#FF694B" },
  prefect: {
    slug: "prefect",
    name: "Prefect",
    group: "data",
    color: "#0052FF",
  },
  metabase: {
    slug: "metabase",
    name: "Metabase",
    group: "data",
    color: "#509EE3",
  },

  docker: { slug: "docker", name: "Docker", group: "devops", color: "#2496ED" },
  git: { slug: "git", name: "Git", group: "devops", color: "#F05032" },
  github: { slug: "github", name: "GitHub", group: "devops", color: "#FFFFFF" },
  vercel: { slug: "vercel", name: "Vercel", group: "devops", color: "#FFFFFF" },
  linux: { slug: "linux", name: "Linux", group: "devops", color: "#FCC624" },
};

export const getTech = (slug: TechSlug): Tech => TECH_STACK[slug];

export const getTechByGroup = (group: TechGroup): Tech[] =>
  Object.values(TECH_STACK).filter((tech) => tech.group === group);

/** Type guard per gli slug che arrivano dal frontmatter o dalla URL. */
export function isTechSlug(value: string): value is TechSlug {
  return (TECH_SLUGS as readonly string[]).includes(value);
}
