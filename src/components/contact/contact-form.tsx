"use client";

import { useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/shared/icon";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { CONTACT_LIMITS } from "@/lib/contact/limits";
import type { Dictionary } from "@/lib/dictionary";
// `import type` sparisce alla compilazione: i tipi non finiscono nel bundle,
// quindi importarli da un file che dipende da zod non costa niente.
import type { ContactErrors } from "@/lib/contact/schema";

interface ContactFormProps {
  dictionary: Dictionary;
}

/**
 * Lo schema, caricato solo quando serve (M10-T7).
 *
 * **Il problema.** zod pesa circa 45 kB non compressi. Importandolo in
 * cima a questo file finiva nel bundle iniziale della pagina Contatti, che
 * infatti misurava 227 kB di First Load JS contro i 158-191 di tutte le
 * altre. Cioe la pagina piu pesante del sito era quella dove un
 * selezionatore decide di scriverti.
 *
 * **La soluzione, e perche non peggiora l'esperienza.** La validazione qui
 * scatta al primo invio, mai mentre si scrive: fino a quel momento zod non
 * serve a niente. Caricarlo dinamicamente lo sposta in un file separato,
 * che il browser scarica solo se qualcuno usa davvero il form.
 *
 * **E perche non si nota nemmeno il ritardo.** Il caricamento parte al
 * primo tocco su un campo, non al click su "Invia": mentre la persona
 * scrive il nome, i quaranta kilobyte sono gia arrivati.
 *
 * La cache e fuori dal componente perche deve sopravvivere ai render.
 */
let validator: Awaited<ReturnType<typeof importValidator>> | null = null;

/**
 * L'import sta in una funzione sua perche il tipo del modulo si ricava dal
 * suo valore di ritorno: la regola `consistent-type-imports` vieta di
 * scrivere `typeof import(...)` in una annotazione, e questa e la forma
 * equivalente che il linter accetta.
 */
function importValidator() {
  return import("@/lib/contact/schema");
}

async function loadValidator() {
  validator ??= await importValidator();
  return validator;
}

type Status = "idle" | "sending" | "sent";

/** Errore che riguarda l'invio, non un singolo campo. */
type FormError = "rateLimited" | "serverError" | "network" | null;

const EMPTY = { name: "", email: "", subject: "", message: "", website: "" };

/**
 * Form di contatto (M9-T11).
 *
 * **Valida con lo stesso schema del server.** Non e una copia: e proprio
 * lo stesso file. Il browser lo usa per dire subito cosa manca, il server
 * per non fidarsi del browser. Se le regole vivessero in due posti, prima
 * o poi divergerebbero e il form accetterebbe qualcosa che poi la rotta
 * rifiuta — l'utente vedrebbe un errore generico dopo aver scritto tutto.
 *
 * **Quando validare.** Non mentre si scrive: un errore che compare alla
 * terza lettera di un nome lungo dieci e solo rumore. Il primo controllo e
 * all'invio; da quel momento in poi il campo si rivalida a ogni battuta,
 * cosi l'errore sparisce appena e risolto invece di restare li fino al
 * tentativo successivo.
 */
export function ContactForm({ dictionary }: ContactFormProps) {
  const t = dictionary.contact;

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [formError, setFormError] = useState<FormError>(null);
  const [status, setStatus] = useState<Status>("idle");

  /** Diventa true al primo invio: prima di allora non si segnala nulla. */
  const submitted = useRef(false);

  function update(field: keyof typeof EMPTY, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);

    // Prima del primo invio non si segnala nulla, e prima di allora lo
    // schema puo non essere ancora arrivato: in entrambi i casi non c'e
    // niente da rivalidare.
    if (!submitted.current || !validator) return;

    const parsed = validator.contactSchema.safeParse(next);
    setErrors(
      parsed.success ? {} : validator.collectErrors(parsed.error.issues),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    submitted.current = true;
    setFormError(null);

    const { contactSchema, collectErrors } = await loadValidator();
    const parsed = contactSchema.safeParse(values);

    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (response.ok) {
        setStatus("sent");
        setValues(EMPTY);
        submitted.current = false;
        return;
      }

      const payload: unknown = await response.json().catch(() => null);
      const code =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error: unknown }).error)
          : "serverError";

      // Il server rivalida: se rifiuta qualcosa che qui era passato, i suoi
      // errori per campo hanno la precedenza sui nostri.
      if (
        payload &&
        typeof payload === "object" &&
        "fields" in payload &&
        payload.fields
      ) {
        setErrors(payload.fields as ContactErrors);
      }

      setStatus("idle");
      setFormError(code === "rateLimited" ? "rateLimited" : "serverError");
    } catch {
      // Qui ci si finisce solo se la richiesta non e proprio partita:
      // connessione assente, richiesta annullata. Merita un messaggio suo,
      // perche il rimedio e diverso — riprovare, non correggere.
      setStatus("idle");
      setFormError("network");
    }
  }

  if (status === "sent") {
    return (
      <div className="glass flex flex-col items-center rounded-panel p-10 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-pill border border-emerald-500/30 bg-emerald-500/12 text-emerald-300">
          <Icon name="check" className="size-6" />
        </span>

        <h3 className="mt-6 font-display text-xl font-bold text-ink">
          {t.success.title}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          {t.success.body}
        </p>

        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => setStatus("idle")}
        >
          {t.success.again}
        </Button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      // Il primo tocco su un campo fa partire il download dello schema, che
      // arriva mentre la persona scrive. `void` perche non c'e niente da
      // aspettare: se non fosse pronto al momento dell'invio, `handleSubmit`
      // lo attende comunque.
      onFocus={() => void loadValidator()}
      className="glass flex flex-col gap-6 rounded-panel p-7 md:p-8"
    >
      {/* `noValidate` disattiva i messaggi del browser: sono in inglese a
          prescindere dalla lingua della pagina e non si possono tradurre.
          I nostri arrivano dal dizionario. */}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label={t.form.name}
          required
          error={errors.name && t.errors[errors.name]}
        >
          {(props) => (
            <Input
              {...props}
              name="name"
              autoComplete="name"
              maxLength={CONTACT_LIMITS.nameMax}
              placeholder={t.form.namePlaceholder}
              value={values.name}
              invalid={Boolean(errors.name)}
              disabled={sending}
              onChange={(event) => update("name", event.target.value)}
            />
          )}
        </Field>

        <Field
          label={t.form.email}
          required
          error={errors.email && t.errors[errors.email]}
        >
          {(props) => (
            <Input
              {...props}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={CONTACT_LIMITS.emailMax}
              placeholder={t.form.emailPlaceholder}
              value={values.email}
              invalid={Boolean(errors.email)}
              disabled={sending}
              onChange={(event) => update("email", event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        label={t.form.subject}
        required
        error={errors.subject && t.errors[errors.subject]}
      >
        {(props) => (
          <Input
            {...props}
            name="subject"
            maxLength={CONTACT_LIMITS.subjectMax}
            placeholder={t.form.subjectPlaceholder}
            value={values.subject}
            invalid={Boolean(errors.subject)}
            disabled={sending}
            onChange={(event) => update("subject", event.target.value)}
          />
        )}
      </Field>

      <Field
        label={t.form.message}
        required
        hint={t.form.messageHint.replace(
          "{n}",
          String(CONTACT_LIMITS.messageMin),
        )}
        error={errors.message && t.errors[errors.message]}
      >
        {(props) => (
          <Textarea
            {...props}
            name="message"
            rows={6}
            maxLength={CONTACT_LIMITS.messageMax}
            placeholder={t.form.messagePlaceholder}
            value={values.message}
            invalid={Boolean(errors.message)}
            disabled={sending}
            onChange={(event) => update("message", event.target.value)}
          />
        )}
      </Field>

      {/* La trappola. Fuori dallo schermo, fuori dal percorso del Tab e
          nascosta agli screen reader: una persona non puo compilarla
          nemmeno volendo. Un robot legge il markup e la riempie. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      {/* `aria-live` fa annunciare l'esito senza spostare il fuoco: chi usa
          uno screen reader lo sente, chi naviga da tastiera non viene
          strappato dal punto in cui si trovava. */}
      <div aria-live="polite" className="min-h-0">
        {formError && (
          <p className="flex items-start gap-2.5 rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <Icon name="shield" className="mt-0.5 size-4 shrink-0" />
            {t.errors[formError]}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" iconRight="arrow-right" disabled={sending}>
          {sending ? t.form.sending : t.form.submit}
        </Button>

        <p className="text-xs text-ink-subtle">{t.form.required}</p>
      </div>
    </form>
  );
}
