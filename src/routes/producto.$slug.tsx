import { useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BRAND_NAME,
  DELIVERY_ESTIMATE,
  DELIVERY_ESTIMATE_NOTE,
  FREE_SHIPPING_MIN,
  formatPEN,
} from "@/config";
import { getProduct, products, SIZE_CHART } from "@/data/products";
import { SizeAdvisor } from "@/components/SizeAdvisor";
import {
  Accordion,
  confettiBurst,
  LikeButton,
  QuantityStepper,
  SwatchPicker,
  TogglePills,
} from "@/components/kinetics/controls";
import { ProductImage } from "@/components/ProductCard";
import { ProductGrid } from "@/components/ProductGrid";
import { useStore } from "@/context/StoreContext";

export const Route = createFileRoute("/producto/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: `Producto no encontrado — ${BRAND_NAME}` },
          { name: "robots", content: "noindex" },
        ],
      };
    const p = loaderData.product;
    const desc = p.description.replace("\n", " ");
    return {
      meta: [
        { title: `${p.name} — ${BRAND_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: `${p.name} — ${BRAND_NAME}` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p.image.startsWith("https://")
          ? [
              { property: "og:image", content: p.image },
              { name: "twitter:image", content: p.image },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <div className="py-32 text-center">
      <p className="font-display-tight text-4xl">Producto no encontrado</p>
      <Link to="/tienda" className="k-underline mt-6 inline-block font-mono text-xs uppercase">
        Volver a la tienda
      </Link>
    </div>
  );
}

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { add, favorites, toggleFav } = useStore();
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(p.colors?.[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const firstAdd = useRef(true);
  const related = [
    ...products.filter((x) => x.id !== p.id && x.category !== p.category),
    ...products.filter((x) => x.id !== p.id),
  ]
    .filter((x, i, a) => a.indexOf(x) === i)
    .slice((p.id * 3) % 8, ((p.id * 3) % 8) + 3);

  return (
    <div key={p.slug} className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Link to="/tienda" className="k-underline font-mono text-xs uppercase">
        ← Tienda
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductImage product={p} className="w-full" />
        <div className="min-w-0 md:sticky md:top-24 md:self-start">
          <p className="font-mono text-xs uppercase text-muted-foreground">
            {p.category}
            {p.isNew ? " · Nuevo" : ""}
          </p>
          <h1 className="font-display-tight mt-3 break-words text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-4 font-mono text-xl">{formatPEN(p.price)}</p>

          <div className="mt-8">
            <p className="mb-3 font-mono text-xs uppercase">Talla · {size}</p>
            <TogglePills name="size" options={p.sizes} value={size} onChange={setSize} />
            <SizeAdvisor product={p} onPick={setSize} />
          </div>

          {p.colors && p.colors.length > 1 && (
            <div className="mt-6">
              <p className="mb-3 font-mono text-xs uppercase">Color · {color}</p>
              <SwatchPicker name="color" options={p.colors} value={color} onChange={setColor} />
            </div>
          )}

          <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)_2.75rem] items-center gap-2 sm:gap-3">
            <QuantityStepper value={qty} onChange={setQty} />
            <button
              onClick={(e) => {
                add(p, size, qty, color || undefined);
                if (firstAdd.current) {
                  confettiBurst(e.currentTarget);
                  firstAdd.current = false;
                }
              }}
              className="k-squish h-11 min-w-0 whitespace-nowrap bg-accent px-2 font-display text-xs font-bold uppercase tracking-tight text-accent-foreground sm:px-4 sm:text-sm"
            >
              Agregar al carrito
            </button>
            <LikeButton
              liked={favorites.includes(p.id)}
              label={favorites.includes(p.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
              onToggle={() => toggleFav(p.id)}
              className="grid h-11 w-11 place-items-center border border-foreground"
            />
          </div>

          <div className="mt-10 border-t border-border">
            <Accordion title="Descripción" defaultOpen>
              {p.description.split("\n").map((l) => (
                <p key={l}>{l}</p>
              ))}
            </Accordion>
            <Accordion title="Guía de tallas">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="text-left">
                    <th className="py-1">Talla</th>
                    <th>Busto</th>
                    <th>Cintura</th>
                    <th>Cadera</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((r) => (
                    <tr key={r[0]} className="border-t border-border">
                      {r.map((c, i) => (
                        <td key={i} className="py-1">
                          {c}
                          {i ? " cm" : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion>
            <Accordion title="Envíos y cambios">
              Información de demostración: plazo estimado de {DELIVERY_ESTIMATE}; envío gratis desde{" "}
              {formatPEN(FREE_SHIPPING_MIN)}. {DELIVERY_ESTIMATE_NOTE} La política de cambios
              también es solo un ejemplo.
            </Accordion>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-display-tight mb-8 text-3xl md:text-5xl">Completa el look</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
