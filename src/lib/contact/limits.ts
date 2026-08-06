/**
 * I limiti dei campi del form, **senza dipendenze** (M10-T7).
 *
 * Stavano in `schema.ts` insieme allo schema zod, ed e li il problema: il
 * form li usa negli attributi `maxLength` degli input, quindi importava
 * quel file, quindi si portava dietro zod nel bundle del browser. Risultato
 * misurato sulla build: la pagina Contatti pesava 227 kB di First Load JS
 * contro i 158-191 di tutte le altre.
 *
 * Separandoli, il form puo leggere i numeri senza toccare zod, e lo schema
 * lo carica solo quando serve davvero validare. Le regole restano scritte
 * in un posto solo: questi numeri sono la fonte, e `schema.ts` li importa
 * da qui invece di ripeterli.
 */
export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  subjectMin: 3,
  subjectMax: 120,
  messageMin: 20,
  messageMax: 2000,
} as const;
