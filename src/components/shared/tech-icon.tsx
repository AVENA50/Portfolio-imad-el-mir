import { Code2, Database } from "lucide-react";
import { FaJava } from "react-icons/fa";
import {
  SiDocker,
  SiFastapi,
  SiGit,
  SiGithub,
  SiJavascript,
  SiLinux,
  SiMetabase,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPlotly,
  SiPostgresql,
  SiPrefect,
  SiPython,
  SiReact,
  SiScikitlearn,
  SiSpringboot,
  SiStreamlit,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import type { ComponentType } from "react";

import { getTech, type TechSlug } from "@/config/tech-stack";
import { cn } from "@/lib/cn";

type GlyphComponent = ComponentType<{ className?: string }>;

/**
 * Collegamento fra slug e glifo.
 *
 * `Record<TechSlug, GlyphComponent>` obbliga a mappare ogni tecnologia:
 * aggiungerne una a TECH_SLUGS senza il suo glifo non compila.
 *
 * E l'unico file che conosce react-icons. Cambiare libreria di icone
 * significa riscrivere questo, e nient'altro.
 */
const GLYPHS: Record<TechSlug, GlyphComponent> = {
  typescript: SiTypescript,
  javascript: SiJavascript,
  python: SiPython,
  java: FaJava,

  react: SiReact,
  nextjs: SiNextdotjs,
  tailwind: SiTailwindcss,

  nodejs: SiNodedotjs,
  spring: SiSpringboot,
  fastapi: SiFastapi,

  postgres: SiPostgresql,
  mysql: SiMysql,
  mongodb: SiMongodb,
  pandas: SiPandas,
  numpy: SiNumpy,
  scikit: SiScikitlearn,
  tensorflow: SiTensorflow,
  streamlit: SiStreamlit,
  plotly: SiPlotly,
  // Simple Icons non distribuisce il marchio dbt: glifo generico da lucide.
  // Se un giorno lo aggiungeranno, si cambia questa riga e basta.
  dbt: Database,
  prefect: SiPrefect,
  metabase: SiMetabase,

  docker: SiDocker,
  git: SiGit,
  github: SiGithub,
  vercel: SiVercel,
  linux: SiLinux,
};

interface TechIconProps {
  slug: TechSlug;
  className?: string;
  /** Usa il colore del marchio invece di quello del testo. */
  brandColor?: boolean;
  /** Aggiunge il nome leggibile per gli screen reader. */
  labelled?: boolean;
}

/**
 * Icona di una tecnologia.
 *
 * Di default eredita il colore del testo: dentro un badge o una lista si
 * fonde con il contesto. Con `brandColor` prende il colore del marchio —
 * come nelle tile in orbita dell'hero, dove serve riconoscibilita.
 */
export function TechIcon({
  slug,
  className,
  brandColor = false,
  labelled = false,
}: TechIconProps) {
  const tech = getTech(slug);
  const Glyph = GLYPHS[slug];

  return (
    <>
      <span
        style={brandColor ? { color: tech.color } : undefined}
        className={cn("inline-flex", className)}
      >
        <Glyph className="size-full" />
      </span>
      {labelled && <span className="sr-only">{tech.name}</span>}
    </>
  );
}

/** Glifo generico per "codice", quando nessuna tecnologia specifica calza. */
export const CodeGlyph = Code2;
