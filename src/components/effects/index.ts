/**
 * Barrel degli effetti.
 *
 * Due famiglie, ed e utile tenerle distinte:
 *
 * - **Reveal, Stagger, Starfield** sono client component: hanno bisogno di
 *   IntersectionObserver o di un canvas, quindi vivono nel browser. Vanno
 *   usati sui contenitori, non sui singoli elementi di testo — un titolo
 *   che compare in ritardo si legge come un bug.
 * - **GlowBorder, GridBackground** sono pura CSS e restano sul server:
 *   non aggiungono un byte al bundle del browser.
 */

export {
  GlowBorder,
  glowBorderVariants,
  type GlowBorderProps,
} from "./glow-border";
export { GridBackground } from "./grid-background";
export { Reveal, type RevealDirection } from "./reveal";
export { Stagger } from "./stagger";
export { Starfield } from "./starfield";
