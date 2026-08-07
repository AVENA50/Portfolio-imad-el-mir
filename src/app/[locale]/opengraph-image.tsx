import { LOCALES, isLocale } from "@/config/i18n";
import { getDictionary } from "@/lib/dictionary";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

/**
 * Anteprima social predefinita del sito (M10-T3).
 *
 * Sta nel layout `[locale]`, quindi **vale per ogni pagina che non ne
 * dichiara una propria**: Chi sono, Competenze, Percorso, Contatti. Next
 * la associa da solo, senza che le pagine debbano dire niente — e la
 * ragione per cui questo file non ha bisogno di essere importato da
 * nessuna parte.
 *
 * Il testo arriva dal dizionario, quindi l'anteprima di un link italiano
 * e in italiano e quella di un link inglese in inglese.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Imad El Mir — Business Intelligence Software Developer";

/**
 * Le due lingue, generate a build time.
 *
 * Senza questa funzione Next marca la rotta come dinamica e disegna il PNG
 * alla prima richiesta. Non e un dettaglio di prestazioni: il crawler di
 * LinkedIn aspetta pochi secondi prima di rinunciare, e se rinuncia mostra
 * il rettangolo grigio — proprio nel momento in cui il link conta di piu.
 *
 * Il layout ha gia la sua `generateStaticParams`, ma i file di metadata
 * hanno bisogno della propria: Next non la eredita dal segmento.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  // `generateStaticParams` del layout produce solo lingue valide, ma questa
  // rotta e raggiungibile anche con un segmento arbitrario: meglio l'italiano
  // che un'eccezione durante il rendering di un'immagine.
  const locale = isLocale(params.locale) ? params.locale : "it";
  const dictionary = await getDictionary(locale);

  // Il titolo dell'hero, non la descrizione: quella e lunga oltre duecento
  // caratteri e a 1200x630 uscirebbe dal riquadro, perche Satori non sa
  // rimpicciolire il testo per farlo entrare. Un'anteprima social ha lo
  // spazio di un'insegna, non di un paragrafo.
  const { titleLead, titleAccent, role } = dictionary.hero;

  return renderOgImage({
    eyebrow: role,
    title: `${titleLead} ${titleAccent}`,
  });
}
