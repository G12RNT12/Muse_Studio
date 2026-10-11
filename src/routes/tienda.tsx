import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_NAME } from "@/config";
import { CATEGORIES, products } from "@/data/products";
import { ChoiceChips, TabPill } from "@/components/kinetics/controls";
import { ProductGrid } from "@/components/ProductGrid";
import { useStore } from "@/context/StoreContext";

type Search = { q?: string | undefined; nuevo?: boolean | undefined; fav?: boolean | undefined };
type Sort = "nuevo" | "asc" | "desc";

export const Route = createFileRoute("/tienda")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    nuevo: s["nuevo"] === true || s["nuevo"] === "true" ? true : undefined,
    fav: s["fav"] === true || s["fav"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Tienda — ${BRAND_NAME}` },
      {
        name: "description",
        content:
          "Toda la colección: jeans, tops, suéteres, faldas y hoodies streetwear para mujer en Perú. Precios en soles.",
      },
      { property: "og:title", content: `Tienda — ${BRAND_NAME}` },
      {
        property: "og:description",
        content:
          "Jeans, tops, suéteres, faldas y hoodies streetwear para mujer en Perú. Precios en soles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

let firstLoadDone = false;

function Shop() {
  const { q, nuevo, fav } = Route.useSearch();
  const { favorites } = useStore();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Todo");
  const [sort, setSort] = useState<Sort>("nuevo");
  const [loading, setLoading] = useState(!firstLoadDone);

  useEffect(() => {
    if (firstLoadDone) return;
    const t = setTimeout(() => {
      firstLoadDone = true;
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    let l = products.filter((p) => cat === "Todo" || p.category === cat);
    if (nuevo) l = l.filter((p) => p.isNew);
    if (fav) l = l.filter((p) => favorites.includes(p.id));
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    if (sort === "asc") l = [...l].sort((a, b) => a.price - b.price);
    else if (sort === "desc") l = [...l].sort((a, b) => b.price - a.price);
    else l = [...l].sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.id - b.id);
    return l;
  }, [cat, sort, q, nuevo, fav, favorites]);

  const title = fav ? "Favoritos" : nuevo ? "Lo nuevo" : "Tienda";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="font-display-tight text-5xl md:text-8xl">{title}</h1>
      {(q || nuevo || fav) && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {q && <>Resultados para “{q}” · </>}
          {list.length} productos ·{" "}
          <Link to="/tienda" className="k-underline">
            Quitar filtros
          </Link>
        </p>
      )}
      <div className="my-8 flex flex-col gap-4 border-y border-border py-4 md:flex-row md:items-center md:justify-between">
        <ChoiceChips options={CATEGORIES} value={cat} onChange={setCat} />
        <TabPill<Sort>
          value={sort}
          onChange={setSort}
          options={[
            { value: "nuevo", label: "Nuevo" },
            { value: "asc", label: "Precio ↑" },
            { value: "desc", label: "Precio ↓" },
          ]}
        />
      </div>
      <ProductGrid products={list} loading={loading} />
    </section>
  );
}
