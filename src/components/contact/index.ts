/**
 * Barrel della pagina Contatti.
 *
 * `ContactForm` e un client component, `ContactInfo` resta sul server.
 * Il confine passa esattamente li: il form ha stato e ascolta eventi, il
 * blocco informazioni e markup e basta e non deve costare un byte di
 * JavaScript al browser.
 */

export { ContactForm } from "./contact-form";
export { ContactInfo } from "./contact-info";
