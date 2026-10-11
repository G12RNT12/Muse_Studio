import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type SizeInput = {
  productName: string;
  category: string;
  sizes: string[];
  sizeChart: string;
  heightCm: number;
  weightKg: number;
  bustCm?: number | undefined;
  waistCm?: number | undefined;
  hipCm?: number | undefined;
  fit: string;
  usualSize?: string | undefined;
};

export class GatewayError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function recommendSize(input: SizeInput) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new GatewayError(401, "Falta configurar Lovable AI.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  let streamErr: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    maxRetries: 0,
    system:
      "Eres asesora de tallas de una tienda de ropa streetwear femenina en Perú. Responde SOLO con JSON: " +
      '{"size":"<una de las tallas disponibles>","confidence":"alta|media|baja","reason":"<máx. 2 frases en español peruano, tono cercano>"}.',
    prompt: JSON.stringify(input),
    onError: ({ error }) => {
      streamErr = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  let text = "";
  try {
    text = await result.text;
  } catch (e) {
    streamErr ??= e;
  }
  if (streamErr || !text) {
    const status = (streamErr as { statusCode?: number })?.statusCode ?? 500;
    const msg =
      status === 429
        ? "Hay muchas consultas ahora, intenta en un momento."
        : status === 402
          ? "El asesor de tallas no está disponible por ahora."
          : "No pudimos calcular tu talla. Intenta de nuevo.";
    throw new GatewayError(status, msg);
  }
  const m = text.match(/\{[\s\S]*\}/);
  const parsed = m
    ? (JSON.parse(m[0]) as { size?: string; confidence?: string; reason?: string })
    : {};
  const size = input.sizes.includes(parsed.size ?? "") ? parsed.size! : "M";
  return { size, confidence: parsed.confidence ?? "media", reason: parsed.reason ?? "" };
}
