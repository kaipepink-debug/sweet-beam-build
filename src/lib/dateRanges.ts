export type RangePreset =
  | "hoje"
  | "ontem"
  | "7d"
  | "15d"
  | "30d"
  | "mes"
  | "max"
  | "custom";

export const PRESET_LABELS: Record<RangePreset, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  "7d": "Últimos 7 dias",
  "15d": "Últimos 15 dias",
  "30d": "Últimos 30 dias",
  mes: "Este mês",
  max: "Máximo",
  custom: "Personalizado",
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export function getRange(
  preset: RangePreset,
  custom?: { from?: Date; to?: Date }
): { from: Date; to: Date } {
  const now = new Date();
  const today = startOfDay(now);
  switch (preset) {
    case "hoje":
      return { from: today, to: endOfDay(now) };
    case "ontem": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: y, to: endOfDay(y) };
    }
    case "7d": {
      const f = new Date(today);
      f.setDate(f.getDate() - 6);
      return { from: f, to: endOfDay(now) };
    }
    case "15d": {
      const f = new Date(today);
      f.setDate(f.getDate() - 14);
      return { from: f, to: endOfDay(now) };
    }
    case "30d": {
      const f = new Date(today);
      f.setDate(f.getDate() - 29);
      return { from: f, to: endOfDay(now) };
    }
    case "mes": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: f, to: endOfDay(now) };
    }
    case "max":
      return { from: new Date("2020-01-01"), to: endOfDay(now) };
    case "custom": {
      const f = custom?.from ? startOfDay(custom.from) : today;
      const t = custom?.to ? endOfDay(custom.to) : endOfDay(now);
      return { from: f, to: t };
    }
  }
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dateKey(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toISOString().slice(0, 10);
}

export function eachDay(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
