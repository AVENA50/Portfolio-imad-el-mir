import { describe, expect, it } from "vitest";

import {
  sparklineArea,
  sparklinePath,
  sparklinePoints,
  sparklineTrend,
} from "@/lib/sparkline";

/**
 * Le sparkline sono geometria pura: nessun DOM, nessun React.
 * Sono anche il posto dove e piu facile sbagliare senza accorgersene —
 * una curva rovesciata sembra semplicemente un'altra curva.
 */

const BOX = { width: 100, height: 20, padding: 0 };

describe("sparklinePoints", () => {
  it("distribuisce i punti in orizzontale a intervalli uguali", () => {
    const points = sparklinePoints([1, 2, 3], BOX);

    expect(points.map((point) => point.x)).toEqual([0, 50, 100]);
  });

  it("rovescia l'asse Y: il valore piu alto sta in cima", () => {
    const points = sparklinePoints([0, 10], BOX);

    // In SVG l'origine e in alto a sinistra: y piccola = in alto
    expect(points[0]?.y).toBe(20);
    expect(points[1]?.y).toBe(0);
  });

  it("mette una serie piatta a meta altezza invece di dividere per zero", () => {
    const points = sparklinePoints([5, 5, 5], BOX);

    expect(points.every((point) => point.y === 10)).toBe(true);
  });

  it("rispetta il margine interno, cosi il tratto non viene tagliato", () => {
    const points = sparklinePoints([0, 10], { ...BOX, padding: 2 });

    expect(points[0]).toEqual({ x: 2, y: 18 });
    expect(points[1]).toEqual({ x: 98, y: 2 });
  });

  it("centra il punto singolo invece di appoggiarlo al bordo", () => {
    expect(sparklinePoints([7], BOX)).toEqual([{ x: 50, y: 10 }]);
  });

  it("su una serie vuota non restituisce nulla", () => {
    expect(sparklinePoints([], BOX)).toEqual([]);
  });
});

describe("sparklinePath", () => {
  it("produce l'attributo points di una polyline", () => {
    expect(sparklinePath([0, 10, 0], BOX)).toBe("0,20 50,0 100,20");
  });
});

describe("sparklineArea", () => {
  it("chiude la curva sulla base per poterla riempire", () => {
    const area = sparklineArea([0, 10], BOX);

    expect(area.startsWith("0,20")).toBe(true);
    expect(area.endsWith("100,20")).toBe(true);
  });

  it("su una serie vuota restituisce una stringa vuota", () => {
    expect(sparklineArea([], BOX)).toBe("");
  });
});

describe("sparklineTrend", () => {
  it("calcola la variazione fra primo e ultimo valore", () => {
    expect(sparklineTrend([100, 150])).toBe(50);
    expect(sparklineTrend([200, 100])).toBe(-50);
  });

  it("restituisce null quando non e calcolabile", () => {
    expect(sparklineTrend([])).toBeNull();
    expect(sparklineTrend([0, 10])).toBeNull();
  });
});
