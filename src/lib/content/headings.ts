export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Estrae i titoli di secondo e terzo livello dal sorgente MDX.
 *
 * Funzione pura, senza dipendenze: sta in un file separato da mdx.tsx
 * perche chi vuole un indice non deve trascinarsi dietro il compilatore
 * MDX e `server-only`. La pagina Projects puo mostrare l'indice in
 * anteprima senza pagare la compilazione del case study.
 *
 * I blocchi di codice vengono rimossi prima di cercare: un commento
 * `## setup` dentro uno snippet bash non e un titolo del documento, ed e
 * il tipo di bug che scopri solo quando l'indice ha una voce assurda.
 */
export function extractHeadings(source: string): Heading[] {
  const withoutCode = source.replace(/```[\s\S]*?```/g, "");
  const matches = withoutCode.matchAll(/^(#{2,3})\s+(.+)$/gm);

  return Array.from(matches).map((match) => {
    const hashes = match[1] ?? "##";
    const text = (match[2] ?? "").trim();

    return {
      level: hashes.length === 2 ? (2 as const) : (3 as const),
      text,
      // Stesso algoritmo di rehype-slug, cosi gli ancoraggi coincidono
      id: text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-"),
    };
  });
}
