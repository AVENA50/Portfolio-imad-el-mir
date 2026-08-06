/**
 * Barrel della pagina "Chi sono".
 *
 * `Lanyard` e `lanyard-scene` **non** sono esportati qui di proposito. Un
 * barrel viene importato per intero prima che il bundler decida cosa
 * tenere, e la scena si porta dietro three e il motore fisico: basterebbe
 * un `import { AboutHero } from "@/components/about"` per trascinarsi un
 * megabyte dove non serve. Il badge 3D si importa dal suo file, da chi
 * decide davvero di usarlo.
 */

export { AboutHero } from "./about-hero";
export { AboutStory } from "./about-story";
export { AboutTransferable } from "./about-transferable";
export { BadgeCard } from "./badge-card";
export { Passions } from "./passions";
export { PortraitFrame } from "./portrait-frame";
