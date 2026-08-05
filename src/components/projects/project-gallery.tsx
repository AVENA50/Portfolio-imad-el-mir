"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/shared/icon";
import { useLockScroll } from "@/hooks/use-lock-scroll";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectScreenshot } from "@/types";

interface ProjectGalleryProps {
  screenshots: readonly ProjectScreenshot[];
  dictionary: Dictionary;
}

/**
 * Elementi focalizzabili dentro il lightbox.
 *
 * L'esclusione di `tabindex="-1"` non e un dettaglio: lo sfondo cliccabile
 * dell'overlay e un <button>, e senza questo filtro diventerebbe il primo
 * elemento del ciclo di tabulazione. Chi naviga da tastiera premerebbe Tab
 * e non vedrebbe muoversi nulla.
 */
const FOCUSABLE =
  ':is(button:not([disabled]), a[href], [tabindex]):not([tabindex="-1"])';

/**
 * Galleria degli screenshot con lightbox (M7-T8).
 *
 * L'unico componente client della pagina progetto: tutto il resto e
 * renderizzato sul server. Qui servono stato — quale immagine e aperta —,
 * tastiera e gestione del focus.
 *
 * Un lightbox e una finestra modale, quindi valgono gli stessi obblighi del
 * drawer mobile (M3-T4), quelli che quasi tutte le gallerie saltano:
 *
 * 1. **Focus trap**: con Tab non si esce dall'overlay.
 * 2. **Esc chiude**, frecce sinistra e destra scorrono.
 * 3. **Il focus torna alla miniatura** da cui si e partiti, non all'inizio
 *    della pagina: chi naviga da tastiera riprende da dove era.
 * 4. **Lo scroll di fondo si blocca** senza far saltare la pagina.
 *
 * L'overlay viene montato solo quando serve. Tenerlo nel DOM nascosto
 * significherebbe scaricare tutte le immagini a piena risoluzione anche
 * per chi la galleria non la apre mai.
 */
export function ProjectGallery({
  screenshots,
  dictionary,
}: ProjectGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Miniatura da cui e partita l'apertura.
   *
   * In un ref e non nello stato di proposito: serve solo alla chiusura per
   * restituire il focus, e mettendolo fra le dipendenze dell'effetto
   * l'overlay si rimonterebbe a ogni freccia, riportando il focus al primo
   * bottone invece di lasciarlo dov'era.
   */
  const openerIndex = useRef(0);

  const isOpen = openIndex !== null;
  useLockScroll(isOpen);

  const open = useCallback((index: number) => {
    openerIndex.current = index;
    setOpenIndex(index);
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null
          ? null
          : // La somma della lunghezza prima del modulo serve per il -1:
            // in JavaScript (-1 % 5) fa -1, non 4.
            (current + delta + screenshots.length) % screenshots.length,
      ),
    [screenshots.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // L'array delle miniature viene copiato qui e non letto nella pulizia:
    // al momento dello smontaggio `thumbRefs.current` potrebbe puntare a
    // nodi diversi da quelli su cui l'effetto era partito.
    const thumbs = thumbRefs.current;

    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (!dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      thumbs[openerIndex.current]?.focus();
    };
  }, [isOpen, close, step]);

  if (screenshots.length === 0) return null;

  const current = openIndex === null ? null : screenshots[openIndex];

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {screenshots.map((shot, index) => (
          <li key={shot.src}>
            <figure>
              <button
                type="button"
                ref={(node) => {
                  thumbRefs.current[index] = node;
                }}
                onClick={() => open(index)}
                className="glass-flat group relative block aspect-[16/10] w-full overflow-hidden rounded-card transition-transform duration-300 ease-out-soft hover:-translate-y-0.5"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  quality={88}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                />

                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center bg-bg/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Icon name="zoom-in" className="size-7 text-ink" />
                </span>

                <span className="sr-only">
                  {dictionary.caseStudy.openImage}: {shot.alt}
                </span>
              </button>

              {shot.caption && (
                <figcaption className="mt-3 text-sm text-ink-subtle">
                  {shot.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      {current && openIndex !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-50 flex flex-col gap-4 bg-bg/90 p-4 backdrop-blur-xl md:p-8"
        >
          {/* Sfondo cliccabile: chiude l'overlay, ma non e l'unico modo di
              farlo. Fuori dal ciclo di tabulazione perche il bottone di
              chiusura fa gia lo stesso lavoro da tastiera. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={close}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative flex items-center justify-between gap-4">
            <p className="text-sm text-ink-subtle">
              {dictionary.caseStudy.imageCounter
                .replace("{current}", String(openIndex + 1))
                .replace("{total}", String(screenshots.length))}
            </p>

            <button
              type="button"
              onClick={close}
              className="glass glass-hover inline-flex size-11 items-center justify-center rounded-pill text-ink"
            >
              <Icon name="close" className="size-5" />
              <span className="sr-only">{dictionary.caseStudy.closeImage}</span>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center gap-3 md:gap-6">
            {screenshots.length > 1 && (
              <NavButton
                direction="left"
                label={dictionary.caseStudy.previousImage}
                onClick={() => step(-1)}
              />
            )}

            <div className="flex h-full min-w-0 flex-1 items-center justify-center">
              {/* Qualita alta e deliberata: qui l'immagine e il contenuto,
                  non un'illustrazione. Sono schermate piene di testo, e la
                  compressione aggressiva si vede per prima sulle lettere. */}
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={2560}
                height={1400}
                quality={95}
                sizes="95vw"
                className="h-auto max-h-full w-auto rounded-card object-contain"
              />
            </div>

            {screenshots.length > 1 && (
              <NavButton
                direction="right"
                label={dictionary.caseStudy.nextImage}
                onClick={() => step(1)}
              />
            )}
          </div>

          {current.caption && (
            <p className="relative text-center text-sm text-ink-muted">
              {current.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function NavButton({
  direction,
  label,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass glass-hover inline-flex size-12 shrink-0 items-center justify-center rounded-pill text-ink"
    >
      <Icon
        name={direction === "left" ? "chevron-left" : "chevron-right"}
        className="size-6"
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}
