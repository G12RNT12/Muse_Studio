import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  productName: z.string().max(200),
  category: z.string().max(50),
  sizes: z.array(z.string().max(5)).max(10),
  sizeChart: z.string().max(1000),
  heightCm: z.number().min(120).max(220),
  weightKg: z.number().min(30).max(200),
  bustCm: z.number().min(50).max(180).optional(),
  waistCm: z.number().min(40).max(180).optional(),
  hipCm: z.number().min(50).max(200).optional(),
  fit: z.enum(["Ajustado", "Regular", "Oversize"]),
  usualSize: z.string().max(5).optional(),
});

export const getSizeRecommendation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { recommendSize, GatewayError } = await import("./size-advisor.server");
    try {
      return { ok: true as const, ...(await recommendSize(data)) };
    } catch (e) {
      if (e instanceof GatewayError) return { ok: false as const, error: e.message };
      console.error(e);
      return { ok: false as const, error: "No pudimos calcular tu talla. Intenta de nuevo." };
    }
  });
