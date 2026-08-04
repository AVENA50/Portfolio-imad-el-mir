"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

/** Punto sulla sfera unitaria. */
interface Point {
  x: number;
  y: number;
  z: number;
}

interface EarthGlobeProps {
  /** Passo della griglia in gradi. Piu basso = piu punti, piu dettaglio. */
  step?: number;
  /** Secondi per un giro completo. */
  period?: number;
  className?: string;
}

/** Inclinazione dell'asse terrestre, in radianti. */
const AXIAL_TILT = (-23.4 * Math.PI) / 180;

/**
 * Globo terrestre a matrice di punti.
 *
 * I continenti non sono disegnati a mano: arrivano da world-atlas, lo stesso
 * dataset che usa D3, campionato su una griglia di latitudine e longitudine.
 * Ogni punto di terra diventa un vettore sulla sfera unitaria.
 *
 * La rotazione non ricalcola la proiezione: applica una matrice di rotazione
 * ai vettori gia pronti e scarta l'emisfero nascosto. Sono due moltiplicazioni
 * per punto, quindi 3000 punti a 60fps costano meno di un'animazione CSS su
 * altrettanti nodi DOM.
 *
 * Il dataset (circa 100 KB) e caricato con import dinamico dentro l'effetto:
 * non entra nel bundle iniziale e non ritarda il primo paint. Fino a quando
 * non arriva, si vede il pianeta in CSS che sta sotto.
 */
export function EarthGlobe({
  step = 2.5,
  period = 90,
  className,
}: EarthGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let points: Point[] = [];
    let frame = 0;
    let size = 0;
    let disposed = false;

    function fit() {
      if (!canvas || !context) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function render(angle: number) {
      if (!context) return;

      const center = size / 2;
      const radius = center * 0.94;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosT = Math.cos(AXIAL_TILT);
      const sinT = Math.sin(AXIAL_TILT);

      context.clearRect(0, 0, size, size);

      for (const point of points) {
        // Rotazione attorno all'asse verticale
        const x = point.x * cosA + point.z * sinA;
        const zx = point.z * cosA - point.x * sinA;

        // Inclinazione dell'asse
        const y = point.y * cosT - zx * sinT;
        const z = point.y * sinT + zx * cosT;

        // Emisfero nascosto: non si disegna
        if (z <= 0) continue;

        const screenX = center + x * radius;
        const screenY = center - y * radius;

        // Piu il punto e vicino al bordo, piu e piccolo e scuro:
        // e cio che da la curvatura senza calcolare ombre
        const depth = 0.3 + 0.7 * z;
        const dotRadius = (size / 300) * depth;

        context.beginPath();
        context.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(147, 197, 253, ${0.2 + 0.75 * depth})`;
        context.fill();
      }
    }

    function tick(time: number) {
      render(((time / 1000) * (Math.PI * 2)) / period);
      frame = window.requestAnimationFrame(tick);
    }

    async function build() {
      const [{ geoContains }, topojson, atlas] = await Promise.all([
        import("d3-geo"),
        import("topojson-client"),
        import("world-atlas/land-110m.json"),
      ]);

      if (disposed) return;

      const topology = atlas.default as unknown as Parameters<
        typeof topojson.feature
      >[0];
      const land = topojson.feature(
        topology,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (topology as any).objects.land,
      );

      const collected: Point[] = [];

      for (let lat = -84; lat <= 84; lat += step) {
        // Passo in longitudine corretto per la latitudine: senza, i punti
        // si addensano ai poli e il globo sembra due calotte piene
        const lonStep = step / Math.max(Math.cos((lat * Math.PI) / 180), 0.25);

        for (let lon = -180; lon < 180; lon += lonStep) {
          if (!geoContains(land, [lon, lat])) continue;

          const phi = ((90 - lat) * Math.PI) / 180;
          const theta = ((lon + 180) * Math.PI) / 180;

          collected.push({
            x: -Math.sin(phi) * Math.cos(theta),
            y: Math.cos(phi),
            z: Math.sin(phi) * Math.sin(theta),
          });
        }
      }

      points = collected;

      if (reduceMotion) render(0);
      else frame = window.requestAnimationFrame(tick);
    }

    fit();
    void build();

    function handleResize() {
      fit();
      if (reduceMotion) render(0);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [step, period]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block size-full", className)}
    />
  );
}
