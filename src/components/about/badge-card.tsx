import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Il badge, in HTML.
 *
 * Serve a tre situazioni diverse, ed e la stessa cosa in tutte e tre: la
 * pagina appena aperta prima che il 3D scenda, chi ha chiesto meno
 * animazioni al sistema, e chi apre il sito dal telefono. In tutti i casi
 * l'informazione non cambia — cambia solo se la si puo prendere a mano.
 *
 * Resta un Server Component: e markup e CSS, non ha bisogno di JavaScript
 * nel browser e quindi non ne spedisce.
 */

interface BadgeCardProps {
  name: string;
  role: string;
  footer: string;
  photoSrc?: string;
  photoAlt: string;
  className?: string;
}

/** "Imad El Mir" diventa "IM". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function BadgeCard({
  name,
  role,
  footer,
  photoSrc,
  photoAlt,
  className,
}: BadgeCardProps) {
  return (
    <div
      className={cn(
        // Le stesse proporzioni della card nel modello 3D: 0.716.
        "relative flex aspect-[0.716] w-full max-w-[17rem] flex-col overflow-hidden rounded-panel border border-border bg-surface shadow-glow-card",
        className,
      )}
    >
      {/* Il cordino, accennato: senza, la card sembra appoggiata invece che
          appesa, e il salto verso la versione 3D e piu brusco. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-600 via-violet-500 to-blue-500"
      />

      <div className="flex flex-1 flex-col items-center px-6 pt-8 pb-6">
        <div className="relative aspect-[0.96] w-full overflow-hidden rounded-card border border-border bg-surface-strong">
          {photoSrc ? (
            <Image
              src={photoSrc}
              alt={photoAlt}
              fill
              sizes="17rem"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold text-violet-300">
              {initials(name)}
            </span>
          )}
        </div>

        <p className="mt-5 text-center font-display text-lg font-bold tracking-wide text-ink uppercase">
          {name}
        </p>
        <p className="mt-1 text-center text-sm text-ink-muted">{role}</p>

        <span aria-hidden className="mt-auto h-px w-24 bg-border" />

        <p className="mt-4 font-mono text-xs text-ink-subtle">{footer}</p>
      </div>
    </div>
  );
}
