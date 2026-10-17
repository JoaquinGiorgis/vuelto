import { isAddress } from "viem";

export type Charge = {
  to: `0x${string}`; // quién cobra
  amount: number; // en ARS (= wARS, 1:1)
  concept: string;
  payer?: string; // nombre de quien paga, opcional
  fromBlock: string; // el agente busca pagos desde acá
};

// El cobro viaja en el link: no hay base de datos que mantener.
export function encodeCharge(charge: Charge): string {
  const json = JSON.stringify(charge);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeCharge(code: string): Charge | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const c = JSON.parse(json) as Charge;
    if (!isAddress(c.to) || !(c.amount > 0)) return null;
    return c;
  } catch {
    return null;
  }
}

// Interpreta pedidos en lenguaje natural:
// "cobrale 18.500 a Martina por el asado" -> { amount: 18500, payer: "Martina", concept: "el asado" }
export function parseIntent(text: string) {
  const clean = text.trim();
  const amountMatch = clean.match(/\$?\s*(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,(\d{1,2}))?\s*(k|mil)?/i);
  let amount = 0;
  if (amountMatch) {
    amount = Number(amountMatch[1].replace(/[.\s]/g, ""));
    if (amountMatch[2]) amount += Number(`0.${amountMatch[2]}`);
    if (amountMatch[3]) amount *= 1000;
  }
  const payer = clean.match(/\ba\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)/)?.[1];
  const concept = clean.match(/\bpor\s+(.+)$/i)?.[1]?.replace(/[.\s]+$/, "");
  return { amount, payer, concept };
}

export const formatArs = (n: number) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n);

export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
