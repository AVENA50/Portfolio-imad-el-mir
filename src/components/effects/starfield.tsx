"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  /** Velocita di deriva in px al secondo. */
  speed: number;
  /** Fase e frequenza dello scintillio. */
  phase: number;
  rate: number;
  hue: "white" | "violet" | "blue";
}

interface StarfieldProps {
  /** Stelle per pixel quadrato. 0.00014 = circa 270 stelle su 1920x1080. */
  density?: number;
  className?: string;
}

const COLORS: Record<Star["hue"], string> = {
  white: "255, 255, 255",
  violet: "167, 139, 250",
  blue: "147, 197, 253",
};

/**
 * Campo stellare animato.
 *
 * Canvas e non DOM: 300 stelle come elementi separati sarebbero 300 nodi da
 * ricalcolare a ogni frame. Su canvas sono 300 archi disegnati in un colpo
 * solo, e il costo non cresce con la profondita della pagina.
 *
 * Tre attenzioni che rendono l'effetto usabile invece che fastidioso:
 * - `prefers-reduced-motion`: le stelle vengono disegnate ferme, una volta sola
 * - scheda in secondo piano: l'animazione si ferma e non consuma batteria
 * - devicePixelRatio limitato a 2: su schermi 3x non si disegnano 9 volte
 *   i pixel per una differenza che nessuno vede su un puntino di 1px
 */
export function Starfield({ density = 0.00014, className }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;

    function seed() {
      if (!canvas || !context) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.round(width * height * density);

      stars = Array.from({ length: count }, () => {
        const roll = Math.random();

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.4 + Math.random() * 1.1,
          alpha: 0.25 + Math.random() * 0.55,
          speed: 1.5 + Math.random() * 6,
          phase: Math.random() * Math.PI * 2,
          rate: 0.4 + Math.random() * 1.1,
          hue: roll > 0.93 ? "violet" : roll > 0.86 ? "blue" : "white",
        };
      });
    }

    function draw(elapsed: number) {
      if (!context) return;

      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        // Scintillio: una sinusoide sulla trasparenza, mai fino a zero
        const twinkle = reduceMotion
          ? 1
          : 0.65 + 0.35 * Math.sin(star.phase + elapsed * star.rate);

        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${COLORS[star.hue]}, ${star.alpha * twinkle})`;
        context.fill();
      }
    }

    function tick(time: number) {
      const delta = lastTime === 0 ? 0 : (time - lastTime) / 1000;
      lastTime = time;

      // Deriva verticale lenta, con riavvolgimento in cima
      for (const star of stars) {
        star.y += star.speed * delta;
        if (star.y - star.radius > height) {
          star.y = -star.radius;
          star.x = Math.random() * width;
        }
      }

      draw(time / 1000);
      frame = window.requestAnimationFrame(tick);
    }

    function start() {
      if (frame !== 0) return;
      lastTime = 0;
      frame = window.requestAnimationFrame(tick);
    }

    function stop() {
      if (frame === 0) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function handleResize() {
      seed();
      if (reduceMotion) draw(0);
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else if (!reduceMotion) start();
    }

    seed();

    if (reduceMotion) {
      draw(0);
    } else {
      start();
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block size-full", className)}
    />
  );
}
