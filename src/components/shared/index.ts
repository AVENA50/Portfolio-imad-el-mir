/**
 * Barrel dei componenti trasversali.
 *
 * Diversi da `components/ui`: quelli sono primitive senza contesto (un
 * bottone e un bottone ovunque), questi conoscono il layout del sito —
 * la larghezza delle sezioni, il ritmo verticale, la gerarchia dei titoli.
 */

export { EmptyState } from "./empty-state";
export { Icon } from "./icon";
export { JsonLd } from "./json-ld";
export { LocaleSwitcher } from "./locale-switcher";
export { Section, sectionVariants, type SectionProps } from "./section";
export { SectionHeading } from "./section-heading";
