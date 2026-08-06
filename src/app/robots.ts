import type { MetadataRoute } from "next";

import { SITE, isPublicSite } from "@/config/site";

/**
 * robots.txt (M10-T2).
 *
 * **Il comportamento cambia a seconda di dove gira**, ed e la ragione per
 * cui e un file di codice e non un testo statico.
 *
 * Finche il portfolio vive su un indirizzo di anteprima — o su produzione
 * senza che tu abbia dichiarato un dominio — qui esce un divieto totale.
 * Non e prudenza eccessiva: un sito indicizzato mentre e ancora in
 * costruzione lascia in giro risultati vecchi per mesi, e farli togliere
 * dopo e molto piu lento che non farceli entrare. Peggio ancora, due copie
 * dello stesso sito su indirizzi diversi competono fra loro nei risultati.
 *
 * Il permesso arriva solo quando **entrambe** le condizioni sono vere:
 * siamo in produzione su Vercel, e `NEXT_PUBLIC_SITE_URL` e stata scritta
 * a mano. La seconda e un interruttore deliberato: finche non lo tocchi
 * tu, il sito resta invisibile ai motori di ricerca.
 *
 * `/api/` resta sempre escluso: la rotta del form non e una pagina, e
 * indicizzarla non porterebbe visite ma solo tentativi automatici.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isPublicSite()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/design-system"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
