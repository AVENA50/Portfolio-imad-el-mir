"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/shared/icon";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectVideo as ProjectVideoData } from "@/types";

interface ProjectVideoProps {
  video: ProjectVideoData;
  dictionary: Dictionary;
}

/** Secondi come "1:05". Le demo durano minuti, non ore: niente ore. */
function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}

/**
 * Dimostrazione del progetto in movimento.
 *
 * Il video e muto e in loop, quindi non e "un filmato da guardare" ma un
 * elemento vivo della pagina: mostra la ricerca che filtra e le liste che
 * si riordinano, cose che uno screenshot non puo raccontare.
 *
 * Quattro scelte, con la stessa ragione di fondo — non far pagare a chi
 * legge un contenuto che magari non guarda:
 *
 * 1. **`preload="none"`**: il file non parte finche la sezione non e in
 *    vista. Chi legge l'architettura e se ne va non scarica niente.
 * 2. **Parte e si ferma con lo scroll**: fuori dalla viewport il video e
 *    in pausa. Un loop che gira in una sezione invisibile consuma batteria
 *    e basta.
 * 3. **`prefers-reduced-motion`**: chi ha chiesto meno animazioni vede il
 *    poster fermo e decide lui se avviare.
 * 4. **Comandi sempre presenti**: pausa e cursore di avanzamento. Le WCAG
 *    chiedono di poter fermare qualsiasi movimento che duri piu di cinque
 *    secondi, e un video che non si puo riavvolgere costringe a riguardare
 *    tutto per rivedere un passaggio.
 *
 * I comandi sono i nostri e non `controls` nativo: la barra di sistema
 * porta volume e schermo intero, che su una clip muta non servono, e ha un
 * aspetto diverso su ogni browser.
 *
 * La barra compare al passaggio del mouse e sparisce quando esci, come su
 * YouTube. Restano tre eccezioni in cui e sempre visibile, e sono la parte
 * che di solito viene dimenticata:
 *
 * - **a video fermo**, altrimenti chi ha messo in pausa non trova piu il
 *   modo di ripartire;
 * - **quando un comando ha il focus**, altrimenti chi naviga con Tab
 *   sposta il focus su un elemento invisibile;
 * - **con `prefers-reduced-motion`**, dove anche una dissolvenza e movimento.
 *
 * Sul touch il puntatore non esiste, quindi non c'e hover: li il tocco sul
 * video mette in pausa, e la pausa fa comparire i comandi.
 */
export function ProjectVideo({ video, dictionary }: ProjectVideoProps) {
  const { ref, inView } = useInView<HTMLElement>({
    threshold: 0.35,
    once: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Riproduzione legata alla visibilita della sezione.
  useEffect(() => {
    const element = videoRef.current;
    if (!element || reduceMotion) return;

    if (inView) {
      // play() restituisce una promise che rifiuta se il browser blocca
      // l'avvio automatico: va gestita, altrimenti finisce in console.
      void element.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false),
      );
    } else {
      element.pause();
      setIsPlaying(false);
    }
  }, [inView, reduceMotion]);

  const toggle = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      void element.play().then(() => setIsPlaying(true));
    } else {
      element.pause();
      setIsPlaying(false);
    }
  }, []);

  function seek(seconds: number) {
    const element = videoRef.current;
    if (!element) return;

    element.currentTime = seconds;
    setCurrent(seconds);
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  /** Sempre visibili quando il video e fermo o quando il movimento e ridotto. */
  const alwaysVisible = !isPlaying || reduceMotion;

  return (
    <figure ref={ref} className="relative">
      <div className="glass group relative aspect-video overflow-hidden rounded-panel">
        <video
          ref={videoRef}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="none"
          onClick={toggle}
          onLoadedMetadata={(event) =>
            setDuration(event.currentTarget.duration)
          }
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          className="size-full cursor-pointer object-cover"
        >
          <source src={video.src} type="video/mp4" />
        </video>

        {/* Barra dei comandi: sfuma sopra il video invece di appoggiarsi su
            un fondo pieno, cosi non taglia l'immagine con una striscia. */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center gap-4 px-4 pt-10 pb-4 md:px-6",
            "bg-gradient-to-t from-bg/90 to-transparent",
            "transition-opacity duration-300 ease-out-soft",
            "group-hover:opacity-100 focus-within:opacity-100",
            alwaysVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <button
            type="button"
            onClick={toggle}
            className="glass glass-hover inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-ink"
          >
            <Icon name={isPlaying ? "pause" : "play"} className="size-5" />
            <span className="sr-only">
              {isPlaying
                ? dictionary.caseStudy.pauseVideo
                : dictionary.caseStudy.playVideo}
            </span>
          </button>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label={dictionary.caseStudy.seekVideo}
            // Il valore letto ad alta voce e un tempo, non un numero secco
            aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
            className="video-scrubber min-w-0 flex-1"
            style={{ ["--progress" as string]: `${progress}%` }}
          />

          <span className="shrink-0 font-mono text-xs text-ink-muted tabular-nums">
            {formatTime(current)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-sm text-ink-subtle">
        {video.caption}
      </figcaption>
    </figure>
  );
}
