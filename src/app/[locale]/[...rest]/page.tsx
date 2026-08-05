import { notFound } from "next/navigation";

/**
 * Rotta di raccolta per tutto cio che non corrisponde a nessuna pagina.
 *
 * Serve per una regola poco ovvia di Next: `not-found.tsx` dentro un segmento
 * dinamico intercetta solo le chiamate esplicite a `notFound()`, mentre le
 * URL senza corrispondenza finiscono alla 404 globale in `app/not-found.tsx`.
 * Nel nostro caso quel file non puo esistere, perche il root layout vive
 * dentro [locale] per avere <html lang> corretto.
 *
 * Questa pagina chiude il cerchio: cattura qualsiasi percorso residuo e
 * chiama `notFound()`, cosi si attiva la nostra 404 tradotta.
 *
 * Le rotte reali hanno sempre la precedenza su un catch-all, quindi non
 * oscura nulla: /it/projects usera la pagina Projects appena esistera.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
