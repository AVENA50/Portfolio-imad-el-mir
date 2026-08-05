import { z } from "zod";

import { CATEGORY_SLUGS } from "@/config/project-categories";
import { TECH_SLUGS } from "@/config/tech-stack";

/**
 * Schema del frontmatter dei progetti.
 *
 * E il contratto fra i file MDX e il sito: se un frontmatter non lo rispetta,
 * la build si ferma con il nome del file e il campo sbagliato. E il controllo
 * che TypeScript da solo non puo dare, perche il frontmatter e un dato esterno
 * letto a runtime.
 *
 * Organizzazione dei contenuti, essendo il sito bilingue:
 *
 *   src/content/projects/it/arcadium.mdx
 *   src/content/projects/en/arcadium.mdx
 *
 * Un file per lingua, stesso slug. I campi strutturali — categoria, stack,
 * date, link — sono ripetuti in entrambi: un test di M4-T8 verifichera che
 * non divergano. Tenerli in un terzo file condiviso sarebbe piu asciutto
 * ma renderebbe illeggibile il singolo MDX, che deve restare un documento
 * che si apre e si capisce.
 */

/**
 * URL assoluto.
 * Scritto con refine invece che con l'helper di zod perche la sintassi
 * degli helper e cambiata fra le versioni maggiori: cosi il file resta
 * valido a prescindere.
 */
const urlSchema = z.string().refine(
  (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Deve essere un URL assoluto valido" },
);

/** Data in formato YYYY-MM o YYYY-MM-DD. */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Formato atteso: YYYY-MM oppure YYYY-MM-DD");

const imageSchema = z.object({
  src: z.string().startsWith("/", "Il percorso deve partire da /public"),
  alt: z.string().min(1, "L'alt e obbligatorio: serve a chi non vede"),
  caption: z.string().optional(),
});

const iconTextSchema = z.object({
  icon: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const projectSchema = z.object({
  // --- Identita
  title: z.string().min(1),
  emoji: z.string().optional(),
  tagline: z.string().min(1).max(180),
  description: z.string().optional(),

  // --- Classificazione
  category: z.enum(CATEGORY_SLUGS),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().optional(),

  // --- Metadati
  status: z.enum(["completed", "in-progress", "planned"]).default("completed"),
  type: z
    .enum(["personal", "academic", "professional", "open-source"])
    .default("personal"),
  startDate: dateSchema,
  endDate: dateSchema.optional(),

  // --- Link: tutti opzionali, non ogni progetto ha una demo
  links: z
    .object({
      live: urlSchema.optional(),
      repo: urlSchema.optional(),
      demo: urlSchema.optional(),
      docs: urlSchema.optional(),
    })
    .default({}),

  // --- Media
  cover: imageSchema,
  screenshots: z.array(imageSchema).optional(),

  // --- Contenuto ricco: tutto opzionale, il layout si adatta
  highlights: z.array(z.string()).optional(),
  features: z.array(iconTextSchema).optional(),
  learnings: z.array(iconTextSchema).optional(),

  // --- Stack: solo slug, il resto arriva da config/tech-stack.ts
  stack: z.array(z.enum(TECH_SLUGS)).optional(),

  // --- Architettura: la sezione che trasforma la vetrina in case study
  architecture: z
    .object({
      summary: z.string().min(1),
      diagram: imageSchema.optional(),
      layers: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            tech: z.array(z.enum(TECH_SLUGS)).optional(),
          }),
        )
        .optional(),
      decisions: z
        .array(
          z.object({
            choice: z.string().min(1),
            why: z.string().min(1),
          }),
        )
        .optional(),
    })
    .optional(),

  // --- Badge flottanti nell'hero del case study
  metrics: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        hint: z.string().optional(),
        trend: z.array(z.number()).optional(),
      }),
    )
    .optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectSchema>;

/**
 * Campi che devono coincidere fra le due lingue dello stesso progetto.
 * Il titolo puo cambiare, la categoria no.
 */
export const SHARED_FIELDS = [
  "category",
  "featured",
  "status",
  "type",
  "startDate",
  "endDate",
  "stack",
] as const satisfies readonly (keyof ProjectFrontmatter)[];
