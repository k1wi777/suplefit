export type PesoRowRaw = {
  id?: number;
  peso: string | number;
  registradoEn: string | Date;
  createdAt?: string | Date;
};

export type PesoEntryEnriched = {
  id?: number;
  peso: number;
  registradoEn: string;
  createdAt: string;
  deltaPrev: number | null;
  deltaStart: number | null;
  isStart: boolean;
  isLatest: boolean;
};

export type PesoDayGroup = {
  fecha: string;
  entries: PesoEntryEnriched[];
  pesoMin: number;
  pesoMax: number;
  ultimoPeso: number;
};

/** Normaliza fechas de MySQL/JSON a YYYY-MM-DD */
export function normalizeDateKey(value: unknown): string {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return "";
}

function normalizeCreatedAt(row: PesoRowRaw, registradoEn: string): string {
  const raw = row.createdAt;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === "string" && raw.trim()) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const day = registradoEn || normalizeDateKey(row.registradoEn);
  return day ? `${day}T12:00:00.000Z` : new Date(0).toISOString();
}

function compareEntries(
  a: { createdAt: string; id?: number },
  b: { createdAt: string; id?: number }
): number {
  const t = a.createdAt.localeCompare(b.createdAt);
  if (t !== 0) return t;
  return (a.id ?? 0) - (b.id ?? 0);
}

export function enrichPesoHistorial(rows: PesoRowRaw[]): PesoEntryEnriched[] {
  const sorted = [...rows]
    .map((r) => {
      const registradoEn = normalizeDateKey(r.registradoEn);
      return {
        id: r.id,
        peso: Number(r.peso),
        registradoEn,
        createdAt: normalizeCreatedAt(r, registradoEn),
      };
    })
    .filter((r) => Number.isFinite(r.peso) && r.registradoEn)
    .sort(compareEntries);

  const startPeso = sorted[0]?.peso ?? null;

  return sorted.map((entry, i) => {
    const prev = i > 0 ? sorted[i - 1].peso : null;
    return {
      id: entry.id,
      peso: entry.peso,
      registradoEn: entry.registradoEn,
      createdAt: entry.createdAt,
      deltaPrev: prev != null ? Math.round((entry.peso - prev) * 10) / 10 : null,
      deltaStart:
        startPeso != null ? Math.round((entry.peso - startPeso) * 10) / 10 : null,
      isStart: i === 0,
      isLatest: i === sorted.length - 1,
    };
  });
}

export function groupPesoByDay(entries: PesoEntryEnriched[]): PesoDayGroup[] {
  const byDate = new Map<string, PesoEntryEnriched[]>();
  for (const e of entries) {
    const list = byDate.get(e.registradoEn) ?? [];
    list.push(e);
    byDate.set(e.registradoEn, list);
  }

  return Array.from(byDate.entries())
    .map(([fecha, dayEntries]) => {
      const sorted = [...dayEntries].sort(compareEntries);
      const pesos = sorted.map((e) => e.peso);
      return {
        fecha,
        entries: sorted,
        pesoMin: Math.min(...pesos),
        pesoMax: Math.max(...pesos),
        ultimoPeso: sorted[sorted.length - 1].peso,
      };
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function getPesoInicial(entries: PesoEntryEnriched[]): number | null {
  const start = entries.find((e) => e.isStart);
  return start?.peso ?? entries[0]?.peso ?? null;
}

export function getPesoUltimoHistorial(entries: PesoEntryEnriched[]): number | null {
  const latest = entries.find((e) => e.isLatest);
  return latest?.peso ?? entries[entries.length - 1]?.peso ?? null;
}

export function getChartPointsByDay(groups: PesoDayGroup[]): Array<{ fecha: string; peso: number }> {
  return [...groups]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((g) => ({ fecha: g.fecha, peso: g.ultimoPeso }));
}

export function formatPesoDate(dateKey: string): string {
  const key = normalizeDateKey(dateKey);
  if (!key) return "Fecha desconocida";
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return "Fecha desconocida";
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return "Fecha desconocida";
  return date.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
}

export function formatPesoTime(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
