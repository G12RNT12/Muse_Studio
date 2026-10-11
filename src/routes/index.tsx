import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_NAME, FREE_SHIPPING_MIN, formatPEN } from "@/config";
import { products } from "@/data/products";
import { Magnetic, Marquee, SplitText } from "@/components/kinetics/motion";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductImage } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND_NAME} — Básicos con actitud` },
      {
        name: "description",
        content: `Streetwear Y2K y coreano para mujer en Perú. Jeans baggy, jerseys varsity, suéteres y faldas. Envío gratis desde ${formatPEN(FREE_SHIPPING_MIN)}.`,
      },
      { property: "og:title", content: `${BRAND_NAME} — Básicos con actitud` },
      {
        property: "og:description",
        content: `Streetwear Y2K y coreano para mujer en Perú. Envío gratis desde ${formatPEN(FREE_SHIPPING_MIN)}.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(products[4]?.image.startsWith("https://")
        ? [
            { property: "og:image", content: products[4].image },
            { name: "twitter:image", content: products[4].image },
          ]
        : []),
    ],
  }),
  component: Home,
});

function Home() {
  const fresh = products.filter((p) => p.isNew);
  const looks = products.filter((p) => p.shopTheLook);
  const heroImgs = [products[4], products[1], products[7]].filter(
    (p): p is (typeof products)[number] => !!p,
  );
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-8 md:pt-16">
        <p className="font-mono text-xs uppercase text-muted-foreground">Colección 2026 · Perú</p>
        <h1 className="font-display-tight mt-4 text-[17vw] md:text-[11rem]">
          {BRAND_NAME.split(" ").map((w, i) => (
            <SplitText key={w} text={w} delay={i * 240} className="block" />
          ))}
        </h1>
        <div className="mt-8 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-sm text-lg">
            Básicos con actitud. Baggy, varsity y tejidos suaves para tu día a día.
          </p>
          <Magnetic>
            <Link
              to="/tienda"
              className="k-squish inline-block bg-accent px-8 py-4 font-display font-bold uppercase tracking-tight text-accent-foreground"
            >
              Ver colección →
            </Link>
          </Magnetic>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3 md:gap-5">
          {heroImgs.map((p, i) => (
            <Link
              key={p.id}
              to="/producto/$slug"
              params={{ slug: p.slug }}
              className={i === 1 ? "md:-mt-12" : "md:mt-8"}
            >
              <ProductImage product={p} />
            </Link>
          ))}
        </div>
      </section>

      <Marquee
        className="border-y border-foreground bg-foreground py-4 font-display text-lg font-black uppercase tracking-tight text-background md:text-2xl"
        items={[
          `Envío gratis desde ${formatPEN(FREE_SHIPPING_MIN)}`,
          "Nueva colección",
          "Baggy fit",
          "Hecho para ti",
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display-tight text-4xl md:text-6xl">Lo más nuevo</h2>
          <Link
            to="/tienda"
            search={{ nuevo: true }}
            className="k-underline font-mono text-xs uppercase"
          >
            Ver todo
          </Link>
        </div>
        <ProductGrid products={fresh} />
      </section>

      <section id="looks" className="mx-auto max-w-7xl scroll-mt-24 px-4 md:px-8">
        <h2 className="font-display-tight mb-8 text-4xl md:text-6xl">Shop the look</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {looks.map((p, i) => (
            <Link
              key={p.id}
              to="/producto/$slug"
              params={{ slug: p.slug }}
              className="group k-lift block border border-border"
            >
              <div className="k-shine">
                <ProductImage product={p} />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono text-[11px] uppercase text-muted-foreground">
                    Look 0{i + 1}
                  </p>
                  <p className="font-display text-lg font-bold uppercase tracking-tight">
                    {p.name}
                  </p>
                </div>
                <span className="font-mono text-sm">{formatPEN(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
