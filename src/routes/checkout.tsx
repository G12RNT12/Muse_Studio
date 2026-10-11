import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import {
  BRAND_NAME,
  DELIVERY_ESTIMATE,
  DELIVERY_ESTIMATE_NOTE,
  FREE_SHIPPING_MIN,
  SHIPPING_COST,
  formatPEN,
  normalizePeruMobile,
} from "@/config";
import { useStore } from "@/context/StoreContext";
import {
  FloatingInput,
  StepProgress,
  SubmitButton,
  type FloatingHandle,
  type SubmitState,
} from "@/components/kinetics/forms";
import { NumberCounter } from "@/components/kinetics/motion";
import { validateCheckoutField, type CheckoutField } from "@/lib/checkout-validation";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Finalizar compra — ${BRAND_NAME}` },
      { name: "description", content: "Completa el checkout de demostración de MUSE STUDIO." },
      { property: "og:title", content: `Finalizar compra — ${BRAND_NAME}` },
      {
        property: "og:description",
        content: "Completa el checkout de demostración de MUSE STUDIO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const STEP_FIELDS: CheckoutField[][] = [
  ["nombre", "telefono", "email"],
  ["departamento", "provincia", "distrito", "direccion"],
  [],
];
const LABELS: Record<CheckoutField, string> = {
  nombre: "Nombre completo",
  telefono: "Celular (+51)",
  email: "Correo electrónico",
  departamento: "Departamento",
  provincia: "Provincia",
  direccion: "Dirección",
  distrito: "Distrito",
  notas: "Notas (opcional)",
};
const DEMO_CARDS = [
  {
    id: "noir",
    name: "Muse Noir",
    number: "4242",
    background: "linear-gradient(135deg, var(--color-foreground), #343234 65%, #5a303d)",
  },
  {
    id: "vino",
    name: "Muse Vino",
    number: "1882",
    background: "linear-gradient(135deg, var(--color-accent), #702638 65%, #301e25)",
  },
  {
    id: "denim",
    name: "Muse Denim",
    number: "9016",
    background: "linear-gradient(135deg, var(--color-denim), #414957 68%, var(--color-foreground))",
  },
] as const;
type DemoCard = (typeof DEMO_CARDS)[number];
type Confirmation = {
  orderNumber: string;
  customerName: string;
  address: string;
  total: number;
  card: DemoCard;
};

function DemoCardVisual({
  card,
  selected,
  onSelect,
}: {
  card: DemoCard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`group block w-full cursor-pointer rounded-sm border p-2 text-left transition-all has-focus-visible:outline-2 has-focus-visible:outline-ring has-focus-visible:outline-offset-2 ${selected ? "border-accent bg-accent/5" : "border-border hover:border-foreground/50"}`}
    >
      <input
        type="radio"
        name="demo-card"
        value={card.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className="relative block aspect-[1.58] overflow-hidden rounded-sm p-4 text-background shadow-md sm:p-5"
        style={{ background: card.background }}
      >
        <span
          aria-hidden="true"
          className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-background/15"
        />
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-5 h-32 w-32 rounded-full border border-background/10"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-16 right-12 h-40 w-40 rotate-45 border border-background/10"
        />
        <span className="relative flex items-start justify-between">
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center bg-background font-display text-sm font-black text-foreground">
              M
            </span>
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em]">
              Muse Studio
            </span>
          </span>
          <span className="border border-background/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest">
            Demo
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative mt-5 block h-7 w-10 rounded-md border border-black/10 bg-linear-to-br from-[#e8dfcf] via-[#c8bfae] to-[#f3ead8] sm:mt-7"
        />
        <span className="relative mt-3 block font-mono text-sm tracking-[0.19em] sm:mt-4 sm:text-base">
          •••• &nbsp; •••• &nbsp; •••• &nbsp; {card.number}
        </span>
        <span className="relative mt-3 flex items-end justify-between gap-2">
          <span>
            <span className="block font-mono text-[8px] uppercase tracking-widest text-background/65">
              Tarjeta de demostración
            </span>
            <span className="mt-1 block font-display text-[11px] font-bold uppercase tracking-wider">
              {card.name}
            </span>
          </span>
          <span className="font-display text-sm font-black italic tracking-tight">MUSE</span>
        </span>
      </span>
      <span className="flex items-center justify-between px-1 py-2">
        <span className="text-xs font-medium">
          {card.name} ···· {card.number}
        </span>
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-accent bg-accent text-accent-foreground" : "border-border text-transparent group-hover:border-foreground/50"}`}
        >
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </span>
    </label>
  );
}

function Checkout() {
  const { lines, subtotal, clear } = useStore();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<CheckoutField, string>>({
    nombre: "",
    telefono: "",
    email: "",
    departamento: "",
    provincia: "",
    direccion: "",
    distrito: "",
    notas: "",
  });
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const [state, setState] = useState<SubmitState>("idle");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<DemoCard["id"]>(DEMO_CARDS[0].id);
  const refs = useRef<Partial<Record<CheckoutField, FloatingHandle | null>>>({});

  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const selectedCard = DEMO_CARDS.find((card) => card.id === selectedCardId) ?? DEMO_CARDS[0];

  const next = () => {
    const errs: Partial<Record<CheckoutField, string>> = {};
    (STEP_FIELDS[step - 1] ?? []).forEach((f) => {
      const e = validateCheckoutField(f, data[f]);
      if (e) errs[f] = e;
    });
    setErrors(errs);
    const bad = Object.keys(errs) as CheckoutField[];
    if (bad.length) {
      bad.forEach((f) => refs.current[f]?.shake());
      return;
    }
    setStep((s) => s + 1);
  };

  const pay = () => {
    setState("loading");
    window.setTimeout(() => {
      setConfirmation({
        orderNumber: `MUSE-${Date.now().toString().slice(-6)}`,
        customerName: data.nombre,
        address: `${data.direccion}, ${data.distrito}, ${data.provincia}, ${data.departamento}, Perú`,
        total,
        card: selectedCard,
      });
      setState("done");
      clear();
    }, 900);
  };

  if (confirmation)
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <div className="border border-border p-6 text-center md:p-12">
          <CheckCircle2 aria-hidden="true" className="mx-auto h-16 w-16 text-accent" />
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Pago de demostración completado
          </p>
          <h1 className="mt-3 font-display-tight text-5xl md:text-7xl">
            Pedido de demo confirmado
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Gracias, {confirmation.customerName}. La entrega estimada de ejemplo es de{" "}
            <strong className="text-foreground">{DELIVERY_ESTIMATE}</strong>.
          </p>
          <div className="mx-auto mt-8 max-w-lg space-y-3 border-y border-border py-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Pedido</span>
              <span className="font-mono">{confirmation.orderNumber}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total simulado</span>
              <span className="font-mono font-bold">{formatPEN(confirmation.total)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tarjeta de prueba</span>
              <span className="font-mono">
                {confirmation.card.name} ···· {confirmation.card.number}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Dirección de entrega</span>
              <p className="mt-1">{confirmation.address}</p>
            </div>
          </div>
          <p role="note" className="mx-auto mt-5 max-w-lg text-xs text-muted-foreground">
            No se realizó ningún cobro ni se enviaron o almacenaron tus datos.{" "}
            {DELIVERY_ESTIMATE_NOTE}
          </p>
          <Link
            to="/tienda"
            className="k-squish mt-8 inline-flex h-14 items-center bg-foreground px-8 font-mono text-xs uppercase text-background"
          >
            Seguir comprando
          </Link>
        </div>
      </section>
    );

  if (!lines.length && state === "idle")
    return (
      <div className="py-32 text-center">
        <p className="font-display-tight text-4xl">Tu carrito está vacío</p>
        <Link to="/tienda" className="k-underline mt-6 inline-block font-mono text-xs uppercase">
          Ir a la tienda
        </Link>
      </div>
    );

  const input = (f: CheckoutField, type = "text") => (
    <FloatingInput
      key={f}
      ref={(r) => {
        refs.current[f] = r;
      }}
      name={f}
      type={type}
      label={LABELS[f]}
      value={data[f]}
      error={errors[f]}
      onChange={(e) => {
        setData({ ...data, [f]: e.target.value });
        if (errors[f]) setErrors({ ...errors, [f]: undefined });
      }}
    />
  );

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="font-display-tight text-5xl md:text-7xl">Checkout</h1>
      <p role="note" className="mt-4 border border-border p-4 text-sm text-muted-foreground">
        Prototipo de portafolio: usa únicamente datos inventados. No introduzcas información
        personal real. Este formulario no envía ni guarda tus datos.
      </p>
      <div className="my-10">
        <StepProgress steps={["Datos", "Envío", "Pago"]} current={step} />
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {step === 1 && (
            <>
              {input("nombre")}
              {input("telefono", "tel")}
              {input("email", "email")}
            </>
          )}
          {step === 2 && (
            <>
              {input("departamento")}
              {input("provincia")}
              {input("distrito")}
              {input("direccion")}
              {input("notas")}
            </>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <fieldset>
                <legend className="mb-3 font-mono text-xs uppercase tracking-widest">
                  Elige una tarjeta de demostración
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DEMO_CARDS.map((card) => (
                    <DemoCardVisual
                      key={card.id}
                      card={card}
                      selected={selectedCard.id === card.id}
                      onSelect={() => setSelectedCardId(card.id)}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="space-y-2 border border-border p-5 text-sm">
                <p className="font-mono text-xs uppercase text-muted-foreground">Enviar a</p>
                <p className="font-bold">{data.nombre}</p>
                <p>
                  {data.direccion}, {data.distrito}, {data.provincia}, {data.departamento}, Perú
                </p>
                <p className="font-mono text-xs">
                  {normalizePeruMobile(data.telefono)} · {data.email}
                </p>
                <p className="pt-2 text-muted-foreground">Entrega estimada: {DELIVERY_ESTIMATE}</p>
                <p className="text-xs text-muted-foreground">{DELIVERY_ESTIMATE_NOTE}</p>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            {step > 1 && state === "idle" && (
              <button
                onClick={() => setStep(step - 1)}
                className="k-squish h-14 border border-foreground px-6 font-mono text-xs uppercase"
              >
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={next}
                className="k-squish h-14 flex-1 bg-foreground font-display font-bold uppercase text-background"
              >
                Continuar
              </button>
            ) : (
              <SubmitButton
                state={state}
                label="Pagar"
                onClick={pay}
                className="flex-1 bg-accent text-accent-foreground"
              />
            )}
          </div>
        </div>

        <aside className="h-fit border border-border p-5">
          <p className="mb-4 font-display font-bold uppercase">Tu pedido</p>
          <ul className="space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span>
                  {l.product.name}{" "}
                  <span className="font-mono text-xs text-muted-foreground">
                    · {l.size} ×{l.qty}
                  </span>
                </span>
                <span className="font-mono text-xs">{formatPEN(l.product.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-4 font-mono text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPEN(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío estimado</span>
              <span>{shipping ? formatPEN(shipping) : "Gratis"}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <NumberCounter value={total} format={formatPEN} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
