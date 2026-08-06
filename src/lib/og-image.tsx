import { ImageResponse } from "next/og";

import { SITE } from "@/config/site";

/**
 * L'anteprima social, disegnata a runtime (M10-T3).
 *
 * **Cos'e questo file.** Quando incolli un link su LinkedIn, WhatsApp o
 * Slack, la piattaforma scarica la pagina, cerca `og:image` e mostra
 * quell'immagine. Senza, resta un rettangolo grigio col dominio scritto
 * piccolo — e un link cosi non lo apre nessuno.
 *
 * **Perche generarla invece di disegnarla.** Servono nove immagini oggi e
 * una in piu per ogni progetto futuro, ognuna con il suo titolo. Farle a
 * mano significa aprire un editor grafico ogni volta che scrivi un case
 * study, e prima o poi non lo fai. Qui il titolo arriva dagli stessi dati
 * che compongono la pagina: se cambi il titolo del progetto, cambia anche
 * l'anteprima, senza che nessuno debba ricordarsene.
 *
 * **Il vincolo tecnico che spiega lo stile del codice.** `ImageResponse`
 * non usa un browser: usa Satori, che sa disegnare solo un sottoinsieme di
 * CSS. Niente gradienti complessi su testo, niente `gap` in certi casi,
 * niente unita relative. Ogni misura e in pixel e ogni contenitore
 * dichiara `display: flex` — Satori lo pretende su qualunque elemento con
 * piu di un figlio, e l'errore che da altrimenti non dice quale sia.
 *
 * 1200x630 e la misura che tutte le piattaforme ritagliano senza tagliare.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

interface OgImageOptions {
  /** La riga grande. Titolo della pagina o nome del progetto. */
  title: string;
  /** La riga sopra il titolo, piccola e in maiuscolo. */
  eyebrow?: string;
  /** Una riga sotto il titolo. Va tenuta corta: qui non c'e spazio. */
  subtitle?: string;
}

/**
 * La dimensione del titolo si adatta alla sua lunghezza.
 *
 * Un corpo fisso funziona per "Contatti" e spezza "Business Intelligence
 * Pipeline" su quattro righe che escono dall'immagine. Satori non sa
 * ridurre il testo per farlo entrare, quindi la scelta va fatta prima.
 */
function titleSize(title: string): number {
  if (title.length <= 18) return 84;
  if (title.length <= 32) return 68;
  if (title.length <= 48) return 54;
  return 44;
}

export function renderOgImage({ title, eyebrow, subtitle }: OgImageOptions) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        // Gli stessi colori dei token del sito: --color-bg e --color-surface.
        background: "linear-gradient(135deg, #05060d 0%, #0e1120 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* Alone viola in alto a destra. Un cerchio sfocato non si puo fare
            in Satori, quindi e un gradiente radiale su un riquadro. */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 620,
          height: 620,
          display: "flex",
          borderRadius: 999,
          background:
            "radial-gradient(circle, rgba(124,58,237,0.42) 0%, rgba(124,58,237,0) 68%)",
        }}
      />

      {/* Riga d'accento in alto: la firma visiva del sito. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 8,
          display: "flex",
          background: "linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow && (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#c4b5fd",
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: titleSize(title),
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#f8fafc",
            maxWidth: 940,
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.4,
              color: "#94a3b8",
              marginTop: 24,
              maxWidth: 880,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Piede: chi firma il contenuto. E la parte che si legge anche
            quando l'anteprima e piccola. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              display: "flex",
              borderRadius: 999,
              background: "#8b5cf6",
              marginRight: 16,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 1,
              color: "#f8fafc",
            }}
          >
            {SITE.name.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#64748b" }}>
          {SITE.role}
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
}
