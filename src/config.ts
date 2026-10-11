export const BRAND_NAME = "MUSE STUDIO";
export const WHATSAPP_NUMBER = "";
export const HAS_WHATSAPP_NUMBER = /^519\d{8}$/.test(WHATSAPP_NUMBER);
export const DELIVERY_ESTIMATE = "5–7 días hábiles";
export const DELIVERY_ESTIMATE_NOTE =
  "Plazo ilustrativo para esta demostración; no representa una promesa de entrega real.";
/** Static reference: open.er-api.com/v6/latest/COP, updated 2026-10-11 00:02:31 UTC. Not a live checkout rate. */
export const COP_TO_PEN_RATE = 0.001062;
export const convertCOPToPEN = (amount: number) => Math.round(amount * COP_TO_PEN_RATE * 100) / 100;
export const FREE_SHIPPING_MIN = convertCOPToPEN(200000);
export const SHIPPING_COST = convertCOPToPEN(12000);
export function formatPEN(n: number) {
  return (
    "S/ " +
    new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  );
}

export function normalizePeruMobile(value: string) {
  const digits = value.replace(/[\s()-]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("51") && digits.length === 11 ? digits.slice(2) : digits;
  return /^9\d{8}$/.test(local) ? `+51 ${local}` : undefined;
}
