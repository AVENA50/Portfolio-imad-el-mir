/**
 * Barrel degli effetti.
 *
 * Tutti client component: hanno bisogno di IntersectionObserver o di canvas,
 * quindi vivono nel browser. Vanno usati sui contenitori, non sui singoli
 * elementi di testo: un titolo che compare in ritardo si legge come un bug.
 */

export { Reveal, type RevealDirection } from "./reveal";
export { Stagger } from "./stagger";
export { Starfield } from "./starfield";
