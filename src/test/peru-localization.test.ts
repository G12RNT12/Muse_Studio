import { describe, expect, it } from "vitest";
import {
  convertCOPToPEN,
  formatPEN,
  FREE_SHIPPING_MIN,
  SHIPPING_COST,
  normalizePeruMobile,
  HAS_WHATSAPP_NUMBER,
  DELIVERY_ESTIMATE,
} from "../config";

describe("Peru localization", () => {
  it("converts and formats reference prices in soles", () => {
    expect(convertCOPToPEN(119000)).toBe(126.38);
    expect(formatPEN(126.38)).toBe("S/ 126.38");
    expect(FREE_SHIPPING_MIN).toBe(212.4);
    expect(SHIPPING_COST).toBe(12.74);
  });
  it("accepts Peruvian mobiles with or without country code", () => {
    expect(normalizePeruMobile("912345678")).toBe("+51 912345678");
    expect(normalizePeruMobile("+51 912 345 678")).toBe("+51 912345678");
    expect(normalizePeruMobile("3001234567")).toBeUndefined();
    expect(normalizePeruMobile("812345678")).toBeUndefined();
    expect(HAS_WHATSAPP_NUMBER).toBe(false);
    expect(DELIVERY_ESTIMATE).toBe("5–7 días hábiles");
  });
});
