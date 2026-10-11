import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { SIZE_CHART, type Product } from "@/data/products";
import { getSizeRecommendation } from "@/lib/size-advisor.functions";
import { ChoiceChips } from "./kinetics/controls";
import { FloatingInput, SubmitButton, type SubmitState } from "./kinetics/forms";

type Fit = "Ajustado" | "Regular" | "Oversize";

export function SizeAdvisor({
  product,
  onPick,
}: {
  product: Product;
  onPick: (size: string) => void;
}) {
  const ask = useServerFn(getSizeRecommendation);
  const [open, setOpen] = useState(false);
  const [m, setM] = useState({ height: "", weight: "", bust: "", waist: "", hip: "", usual: "" });
  const [fit, setFit] = useState<Fit>("Regular");
  const [state, setState] = useState<SubmitState>("idle");
  const [res, setRes] = useState<{ size: string; reason: string; confidence: string } | null>(null);
  const [err, setErr] = useState("");

  const num = (v: string) => (v.trim() ? Number(v) : undefined);
  const submit = async () => {
    const h = num(m.height),
      w = num(m.weight);
    if (!h || !w || h < 120 || h > 220 || w < 30 || w > 200) {
      setErr("Ingresa estatura (120–220 cm) y peso (30–200 kg).");
      return;
    }
    setErr("");
    setRes(null);
    setState("loading");
    try {
      const r = await ask({
        data: {
          productName: product.name,
          category: product.category,
          sizes: product.sizes,
          sizeChart: SIZE_CHART.map(
            ([s, b, c, ca]) => `${s}: busto ${b}, cintura ${c}, cadera ${ca}`,
          ).join("; "),
          heightCm: h,
          weightKg: w,
          bustCm: num(m.bust),
          waistCm: num(m.waist),
          hipCm: num(m.hip),
          fit,
          usualSize: m.usual.trim().toUpperCase() || undefined,
        },
      });
      if (!r.ok) {
        setErr(r.error);
        setState("idle");
        return;
      }
      setRes(r);
      setState("done");
      onPick(r.size);
      setTimeout(() => setState("idle"), 1200);
    } catch {
      setErr("Revisa tus medidas e intenta de nuevo.");
      setState("idle");
    }
  };

  const field = (k: keyof typeof m, label: string) => (
    <FloatingInput
      name={`sa-${k}`}
      label={label}
      inputMode="numeric"
      value={m[k]}
      onChange={(e) => setM({ ...m, [k]: e.target.value })}
    />
  );

  return (
    <div className="mt-4 border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 font-mono text-xs uppercase"
      >
        <Sparkles className="h-4 w-4 text-accent" /> ¿No sabes tu talla? Te ayudamos
      </button>
      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <div className="grid grid-cols-2 gap-3">
            {field("height", "Estatura (cm)")}
            {field("weight", "Peso (kg)")}
            {field("bust", "Busto (cm, opc.)")}
            {field("waist", "Cintura (cm, opc.)")}
            {field("hip", "Cadera (cm, opc.)")}
            <FloatingInput
              name="sa-usual"
              label="Tu talla usual (opc.)"
              value={m.usual}
              onChange={(e) => setM({ ...m, usual: e.target.value })}
            />
          </div>
          <p className="font-mono text-[11px] uppercase">¿Cómo te gusta que te quede?</p>
          <ChoiceChips<Fit>
            options={["Ajustado", "Regular", "Oversize"]}
            value={fit}
            onChange={setFit}
          />
          {err && <p className="font-mono text-xs text-destructive">{err}</p>}
          <SubmitButton
            state={state}
            label="Recomendar mi talla"
            onClick={submit}
            className="w-full bg-foreground text-background"
          />
          {res && (
            <div className="bg-frame p-3 text-sm">
              <p className="font-display font-bold uppercase">
                Tu talla: <span className="text-accent">{res.size}</span>{" "}
                <span className="font-mono text-[11px] font-normal normal-case text-muted-foreground">
                  · confianza {res.confidence}
                </span>
              </p>
              {res.reason && <p className="mt-1 text-muted-foreground">{res.reason}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
