import { cn } from "@/lib/cn";
import { sparklineArea, sparklinePath } from "@/lib/sparkline";
import type { ProjectMetric } from "@/types";

interface ProjectMetricsProps {
  metrics: readonly ProjectMetric[];
  className?: string;
}

/** Riquadro della sparkline. Piccolo di proposito: e un accento, non un grafico. */
const BOX = { width: 96, height: 28, padding: 3 } as const;

/**
 * Curva di andamento dentro un badge metrica.
 *
 * Puramente decorativa, quindi `aria-hidden`: il numero accanto dice gia
 * tutto, e uno screen reader che leggesse "polilinea" non aggiungerebbe
 * nulla. Il valore informativo sta nel testo, non nel disegno.
 *
 * Il gradiente ha un id derivato dall'indice perche in una pagina possono
 * esserci quattro sparkline: con un id fisso tutte userebbero il primo.
 */
function Sparkline({ values, id }: { values: readonly number[]; id: string }) {
  if (values.length < 2) return null;

  const gradientId = `sparkline-${id}`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="mt-3 h-7 w-full text-violet-400"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={sparklineArea(values, BOX)}
        fill={`url(#${gradientId})`}
      />

      <polyline
        points={sparklinePath(values, BOX)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Badge metrica del case study (M7-T3).
 *
 * I numeri arrivano dal frontmatter come stringhe gia formattate ("2.4M",
 * "98%", "< 200ms") e non come numeri da formattare qui: una metrica e una
 * frase, non un dato. "186 pull request" e "40 MB di storia" hanno unita
 * diverse e nessuna funzione di formattazione le indovinerebbe entrambe.
 *
 * `dl` invece di una griglia di `div`: label e valore sono coppie
 * termine/definizione, ed e cosi che uno screen reader le annuncia.
 */
export function ProjectMetrics({ metrics, className }: ProjectMetricsProps) {
  if (metrics.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid gap-4",
        metrics.length >= 4
          ? "grid-cols-2 lg:grid-cols-4"
          : "grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="glass rounded-card px-5 py-4 backdrop-blur-xl"
        >
          <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
            {metric.label}
          </dt>

          <dd className="mt-2 font-display text-3xl leading-none font-bold text-ink">
            {metric.value}
          </dd>

          {metric.hint && (
            <p className="mt-2 text-xs leading-snug text-ink-subtle">
              {metric.hint}
            </p>
          )}

          {metric.trend && (
            <Sparkline values={metric.trend} id={String(index)} />
          )}
        </div>
      ))}
    </dl>
  );
}
