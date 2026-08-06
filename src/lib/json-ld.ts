import type { Locale } from "@/config/i18n";
import { LOCALE_META } from "@/config/i18n";
import { SITE } from "@/config/site";
import { EDUCATION, LOCATION } from "@/data/about";
import { SOCIAL_LINKS } from "@/data/social";
import { getTech } from "@/config/tech-stack";
import type { ProjectSummary } from "@/types";

/**
 * Dati strutturati schema.org (M10-T4).
 *
 * **Cosa cambia davvero.** Il testo di una pagina lo legge un motore di
 * ricerca, ma non sa dire se "Imad El Mir" e l'autore, il soggetto o una
 * citazione. Il JSON-LD glielo dice in modo esplicito: questa e una
 * persona, questo e il suo ruolo, questi sono i suoi profili. E la
 * differenza fra comparire come una pagina qualsiasi e comparire come
 * **una persona** quando qualcuno cerca il tuo nome.
 *
 * Nessun dato e scritto due volte: nome e contatti vengono da `SITE`,
 * l'istruzione da `data/about.ts`, i profili da `data/social.ts`, lo stack
 * dal registro delle tecnologie. Se un giorno cambi ateneo, cambia anche
 * quello che dichiari a Google, senza toccare questo file.
 */

/** Il tipo minimo che serve: un oggetto JSON con un `@type`. */
type JsonLd = Record<string, unknown>;

/**
 * Chi sei (`Person`).
 *
 * `sameAs` e il campo che conta: elenca i profili che i motori di ricerca
 * usano per collegare fra loro le tue identita online. E cio che fa
 * capire a Google che il GitHub `AVENA50`, il LinkedIn e questo sito sono
 * la stessa persona invece di tre entita scollegate.
 */
export function personJsonLd(locale: Locale): JsonLd {
  const current = EDUCATION.find((entry) => !entry.endDate);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE.url}/#person`,
    name: SITE.name,
    url: `${SITE.url}/${locale}`,
    email: `mailto:${SITE.email}`,
    jobTitle: SITE.role,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      // Solo citta e nazione: l'indirizzo di casa non entra nel sito, e
      // schema.org non fa eccezione — anzi, li sarebbe leggibile a macchina.
      addressLocality: LOCATION[locale].split(",")[0]?.trim(),
      addressCountry: "IT",
    },
    knowsLanguage: ["it", "en", "fr", "ar"],
    ...(current
      ? {
          alumniOf: {
            "@type": "EducationalOrganization",
            name: current.institution,
            ...(current.url ? { url: current.url } : {}),
          },
        }
      : {}),
    sameAs: SOCIAL_LINKS.filter((link) => link.href.startsWith("http")).map(
      (link) => link.href,
    ),
  };
}

/**
 * Il sito (`WebSite`).
 *
 * `inLanguage` con entrambe le lingue evita che le due versioni vengano
 * lette come siti diversi in competizione fra loro.
 */
export function webSiteJsonLd(locale: Locale): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: `${SITE.url}/${locale}`,
    name: SITE.name,
    description: SITE.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    author: { "@id": `${SITE.url}/#person` },
    publisher: { "@id": `${SITE.url}/#person` },
  };
}

/**
 * Un progetto (`CreativeWork`).
 *
 * Non `SoftwareApplication`, che descrive un programma che si installa e
 * si usa: questi sono lavori di cui si racconta come sono fatti, e il tipo
 * giusto e quello generico. Dichiarare un tipo sbagliato e peggio che non
 * dichiararne nessuno, perche il motore si aspetta campi che non ci sono.
 */
export function projectJsonLd(project: ProjectSummary, locale: Locale): JsonLd {
  const url = `${SITE.url}/${locale}/projects/${project.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: project.title,
    headline: project.title,
    description: project.description ?? project.tagline,
    url,
    inLanguage: LOCALE_META[locale].htmlLang,
    author: { "@id": `${SITE.url}/#person` },
    // `YYYY-MM` non e una data valida per schema.org: serve il giorno.
    dateCreated: `${project.startDate}-01`,
    ...(project.endDate ? { datePublished: `${project.endDate}-01` } : {}),
    keywords: [...project.tags].join(", "),
    // I nomi leggibili, non gli slug: "PostgreSQL", non "postgres".
    ...(project.stack?.length
      ? { about: project.stack.map((slug) => getTech(slug).name) }
      : {}),
    image: `${SITE.url}${project.cover.src}`,
  };
}

/**
 * La briciola di pane (`BreadcrumbList`).
 *
 * E cio che fa apparire "imadelmir.dev › Progetti › Arcadium" sotto il
 * titolo nei risultati di ricerca, al posto dell'URL nudo.
 */
export function breadcrumbJsonLd(
  locale: Locale,
  trail: readonly { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${SITE.url}/${locale}${step.path === "/" ? "" : step.path}`,
    })),
  };
}
