import { cn } from "@/lib/cn";
import type { Heading } from "@/lib/content/headings";
import type { Dictionary } from "@/lib/dictionary";

interface ProjectTocProps {
  headings: readonly Heading[];
  dictionary: Dictionary;
  className?: string;
}

/** Sotto i tre titoli l'indice e piu lungo del testo che indicizza. */
const MIN_HEADINGS = 3;

/**
 * Indice del case study (M7-T4).
 *
 * Nessun JavaScript: sono ancore verso gli `id` che rehype-slug mette sui
 * titoli dell'MDX. Lo scroll morbido e lo stacco dall'header sticky sono
 * gia in globals.css (`scroll-behavior` e `scroll-padding-top`), quindi
 * anche l'atterraggio e corretto senza una riga di codice nel browser.
 *
 * Uno scroll-spy che evidenzia la sezione corrente costerebbe un
 * IntersectionObserver e un componente client su una pagina che oggi e
 * interamente server: non vale il prezzo per un indice di cinque voci.
 *
 * Sparisce quando i titoli sono meno di tre: un indice piu lungo del
 * contenuto e solo un ostacolo fra chi legge e il testo.
 */
export function ProjectToc({
  headings,
  dictionary,
  className,
}: ProjectTocProps) {
  if (headings.length < MIN_HEADINGS) return null;

  return (
    <nav
      aria-label={dictionary.caseStudy.tableOfContents}
      className={cn("lg:sticky lg:top-28", className)}
    >
      <p className="eyebrow">{dictionary.caseStudy.tableOfContents}</p>

      <ul className="mt-5 space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "-ml-px block border-l border-transparent py-1.5 text-sm leading-snug text-ink-subtle transition-colors",
                "hover:border-violet-400 hover:text-ink",
                heading.level === 2 ? "pl-4" : "pl-8 text-[0.8125rem]",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
