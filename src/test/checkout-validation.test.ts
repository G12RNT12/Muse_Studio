import { describe, expect, it } from "vitest";
import { validateCheckoutField } from "@/lib/checkout-validation";

describe("checkout demo validation", () => {
  it("requires non-empty customer and shipping fields", () => {
    expect(validateCheckoutField("nombre", "  ")).toBe("Este campo es obligatorio");
    expect(validateCheckoutField("direccion", "A")).toBe("Este campo es obligatorio");
    expect(validateCheckoutField("distrito", "Demo")).toBeUndefined();
  });

  it("validates email and Peruvian mobile formats", () => {
    expect(validateCheckoutField("email", "persona@ejemplo.example")).toBeUndefined();
    expect(validateCheckoutField("email", "correo-no-valido")).toBe("Ingresa un correo válido");
    expect(validateCheckoutField("telefono", "900 000 000")).toBeUndefined();
    expect(validateCheckoutField("telefono", "000000000")).toContain("celular peruano");
  });

  it("allows optional notes to remain empty", () => {
    expect(validateCheckoutField("notas", "")).toBeUndefined();
  });
});
