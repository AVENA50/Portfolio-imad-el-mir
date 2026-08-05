"use client";

import { useState } from "react";

import { GlowBorder, GridBackground, Stagger } from "@/components/effects";
import { EmptyState, Section, SectionHeading } from "@/components/shared";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Input,
  TabPanel,
  Tabs,
  Textarea,
} from "@/components/ui";
import type { Accent } from "@/types";

const ACCENTS: readonly Accent[] = [
  "violet",
  "blue",
  "indigo",
  "cyan",
  "teal",
  "green",
];

/**
 * Le classi vanno scritte per intero.
 * Tailwind cerca stringhe letterali nel sorgente: `bg-accent-${accent}`
 * non verrebbe mai generata, e i quadrati resterebbero trasparenti.
 */
const ACCENT_SWATCH: Record<Accent, string> = {
  violet: "bg-accent-violet",
  blue: "bg-accent-blue",
  indigo: "bg-accent-indigo",
  cyan: "bg-accent-cyan",
  teal: "bg-accent-teal",
  green: "bg-accent-green",
};

const SURFACES = [
  { token: "--color-bg", label: "bg", className: "bg-bg" },
  { token: "--color-bg-subtle", label: "bg-subtle", className: "bg-bg-subtle" },
  { token: "--color-surface", label: "surface", className: "bg-surface" },
  {
    token: "--color-surface-hover",
    label: "surface-hover",
    className: "bg-surface-hover",
  },
  {
    token: "--color-surface-strong",
    label: "surface-strong",
    className: "bg-surface-strong",
  },
] as const;

const TAB_ITEMS = [
  { value: "experience", label: "Esperienza", count: 4 },
  { value: "education", label: "Formazione", count: 2 },
  { value: "certificates", label: "Certificati", count: 6 },
] as const;

/**
 * Anteprima del design system.
 *
 * Pagina interna, esclusa dall'indicizzazione. Serve a due cose:
 * confrontare i componenti con i mockup in un colpo solo, e accorgersi
 * delle regressioni — se un token cambia, qui si vede subito su tutto.
 */
export function DesignSystemPreview() {
  const [tab, setTab] = useState<string>("experience");
  const [email, setEmail] = useState("");

  const emailError =
    email.length > 0 && !email.includes("@")
      ? "Inserisci un indirizzo email valido"
      : undefined;

  return (
    <>
      <Section spacing="sm">
        <SectionHeading
          eyebrow="Design system"
          title="Tutti i componenti, tutte le varianti"
          description="Pagina di verifica interna. Non e indicizzata e non compare nella navigazione."
        />
      </Section>

      {/* ------------------------------------------------------ tipografia -- */}
      <Section tone="subtle" spacing="sm">
        <SectionHeading as="h3" eyebrow="Scala" title="Tipografia" />
        <div className="mt-8 space-y-6">
          <p className="eyebrow">eyebrow · 12px</p>
          <p className="text-display">Display</p>
          <p className="text-h1">Titolo h1</p>
          <p className="text-h2">Titolo h2</p>
          <p className="text-h3">Titolo h3</p>
          <p className="text-lg text-ink-muted">
            Corpo grande — 18px, per introduzioni e paragrafi guida.
          </p>
          <p className="text-base text-ink-muted">
            Corpo normale — 16px, il testo corrente di tutto il sito.
          </p>
          <p className="text-sm text-ink-subtle">
            Corpo piccolo — 14px, per meta, date ed etichette.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------- colori -- */}
      <Section spacing="sm">
        <SectionHeading as="h3" eyebrow="Token" title="Superfici e accenti" />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SURFACES.map((surface) => (
            <div key={surface.token}>
              <div
                className={`h-20 rounded-card border border-border ${surface.className}`}
              />
              <p className="mt-2 text-xs text-ink-subtle">{surface.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {ACCENTS.map((accent) => (
            <div key={accent}>
              <div className={`h-20 rounded-card ${ACCENT_SWATCH[accent]}`} />
              <p className="mt-2 text-xs text-ink-subtle">{accent}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------- bottoni -- */}
      <Section tone="subtle" spacing="sm">
        <SectionHeading as="h3" eyebrow="Azioni" title="Button" />

        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primario</Button>
            <Button variant="secondary">Secondario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm" iconRight="arrow-right">
              Small
            </Button>
            <Button size="md" iconRight="arrow-right">
              Medium
            </Button>
            <Button size="lg" iconRight="arrow-right">
              Large
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button loading>In corso</Button>
            <Button disabled>Disabilitato</Button>
            <Button variant="secondary" iconOnly iconLeft="github">
              <span className="sr-only">GitHub</span>
            </Button>
            <Button iconLeft="download" variant="secondary">
              Scarica il CV
            </Button>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- badge -- */}
      <Section spacing="sm">
        <SectionHeading as="h3" eyebrow="Etichette" title="Badge" />

        <div className="mt-8 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            {ACCENTS.map((accent) => (
              <Badge key={accent} accent={accent}>
                {accent}
              </Badge>
            ))}
            <Badge>neutral</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm">small</Badge>
            <Badge size="md">medium</Badge>
            <Badge size="lg">large</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge accent="green" size="lg" dot>
              Disponibile per opportunita
            </Badge>
            <Badge accent="blue" dot>
              In corso
            </Badge>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- card -- */}
      <Section tone="subtle" spacing="sm">
        <SectionHeading
          as="h3"
          eyebrow="Contenitori"
          title="Card"
          description="Tre superfici: glass sfoca lo sfondo, flat lo imita senza costo, solid e piena."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(["glass", "flat", "solid"] as const).map((surface) => (
            <Card key={surface} surface={surface} interactive>
              <CardHeader>
                <Badge accent="indigo" size="sm">
                  Full Stack
                </Badge>
                <CardTitle>surface = {surface}</CardTitle>
                <CardDescription>
                  Passa il mouse: la card si alza di due pixel e il bordo si
                  accende.
                </CardDescription>
              </CardHeader>

              <CardBody>
                <div className="flex flex-wrap gap-2">
                  <Badge size="sm">Next.js</Badge>
                  <Badge size="sm">TypeScript</Badge>
                  <Badge size="sm">PostgreSQL</Badge>
                </div>
              </CardBody>

              <CardFooter>
                <Button size="sm" iconRight="arrow-right">
                  Apri
                </Button>
                <Button size="sm" variant="ghost" iconRight="external">
                  Codice
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- tabs -- */}
      <Section spacing="sm">
        <SectionHeading
          as="h3"
          eyebrow="Navigazione"
          title="Tabs"
          description="Prova con le frecce della tastiera: fra le schede ci si muove con sinistra e destra, Home ed End vanno agli estremi."
        />

        <div className="mt-8">
          <Tabs
            items={TAB_ITEMS}
            value={tab}
            onValueChange={setTab}
            idPrefix="ds"
            ariaLabel="Anteprima delle schede"
          />

          <div className="mt-6">
            {TAB_ITEMS.map((item) => (
              <TabPanel
                key={item.value}
                value={item.value}
                activeValue={tab}
                idPrefix="ds"
              >
                <Card surface="flat">
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>
                    Contenuto della scheda {item.label.toLowerCase()}.
                  </CardDescription>
                </Card>
              </TabPanel>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- campi -- */}
      <Section tone="subtle" spacing="sm">
        <SectionHeading
          as="h3"
          eyebrow="Form"
          title="Input"
          description="Scrivi qualcosa senza chiocciola nel campo email per vedere lo stato di errore."
        />

        <div className="mt-8 grid max-w-2xl gap-6">
          <Field label="Nome" required hint="Come devo chiamarti">
            {(field) => <Input placeholder="Il tuo nome" {...field} />}
          </Field>

          <Field label="Email" required error={emailError}>
            {(field) => (
              <Input
                type="email"
                placeholder="tu@esempio.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                invalid={Boolean(emailError)}
                {...field}
              />
            )}
          </Field>

          <Field label="Messaggio">
            {(field) => (
              <Textarea placeholder="Parlami del tuo progetto..." {...field} />
            )}
          </Field>

          <Field label="Campo disabilitato">
            {(field) => (
              <Input disabled placeholder="Non modificabile" {...field} />
            )}
          </Field>
        </div>
      </Section>

      {/* --------------------------------------------------------- effetti -- */}
      <Section spacing="sm">
        <SectionHeading
          as="h3"
          eyebrow="Movimento"
          title="Reveal e Stagger"
          description="Scorri fino a qui: le card salgono una dopo l'altra invece di accendersi tutte insieme. Con prefers-reduced-motion attivo compaiono gia visibili."
        />

        <Stagger step={90} className="mt-8 grid gap-6 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} surface="flat">
              <CardTitle>Elemento {index}</CardTitle>
              <CardDescription>
                Ritardo {Math.min((index - 1) * 90, 600)} ms
              </CardDescription>
            </Card>
          ))}
        </Stagger>
      </Section>

      {/* ------------------------------------------------ bordo e griglia -- */}
      <Section tone="subtle" spacing="sm">
        <SectionHeading
          as="h3"
          eyebrow="Superfici"
          title="GlowBorder e GridBackground"
          description="Due effetti di sola CSS, senza JavaScript. La cornice va usata con parsimonia: se la porta ogni card, smette di indicare qualcosa."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {(["brand", "violet", "subtle"] as const).map((tone) => (
            <GlowBorder key={tone} tone={tone} className="rounded-card">
              <Card surface="flat" className="h-full">
                <CardTitle>tone &ldquo;{tone}&rdquo;</CardTitle>
                <CardDescription>
                  Cornice ritagliata da uno pseudo-elemento: segue il raggio
                  degli angoli, cosa che un bordo in gradiente normale non fa.
                </CardDescription>
              </Card>
            </GlowBorder>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {(["radial", "bottom", "none"] as const).map((fade) => (
            <div
              key={fade}
              className="glass-flat relative h-44 overflow-hidden rounded-card"
            >
              <GridBackground fade={fade} size="sm" />
              <p className="absolute bottom-4 left-4 font-mono text-xs text-ink-muted">
                fade=&ldquo;{fade}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 max-w-3xl">
          <GlowBorder tone="brand" width="thick" glow className="rounded-panel">
            <div className="glass-flat rounded-panel p-8">
              <p className="font-display text-h3 font-bold">
                width=&ldquo;thick&rdquo; con glow
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                La combinazione da riservare a un solo elemento per pagina.
              </p>
            </div>
          </GlowBorder>
        </div>
      </Section>

      {/* ----------------------------------------------------- stato vuoto -- */}
      <Section spacing="sm">
        <SectionHeading as="h3" eyebrow="Stati" title="EmptyState" />

        <div className="mt-8 max-w-2xl">
          <EmptyState
            title="Nessun progetto trovato"
            description="Nessun progetto corrisponde ai filtri selezionati. Prova ad allargare la ricerca."
            action={
              <Button variant="secondary" iconLeft="close">
                Azzera i filtri
              </Button>
            }
          />
        </div>
      </Section>
    </>
  );
}
