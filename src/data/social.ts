import { SITE } from "@/config/site";
import type { SocialLink } from "@/types";

/**
 * Link social e contatti.
 *
 * Gli URL si compongono dagli handle in config/site.ts: cambiare username
 * significa toccare una riga sola, non cercare il vecchio nome nel progetto.
 *
 * Usati da header, footer, hero e pagina Contact.
 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "GitHub",
    href: `https://github.com/${SITE.handles.github}`,
    icon: "github",
    srLabel: "Profilo GitHub",
  },
  {
    label: "LinkedIn",
    href: `https://www.linkedin.com/in/${SITE.handles.linkedin}`,
    icon: "linkedin",
    srLabel: "Profilo LinkedIn",
  },
  {
    label: "Email",
    href: `mailto:${SITE.email}`,
    icon: "mail",
    srLabel: "Scrivimi una email",
  },
  {
    label: "CV",
    href: SITE.resumePath,
    icon: "file",
    srLabel: "Curriculum in PDF",
  },
] as const;
