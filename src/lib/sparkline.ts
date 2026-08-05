/**
 * Sparkline: la micro-curva dentro i badge metrica dei case study.
 *
 * Nessuna libreria di grafici. Una sparkline e una polilinea di dieci punti
 * dentro un riquadro di 96x28 pixel: importare Recharts per questo
 * significherebbe spedire al browser un motore di grafici completo per
 * disegnare otto segmenti. Qui e una stringa calcolata sul server, dentro
 * un SVG che non porta con se nemmeno una riga di JavaScript.
 *
 * Funzioni pure, senza React: si testano da sole (tests/unit/sparkline.test.ts).
 */

export interface SparklineBox {
  width: number;
  height: number;
  /** Margine interno, cosi il tratto non viene tagliato ai bordi. */
  padding?: number;
}

export interface SparklinePoint {
  x: number;
  y: number;
}

/**
 * Proietta i valori nel riquadro.
 *
 * L'asse Y e rovesciato perche in SVG l'origine e in alto a sinistra: senza
 * il ribaltamento la curva scenderebbe quando i numeri salgono.
 *
 * Se tutti i valori coincidono l'escursione e zero: invece di dividere per
 * zero la linea viene disegnata a meta altezza, che e la lettura corretta
 * di una serie piatta.
 */
export function sparklinePoints(
  values: readonly number[],
  { width, height, padding = 2 }: SparklineBox,
): SparklinePoint[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  const usableWidth = Math.max(0, width - padding * 2);
  const usableHeight = Math.max(0, height - padding * 2);

  // Un solo valore: sta al centro, altrimenti dividerebbe per zero
  const step = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  return values.map((value, index) => {
    const ratio = span === 0 ? 0.5 : (value - min) / span;

    return {
      x: padding + (values.length > 1 ? index * step : usableWidth / 2),
      y: padding + usableHeight - ratio * usableHeight,
    };
  });
}

/** Punti nel formato dell'attributo `points` di <polyline>. */
export function sparklinePath(
  values: readonly number[],
  box: SparklineBox,
): string {
  return sparklinePoints(values, box)
    .map((point) => `${round(point.x)},${round(point.y)}`)
    .join(" ");
}

/**
 * Area sotto la curva, chiusa sulla base: e il velo sfumato che rende
 * leggibile l'andamento anche quando la linea e sottile.
 */
export function sparklineArea(
  values: readonly number[],
  box: SparklineBox,
): string {
  const points = sparklinePoints(values, box);
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return "";

  const line = points
    .map((point) => `${round(point.x)},${round(point.y)}`)
    .join(" ");

  return `${round(first.x)},${round(box.height)} ${line} ${round(last.x)},${round(box.height)}`;
}

/**
 * Variazione percentuale fra primo e ultimo valore.
 * Restituisce null quando non e calcolabile, cosi il componente sa che non
 * deve mostrare nulla invece di stampare "Infinity%".
 */
export function sparklineTrend(values: readonly number[]): number | null {
  const first = values[0];
  const last = values[values.length - 1];

  if (first === undefined || last === undefined || first === 0) return null;

  return ((last - first) / Math.abs(first)) * 100;
}

/** Due decimali bastano: il resto ingrassa l'HTML senza spostare un pixel. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
