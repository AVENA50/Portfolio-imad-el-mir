import Image from "next/image";

import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectScreenshot } from "@/types";

interface GalleryTeaserProps {
  screenshots: readonly ProjectScreenshot[];
  /** Nome del progetto, per l'invito a esplorare. */
  projectTitle: string;
  dictionary: Dictionary;
  /** Id della sezione galleria a cui saltare. */
  targetId?: string;
  /**
   * Id della sezione video. Passato solo se il progetto ha una demo:
   * un bottone che porta a una sezione inesistente e peggio di nessun
   * bottone, perche la pagina scorre e non succede niente.
   */
  videoTargetId?: string;
  className?: string;
}

/**
 * Opacita delle tre anteprime.
 *
 * La prima piena, la seconda appena velata, la terza quasi svanita: la pila
 * suggerisce che dietro ce n'e dell'altro senza dover contare le immagini.
 * Tre e il numero giusto — con due non si legge come una serie, con quattro
 * l'ultima e cosi scarica da sembrare un errore di rendering.
 */
const PREVIEW_OPACITY = [1, 0.62, 0.28] as const;

/**
 * Invito a esplorare la galleria, sotto l'hero.
 *
 * Chi apre la pagina vede una copertina e poi testo: senza un segnale, non
 * ha motivo di scorrere fino in fondo. Qui la pila di anteprime dice che
 * piu avanti ci sono schermate vere, e il bottone ci porta.
 *
 * Il salto e un'ancora HTML, non JavaScript: `scroll-behavior: smooth` e
 * `scroll-padding-top` sono gia in globals.css, quindi lo scorrimento e
 * morbido e non finisce sotto l'header sticky. Un gestore di click avrebbe
 * reso client tutto l'hero per rifare cio che il browser fa da solo, e
 * avrebbe tolto tasto destro e apertura in nuova scheda.
 *
 * Le anteprime sono `aria-hidden`: sono le stesse immagini della galleria
 * qui sotto, e annunciarle due volte allungherebbe la lettura senza
 * aggiungere niente.
 */
export function GalleryTeaser({
  screenshots,
  projectTitle,
  dictionary,
  targetId = "gallery",
  videoTargetId,
  className,
}: GalleryTeaserProps) {
  if (screenshots.length === 0) return null;

  const previews = screenshots.slice(0, PREVIEW_OPACITY.length);

  return (
    <div
      className={cn(
        "glass glow-hover flex flex-wrap items-center gap-x-6 gap-y-4 rounded-card px-5 py-4",
        className,
      )}
    >
      <ul
        aria-hidden
        className="flex items-center"
        style={{
          // La maschera continua la sfumatura oltre l'opacita: l'ultima
          // anteprima non si interrompe con un bordo netto, si dissolve.
          maskImage:
            "linear-gradient(to right, #000 55%, rgba(0,0,0,0.35) 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, #000 55%, rgba(0,0,0,0.35) 85%, transparent 100%)",
        }}
      >
        {previews.map((shot, index) => (
          <li
            key={shot.src}
            className={cn(
              "relative h-12 w-20 overflow-hidden rounded-badge ring-1 ring-glass-border",
              index > 0 && "-ml-6",
            )}
            style={{
              opacity: PREVIEW_OPACITY[index],
              // La prima sta sopra: la pila si legge da sinistra a destra
              zIndex: previews.length - index,
            }}
          >
            <Image
              src={shot.src}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      <p className="text-sm text-ink-muted">
        {dictionary.caseStudy.exploreProject.replace("{name}", projectTitle)}
      </p>

      {/* I due inviti stanno insieme e si spostano a destra come blocco:
          separati, su schermi stretti, finirebbero uno per riga a distanza. */}
      <div className="ml-auto flex flex-wrap items-center gap-3">
        {videoTargetId && (
          /* La demo e il contenuto piu forte della pagina: e l'unico
             bottone pieno, cosi l'occhio ci finisce per primo. */
          <Button asChild iconLeft="video">
            <a href={`#${videoTargetId}`}>{dictionary.caseStudy.watchDemo}</a>
          </Button>
        )}

        <Button asChild variant="secondary" iconRight="chevron-down">
          <a href={`#${targetId}`}>{dictionary.caseStudy.goToGallery}</a>
        </Button>
      </div>
    </div>
  );
}
