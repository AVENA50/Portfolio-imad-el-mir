"use client";

import { useEffect, useState } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/**
 * Le due texture del badge, disegnate su canvas nel browser.
 *
 * Il modello originale arrivava con una texture cotta dentro: 2,29 MB di
 * PNG su 2,46 MB di file, cioe il 93% del peso era un'immagine con sopra
 * il logo di qualcun altro. Disegnandola qui il GLB scende a 157 KB e
 * resta solo geometria — e soprattutto il badge diventa **dato**: cambiare
 * nome, ruolo o foto e una stringa in un file, non un riesport da Blender.
 *
 * Il disegno usa i font gia caricati dalla pagina. `document.fonts.ready`
 * non e un dettaglio: senza attesa il canvas misura il testo con il font
 * di sistema, poi il font vero arriva e le righe risultano storte, perche
 * il canvas e un'immagine e non si ridisegna da solo.
 */

/** Proporzione della faccia della card nel modello: 0.7164 x 1.0000. */
const BADGE_WIDTH = 768;
const BADGE_HEIGHT = 1072;

interface BadgeOptions {
  name: string;
  role: string;
  /** Riga piccola in fondo: dominio, anno, matricola finta. */
  footer: string;
  /** URL della foto, sotto /public. Assente = iniziali. */
  photoUrl?: string;
}

/** Legge un font stack dai token CSS, cosi il badge usa i font del sito. */
function fontStack(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}

/** Rettangolo con angoli arrotondati, come `border-radius`. */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/**
 * Carica un'immagine, o restituisce null se non arriva.
 *
 * Un badge senza foto e ancora un badge; un badge che non compare perche
 * un file manca e una pagina rotta. Per questo il fallimento non alza
 * un'eccezione: si disegnano le iniziali e si va avanti.
 */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

/** Le iniziali del nome: "Imad El Mir" diventa "IM". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Disegna la foto dentro un riquadro **senza deformarla**.
 *
 * Il ritaglio e l'equivalente di `object-fit: cover`: si scala sul lato
 * corto e si centra. Allungare una faccia per farla stare in un rettangolo
 * e il modo piu veloce per far sembrare dilettantesco un portfolio.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

/**
 * La faccia stampata del badge.
 *
 * Restituisce `null` fino a quando font e foto non sono pronti: chi la usa
 * mostra la card senza stampa per quei pochi millisecondi, invece di far
 * comparire un testo che salta di posizione quando il font arriva.
 */
export function useBadgeTexture({
  name,
  role,
  footer,
  photoUrl,
}: BadgeOptions): CanvasTexture | null {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: CanvasTexture | null = null;

    async function draw() {
      const [photo] = await Promise.all([
        photoUrl ? loadImage(photoUrl) : Promise.resolve(null),
        document.fonts.ready,
      ]);
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.width = BADGE_WIDTH;
      canvas.height = BADGE_HEIGHT;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const display = fontStack("--font-display", "system-ui, sans-serif");
      const sans = fontStack("--font-sans", "system-ui, sans-serif");
      const mono = fontStack("--font-mono", "ui-monospace, monospace");

      // Gli angoli restano trasparenti: sotto c'e la plastica della card,
      // che nel modello ha gia i bordi arrotondati. Una stampa quadrata
      // sporgerebbe dagli angoli.
      roundedRect(ctx, 0, 0, BADGE_WIDTH, BADGE_HEIGHT, 46);
      ctx.clip();

      const background = ctx.createLinearGradient(0, 0, 0, BADGE_HEIGHT);
      background.addColorStop(0, "#151a33");
      background.addColorStop(0.55, "#0b0f1e");
      background.addColorStop(1, "#070a14");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, BADGE_WIDTH, BADGE_HEIGHT);

      // Fascia d'accento in alto: e l'unico elemento colorato, e serve a
      // dare un verso alla card quando ruota.
      const accent = ctx.createLinearGradient(0, 0, BADGE_WIDTH, 0);
      accent.addColorStop(0, "#7c3aed");
      accent.addColorStop(0.5, "#8b5cf6");
      accent.addColorStop(1, "#3b82f6");
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, BADGE_WIDTH, 14);

      // Alone viola dietro la foto, per staccarla dal fondo scuro.
      const halo = ctx.createRadialGradient(
        BADGE_WIDTH / 2,
        380,
        40,
        BADGE_WIDTH / 2,
        380,
        420,
      );
      halo.addColorStop(0, "rgba(139, 92, 246, 0.30)");
      halo.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 60, BADGE_WIDTH, 700);

      const photoX = 114;
      const photoY = 120;
      const photoWidth = 540;
      const photoHeight = 560;

      ctx.save();
      roundedRect(ctx, photoX, photoY, photoWidth, photoHeight, 32);
      ctx.clip();

      if (photo) {
        drawCover(ctx, photo, photoX, photoY, photoWidth, photoHeight);
      } else {
        ctx.fillStyle = "#1a1f33";
        ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
        ctx.fillStyle = "#c4b5fd";
        ctx.font = `700 180px ${display}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          initials(name),
          photoX + photoWidth / 2,
          photoY + photoHeight / 2,
        );
      }
      ctx.restore();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 2;
      roundedRect(ctx, photoX, photoY, photoWidth, photoHeight, 32);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = "#f8fafc";
      ctx.font = `700 68px ${display}`;
      ctx.fillText(name.toUpperCase(), BADGE_WIDTH / 2, 790);

      ctx.fillStyle = "#94a3b8";
      ctx.font = `500 34px ${sans}`;
      ctx.fillText(role, BADGE_WIDTH / 2, 846);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, 906);
      ctx.lineTo(BADGE_WIDTH - 180, 906);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = `400 26px ${mono}`;
      ctx.fillText(footer, BADGE_WIDTH / 2, 972);

      created = new CanvasTexture(canvas);
      created.colorSpace = SRGBColorSpace;
      created.anisotropy = 8;
      created.needsUpdate = true;

      setTexture(created);
    }

    void draw();

    return () => {
      cancelled = true;
      created?.dispose();
    };
  }, [name, role, footer, photoUrl]);

  return texture;
}

/**
 * Il nastro: gradiente d'accento con il nome ripetuto, come i cordini
 * veri delle conferenze.
 *
 * `RepeatWrapping` sull'asse U permette a meshline di allungare la texture
 * lungo la corda: la ripetizione la decide chi la usa, non questa funzione.
 */
export function useBandTexture(label: string): CanvasTexture | null {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: CanvasTexture | null = null;

    async function draw() {
      await document.fonts.ready;
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 64;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const stripe = ctx.createLinearGradient(0, 0, 0, 64);
      stripe.addColorStop(0, "#4c1d95");
      stripe.addColorStop(0.5, "#7c3aed");
      stripe.addColorStop(1, "#3b1d95");
      ctx.fillStyle = stripe;
      ctx.fillRect(0, 0, 512, 64);

      // Bordi piu scuri: danno l'idea del tessuto cucito ai lati.
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, 512, 6);
      ctx.fillRect(0, 58, 512, 6);

      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.font = `600 24px ${fontStack("--font-sans", "system-ui, sans-serif")}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${label}  ·  ${label}`, 256, 34);

      created = new CanvasTexture(canvas);
      created.colorSpace = SRGBColorSpace;
      created.wrapS = RepeatWrapping;
      created.wrapT = RepeatWrapping;
      created.needsUpdate = true;

      setTexture(created);
    }

    void draw();

    return () => {
      cancelled = true;
      created?.dispose();
    };
  }, [label]);

  return texture;
}
