import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { FREE_SHIPPING_MIN, formatPEN } from "@/config";
import { useStore } from "@/context/StoreContext";
import { QuantityStepper } from "./kinetics/controls";
import { NumberCounter } from "./kinetics/motion";
import { ProductImage } from "./ProductCard";

export function CartDrawer() {
  const { drawerOpen: open, setDrawerOpen, lines, subtotal, setQty, remove } = useStore();
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; dx: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawerOpen]);

  const resetStyle = () => {
    if (panel.current) {
      panel.current.style.transform = "";
      panel.current.style.opacity = "";
      panel.current.style.transition = "";
    }
  };

  const progress = Math.min(1, subtotal / FREE_SHIPPING_MIN);
  const missing = FREE_SHIPPING_MIN - subtotal;

  return (
    <>
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground/30 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        ref={panel}
        role="dialog"
        aria-label="Carrito"
        aria-hidden={!open}
        className={`k-drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background ${open ? "translate-x-0" : "translate-x-full"}`}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch" || (e.target as HTMLElement).closest("button,a")) return;
          drag.current = { x: e.clientX, dx: 0 };
          panel.current!.style.transition = "none";
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = Math.max(0, e.clientX - drag.current.x);
          drag.current.dx = dx;
          panel.current!.style.transform = `translateX(${dx}px)`;
          panel.current!.style.opacity = String(1 - Math.min(dx / 400, 0.6));
        }}
        onPointerUp={() => {
          if (!drag.current) return;
          const dx = drag.current.dx;
          drag.current = null;
          panel.current!.style.transition = "transform .5s var(--spring), opacity .3s";
          if (dx > 100) {
            setDrawerOpen(false);
            setTimeout(resetStyle, 20);
          } else {
            panel.current!.style.transform = "translateX(0)";
            panel.current!.style.opacity = "1";
            setTimeout(resetStyle, 500);
          }
        }}
        style={{ touchAction: "pan-y" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display-tight text-2xl">Carrito</h2>
          <button
            aria-label="Cerrar"
            onClick={() => setDrawerOpen(false)}
            className="grid h-10 w-10 place-items-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-4">
          <p className="font-mono text-xs">
            {missing > 0 ? (
              <>
                Te faltan {formatPEN(missing)} para el <b>envío gratis</b>
              </>
            ) : (
              <>
                ¡Tienes <b>envío gratis</b>!
              </>
            )}
          </p>
          <div className="mt-2 h-1 bg-muted">
            <div className="k-steps-fill h-full" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>

        <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
          {lines.length === 0 && (
            <li className="py-16 text-center font-mono text-sm text-muted-foreground">
              Tu carrito está vacío.
            </li>
          )}
          {lines.map((l) => (
            <li key={l.key} className="flex gap-4 py-4">
              <ProductImage product={l.product} className="w-20 shrink-0" />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <p className="text-sm leading-snug">{l.product.name}</p>
                  <span className="font-mono text-xs">{formatPEN(l.product.price * l.qty)}</span>
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase text-muted-foreground">
                  Talla {l.size}
                  {l.color ? ` · ${l.color}` : ""}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QuantityStepper size="sm" value={l.qty} onChange={(v) => setQty(l.key, v)} />
                  <button
                    onClick={() => remove(l.key)}
                    className="k-underline font-mono text-[11px] uppercase"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-border p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase">Subtotal</span>
            <span className="font-display text-xl font-bold">
              <NumberCounter value={subtotal} format={formatPEN} />
            </span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setDrawerOpen(false)}
            disabled={!lines.length}
            className={`k-squish block bg-accent py-4 text-center font-display font-bold uppercase text-accent-foreground ${!lines.length ? "pointer-events-none opacity-40" : ""}`}
          >
            Finalizar compra
          </Link>
        </div>
      </aside>
    </>
  );
}
