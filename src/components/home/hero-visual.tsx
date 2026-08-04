import { Code2 } from "lucide-react";
import { FaJava } from "react-icons/fa";
import { SiNextdotjs, SiPython, SiReact, SiTypescript } from "react-icons/si";
import type { ComponentType, CSSProperties } from "react";

import { EarthGlobe } from "@/components/home/earth-globe";
import { cn } from "@/lib/cn";

interface OrbitTech {
  label: string;
  Glyph: ComponentType<{ className?: string }>;
  /** Colore del marchio, usato per il glow della tile. */
  color: string;
  /** Posizione sull'anello, in gradi. 0 = ore 12. */
  angle: number;
}

/**
 * Tecnologie in orbita.
 *
 * Elenco locale al componente: in M4-T2 nasce `config/tech-stack.ts`, il
 * registro unico con slug, gruppo e colore, e questo array verra sostituito
 * da una selezione fatta su quello.
 */
const INNER_ORBIT: readonly OrbitTech[] = [
  { label: "React", Glyph: SiReact, color: "#61DAFB", angle: 20 },
  { label: "Python", Glyph: SiPython, color: "#3776AB", angle: 155 },
  { label: "Java", Glyph: FaJava, color: "#EA2D2E", angle: 265 },
];

const OUTER_ORBIT: readonly OrbitTech[] = [
  { label: "TypeScript", Glyph: SiTypescript, color: "#3178C6", angle: 95 },
  { label: "Next.js", Glyph: SiNextdotjs, color: "#FFFFFF", angle: 205 },
  { label: "Codice", Glyph: Code2, color: "#A78BFA", angle: 330 },
];

interface OrbitProps {
  items: readonly OrbitTech[];
  /** Raggio come percentuale del lato del contenitore. */
  radius: number;
  duration: string;
  reverse?: boolean;
}

/**
 * Un anello di tile.
 *
 * Quattro livelli di annidamento, tutti necessari:
 *   ring      ruota          -> muove le tile lungo il cerchio
 *   slot      rotate statico -> distribuisce le tile sull'anello
 *   anchor    translate      -> le spinge sul raggio
 *   counter   ruota al contrario + rotate statico -> le tiene dritte
 *
 * Senza gli ultimi due i loghi girerebbero su se stessi e a meta giro
 * si leggerebbero capovolti.
 */
function Orbit({ items, radius, duration, reverse = false }: OrbitProps) {
  return (
    <div
      className={cn(
        "absolute inset-0",
        reverse ? "orbit-ring-reverse" : "orbit-ring",
      )}
      style={{ "--orbit-duration": duration } as CSSProperties}
    >
      {items.map((tech) => (
        <div
          key={tech.label}
          className="absolute inset-0"
          style={{ transform: `rotate(${tech.angle}deg)` }}
        >
          {/* La posizione sull'anello va espressa con top/left, non con
              translate: una percentuale di translate si riferisce alla tile
              stessa, non al contenitore, e il raggio verrebbe sbagliato. */}
          <div
            className="absolute"
            style={{
              top: `${50 - radius}%`,
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={cn(reverse ? "orbit-ring" : "orbit-ring-reverse")}
              style={{ "--orbit-duration": duration } as CSSProperties}
            >
              <div style={{ transform: `rotate(${-tech.angle}deg)` }}>
                <span
                  title={tech.label}
                  className="glass flex size-[4.5rem] items-center justify-center rounded-panel lg:size-24"
                  style={{ boxShadow: `0 0 32px -12px ${tech.color}` }}
                >
                  {/* Il colore e quello del marchio, non del tema */}
                  <span style={{ color: tech.color }}>
                    <tech.Glyph className="size-9 lg:size-12" />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Visual dell'hero: pianeta e tecnologie in orbita.
 *
 * Tutto in CSS, nessun JavaScript e nessuna immagine: il pianeta e fatto di
 * gradienti sovrapposti, quindi pesa zero, resta nitido a ogni risoluzione
 * e si adatta ai token del tema.
 */
export function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative aspect-square w-full max-w-[40rem]", className)}
    >
      {/* Alone esterno */}
      <div className="absolute inset-[9%] rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute inset-[23%] rounded-full bg-violet-600/25 blur-3xl" />

      {/* Corpo del pianeta: la luce viene da sinistra in alto */}
      <div
        className="absolute inset-[18%] rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 26%, #1e3a8a 0%, #101a3d 34%, #070b1c 62%, #04060f 100%)",
          boxShadow:
            "inset 18px 18px 60px -30px #93c5fdcc, inset -30px -20px 80px -40px #7c3aed66, 0 0 90px -20px #3b82f659",
        }}
      />

      {/* Bordo illuminato: un anello mascherato, con il gradiente che
          si accende solo dove batte la luce */}
      <div
        className="absolute inset-[18%] rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(142deg, #dbeafe 0%, #60a5fa 14%, #3b82f6 26%, transparent 46%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 63%, #000 67%, #000 100%)",
          maskImage:
            "radial-gradient(circle, transparent 63%, #000 67%, #000 100%)",
        }}
      />

      {/* Continenti: dati geografici reali resi a matrice di punti.
          Il pianeta CSS sotto fa da mare e da illuminazione. */}
      <div className="absolute inset-[18%] overflow-hidden rounded-full">
        <EarthGlobe />
      </div>

      {/* Terminatore: l'ombra sul lato opposto alla luce, sopra i continenti */}
      <div
        className="absolute inset-[18%] rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 28% 24%, transparent 30%, #04060fb3 72%, #04060f 100%)",
        }}
      />

      {/* Anelli: raggi e velocita diversi, versi opposti */}
      <Orbit items={INNER_ORBIT} radius={41} duration="34s" />
      <Orbit items={OUTER_ORBIT} radius={50} duration="46s" reverse />
    </div>
  );
}
