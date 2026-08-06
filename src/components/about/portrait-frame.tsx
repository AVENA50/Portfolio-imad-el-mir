import Image from "next/image";
import type { CSSProperties } from "react";

import { Icon } from "@/components/shared/icon";
import type { Tech } from "@/config/tech-stack";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { IconName } from "@/types";

interface PortraitFrameProps {
  photoSrc?: string;
  photoAlt: string;
  /** Iniziali mostrate finche la foto non c'e. */
  monogram: string;
  /** Linguaggio dedotto dai progetti costruiti. */
  language: Tech | null;
  dictionary: Dictionary;
  className?: string;
}

/**
 * Cornice ottagonale con angoli tagliati.
 *
 * Il taglio e in `rem` e non in percentuale di proposito: con le
 * percentuali il taglio orizzontale e quello verticale seguono lati di
 * lunghezza diversa, e gli angoli risultano storti — un rettangolo alto
 * avrebbe smussi lunghi sopra e corti di lato. Con una lunghezza fissa
 * sono otto tagli identici a qualsiasi proporzione.
 */
const CUT = "2.25rem";
const FRAME_CLIP = `polygon(
  ${CUT} 0,
  calc(100% - ${CUT}) 0,
  100% ${CUT},
  100% calc(100% - ${CUT}),
  calc(100% - ${CUT}) 100%,
  ${CUT} 100%,
  0 calc(100% - ${CUT}),
  0 ${CUT}
)`;

const clip: CSSProperties = { clipPath: FRAME_CLIP };

/**
 * L'intestazione del riquadro di codice.
 *
 * Un nome di file e non una frase: non si traduce, e soprattutto non e
 * marketing. "Codice che crea impatto" e il genere di riga che chi legge
 * salta; una scheda di editor invece si legge come una cosa vera.
 */
const CODE_CARD_FILE = "developer.ts";

/**
 * Le tre righe del pannello.
 *
 * La prima e **dedotta** dai progetti costruiti, le altre due sono
 * dichiarazioni — dove sto andando e cosa sto imparando — che nessun dato
 * puo ricavare al posto mio. La divisione e voluta: quella che puo
 * invecchiare si aggiorna da sola, le altre due sono scelte, e le scelte
 * si scrivono.
 */
const PANEL_ICONS = {
  language: "terminal",
  focus: "chart",
  learning: "brain",
} as const satisfies Record<string, IconName>;

export function PortraitFrame({
  photoSrc,
  photoAlt,
  monogram,
  language,
  dictionary,
  className,
}: PortraitFrameProps) {
  const t = dictionary.about;

  const panel: { icon: IconName; value: string; label: string }[] = [
    // Se non c'e ancora niente di costruito, la riga sparisce invece di
    // mostrare un vuoto: meglio due righe vere che tre di cui una finta.
    ...(language
      ? [
          {
            icon: PANEL_ICONS.language,
            value: language.name,
            label: t.panel.language,
          },
        ]
      : []),
    {
      icon: PANEL_ICONS.focus,
      value: t.panel.focusValue,
      label: t.panel.focus,
    },
    {
      icon: PANEL_ICONS.learning,
      value: t.panel.learningValue,
      label: t.panel.learning,
    },
  ];

  return (
    // 30rem invece di 32: i riquadri non potevano spostarsi oltre senza
    // uscire dallo schermo a 1280px, dove la cornice riempie tutta la sua
    // colonna. Lo spazio per farli scorrere a destra doveva venire da
    // qualche parte, e due rem di cornice si notano meno di una card
    // tagliata a meta dal bordo della finestra.
    <div className={cn("relative mx-auto w-full max-w-[30rem]", className)}>
      {/* Aloni dietro la cornice. Sono `blur` su colori pieni: costano un
          layer di composizione e niente altro, mentre un'immagine di sfondo
          sfocata sarebbe centinaia di kilobyte per lo stesso risultato. */}
      <div
        aria-hidden
        className="absolute -inset-12 rounded-full bg-violet-600/18 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -inset-4 top-1/3 rounded-full bg-blue-600/14 blur-3xl"
      />

      {/* 6/7 invece di 4/5: la cornice era alta 1,25 volte la sua larghezza
          e con il podio sotto non entrava in uno schermo. Ora e 1,17 volte,
          cioe 40px in meno, e resta un ritratto — un rapporto piu vicino al
          quadrato snaturerebbe il taglio della foto. */}
      <div className="relative aspect-[6/7] w-full">
        {/* Il bordo in gradiente e un rettangolo pieno di gradiente con
            sopra un secondo rettangolo, piu piccolo di due pixel, del
            colore della pagina. `border-image` non serve: non seguirebbe
            il ritaglio degli angoli. */}
        <div
          aria-hidden
          style={clip}
          className="absolute inset-0 bg-gradient-to-br from-violet-400 via-blue-500/70 to-violet-700"
        />
        <div aria-hidden style={clip} className="absolute inset-[2px] bg-bg" />

        <div
          style={clip}
          className="absolute inset-[2px] overflow-hidden bg-gradient-to-b from-surface to-bg"
        >
          {photoSrc ? (
            <Image
              src={photoSrc}
              alt={photoAlt}
              fill
              sizes="(min-width: 1024px) 32rem, 90vw"
              priority
              className="object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center font-display text-8xl font-bold text-violet-300/25"
            >
              {monogram}
            </span>
          )}

          {/* Luce viola dal basso: la figura deve sembrare illuminata dal
              piatto che ha sotto, non ritagliata e incollata. Parte dal
              bordo inferiore — dove il disco tocca la cornice — e si spegne
              prima di meta altezza. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-violet-500/45 via-violet-600/12 to-transparent"
          />

          {/* Vignettatura. In basso si ferma a `bg/25` e non a `bg/70`: era
              quel nero pieno a formare la fascia piatta sopra il piatto, e
              a far sembrare le due cose incollate invece che una appoggiata
              sull'altra. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg/25"
          />
        </div>

        {/* Cornice interna: una seconda linea sottile a un po' di distanza
            dal bordo. E il dettaglio che fa leggere la forma come una
            cornice tecnica invece che come una foto ritagliata. */}
        <div
          aria-hidden
          style={clip}
          className="absolute inset-[14px] border border-violet-400/18"
        />

        {/*
          Il podio.

          Due cilindri sovrapposti, ognuno fatto di una parete e di un
          piano. L'ordine nel markup e la profondita: il pavimento sta
          dietro a tutto, poi il livello inferiore — piu largo e piu basso —
          e sopra quello superiore, che e il solo davvero illuminato.

          Sta **dentro** la cornice e non accanto: e ancorato al suo bordo
          inferiore con `top: 100%`, come nel mockup, dove il bordo
          posteriore del podio coincide con la base della cornice. Fuori,
          sotto `lg`, il pannello dei numeri torna nel flusso e allunga il
          contenitore: il podio finirebbe sotto quella card.

          Geometria, gradienti e colori stanno in `globals.css` sotto
          `.podium`, con accanto le misure prese sul mockup. Qui resta solo
          l'impilamento, che e l'unica cosa strutturale.
        */}
        <div aria-hidden className="podium">
          <div className="podium-part podium-floor" />
          <div className="podium-part podium-wall-2" />
          <div className="podium-part podium-top-2" />
          <div className="podium-part podium-wall-1" />
          <div className="podium-part podium-top-1" />
        </div>
      </div>

      {/* Riquadro codice. Decorativo: sotto xl sparisce invece di schiacciarsi
          addosso alla foto. Un elemento che si sovrappone male fa piu danno
          di un elemento assente.
          Sporge quasi tutto oltre il bordo destro: cosi tocca l'angolo della
          cornice e non il centro, che e dove finira la faccia. */}
      <div
        aria-hidden
        className="glass absolute -top-3 hidden w-[16rem] rounded-card p-3.5 xl:right-[-5rem] xl:block 2xl:right-[-7rem]"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-badge border border-violet-500/25 bg-violet-500/12 text-violet-300">
            <Icon name="code" className="size-3.5" />
          </span>
          <p className="font-mono text-[0.625rem] leading-tight font-semibold text-ink">
            {CODE_CARD_FILE}
          </p>
        </div>

        {/* Le righe sono tarate sulla larghezza della card: al massimo 35
            caratteri. Un blocco di codice mandato a capo dal browser si
            legge come un errore, non come codice. */}
        <pre className="mt-2.5 overflow-hidden font-mono text-[0.625rem] leading-relaxed text-ink-subtle">
          <code>
            <span className="text-blue-300">{"const"}</span>
            {" developer = {\n"}
            {"  role:  "}
            <span className="text-violet-300">{'"BI Software Developer"'}</span>
            {",\n"}
            {"  stack: "}
            <span className="text-violet-300">
              {'["Python", "Java", "SQL"]'}
            </span>
            {",\n"}
            {"  focus: "}
            <span className="text-violet-300">{'["Data", "AI", "Web"]'}</span>
            {",\n"}
            {"  goal:  "}
            <span className="text-violet-300">{'"data into decisions"'}</span>
            {",\n};"}
          </code>
        </pre>
      </div>

      {/* Cerchio delle tre parole. */}
      <div
        aria-hidden
        className="glass absolute top-[46%] -left-8 hidden size-28 flex-col items-center justify-center rounded-full border-violet-400/25 text-center lg:flex xl:-left-14"
      >
        <Icon name="sparkles" className="size-3.5 text-amber-300" />
        {/* Tre verbi e non tre sostantivi: dicono come lavoro invece di
            cosa mi piace, e sono un ciclo — si finisce dove si ricomincia. */}
        <p className="mt-1.5 text-[0.6875rem] leading-snug font-medium text-ink">
          {t.circle.analyze}
          <br />
          {t.circle.build}
          <br />
          {t.circle.improve}
        </p>
      </div>

      {/* Pannello numeri: sotto la foto sul telefono, sovrapposto in basso a
          destra da lg in su. Un solo elemento, due posizioni — invece di due
          copie dello stesso markup che prima o poi divergono. */}
      {/* Gli scostamenti negativi partono solo da xl: a 1024px la colonna
          e larga quanto la cornice, e un `-right-8` spingerebbe il pannello
          oltre il contenitore facendo comparire lo scroll orizzontale — il
          difetto piu fastidioso da telefono e il piu facile da non vedere
          sviluppando su un monitor grande. */}
      <div className="glass relative mt-8 rounded-card p-4 lg:absolute lg:right-0 lg:bottom-6 lg:mt-0 lg:w-[14rem] xl:right-[-5rem] xl:w-[14.5rem] 2xl:right-[-7rem]">
        <ul className="flex flex-col gap-3.5">
          {panel.map((row) => (
            <li key={row.label} className="flex items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-badge border border-violet-500/25 bg-violet-500/12 text-violet-300">
                <Icon name={row.icon} className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="font-display text-[0.9375rem] leading-tight font-bold text-ink">
                  {row.value}
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
                  {row.label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
