import { normalizePeruMobile } from "@/config";

export type CheckoutField =
  | "nombre"
  | "telefono"
  | "email"
  | "departamento"
  | "provincia"
  | "direccion"
  | "distrito"
  | "notas";

export function validateCheckoutField(field: CheckoutField, value: string): string | undefined {
  const trimmed = value.trim();
  if (field === "notas") return;
  if (field === "email")
    return /^\S+@\S+\.\S+$/.test(trimmed) ? undefined : "Ingresa un correo válido";
  if (field === "telefono")
    return normalizePeruMobile(trimmed)
      ? undefined
      : "Ingresa un celular peruano de 9 dígitos que empiece con 9";
  return trimmed.length >= 2 ? undefined : "Este campo es obligatorio";
}
