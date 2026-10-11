import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { Skeleton, Stagger } from "./kinetics/motion";

const grid =
  "grid auto-rows-fr grid-cols-2 items-stretch gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4";

export function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading)
    return (
      <div className={grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4]" />
            <Skeleton className="mt-3 h-3 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  if (!products.length)
    return (
      <p className="py-20 text-center font-mono text-sm text-muted-foreground">
        No encontramos productos.
      </p>
    );
  return (
    <Stagger key={products.map((p) => p.id).join("-")} className={grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </Stagger>
  );
}
