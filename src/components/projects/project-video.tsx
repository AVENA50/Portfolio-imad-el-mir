"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/shared/icon";
import { useInView } from "@/hooks/use-in-view";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectVideo as ProjectVideoData } from "@/types";

interface ProjectVideoProps {
  video: ProjectVideoData;
  dictionary: Dictionary;
}

/**
 * Dimostrazione del progetto in movimento.
 *
 * Il video e muto e in loop, quindi non e "un filmato da guardare" ma un
 * elemento vivo della pagina: mostra la ricerca che filtra e le liste che
 * si riordinano, cose che uno screenshot non puo raccontare.
 *
 * Quattro scelte, tutte con la stessa ragione di fondo — non far pagare a
 * chi legge un contenuto che magari non guarda:
 *
 * 1. **`preload="none"`**: il file non parte finche la sezione non e in
 *    vista. Chi legge solo l'architettura e se ne va non scarica niente.
 * 2. **Parte e si ferma con lo scroll**: fuori dalla viewport il video e
 *    in pausa. Un loop che gira in una sezione invisibile consuma batteria
 *    e basta.
 * 3. **`prefers-reduced-motion`**: chi ha chiesto meno animazioni vede il
 *    poster fermo e decide lui se avviare.
 * 4. **Un bottone di pausa sempre presente**: le WCAG lo richiedono per
 *    qualsiasi contenuto in movimento che dura piu di cinque secondi, e in
 *    ogni caso un'animazione che non si puo fermare e una piccola prepotenza.
 *
 * Niente `controls`: sono una barra pensata per l'audio e la ricerca nel
 * tempo, e su una clip muta di venti secondi in loop aggiungono ingombro
 * senza aggiungere controllo.
 */
export function ProjectVideo({ video, dictionary }: ProjectVideoProps) {
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0.35,
    once: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Sincronizza la riproduzione con la visibilita, se l'utente non ha
  // chiesto meno animazioni e non ha messo in pausa a mano.
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

  function toggle() {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      void element.play().then(() => setIsPlaying(true));
    } else {
      element.pause();
      setIsPlaying(false);
    }
  }

  return (
    <figure ref={ref} className="relative">
      <div className="glass relative aspect-video overflow-hidden rounded-panel">
        <video
          ref={videoRef}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="none"
          // Il video non porta informazione che il testo non abbia gia:
          // la didascalia qui sotto descrive cosa succede a schermo.
          aria-hidden
          tabIndex={-1}
          className="size-full object-cover"
        >
          <source src={video.src} type="video/mp4" />
        </video>

        <button
          type="button"
          onClick={toggle}
          className="glass glass-hover absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-pill text-ink"
        >
          <Icon name={isPlaying ? "pause" : "play"} className="size-5" />
          <span className="sr-only">
            {isPlaying
              ? dictionary.caseStudy.pauseVideo
              : dictionary.caseStudy.playVideo}
          </span>
        </button>
      </div>

      <figcaption className="mt-4 text-center text-sm text-ink-subtle">
        {video.caption}
      </figcaption>
    </figure>
  );
}
