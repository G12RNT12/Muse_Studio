import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { formatPEN } from "@/config";
import type { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { LikeButton } from "./kinetics/controls";

export function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div className={`relative aspect-3/4 overflow-hidden bg-frame ${className}`}>
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center p-4 text-center font-mono text-xs text-muted-foreground">
          {product.name}
        </div>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add, favorites, toggleFav } = useStore();
  const liked = favorites.includes(product.id);
  const [picking, setPicking] = useState(false);
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <article className="group k-lift h-full bg-background" onMouseLeave={() => setPicking(false)}>
      <Link to="/producto/$slug" params={{ slug: product.slug }} className="flex h-full flex-col">
        <div className="k-shine relative">
          <ProductImage product={product} />
          {product.isNew && (
            <span className="absolute left-2 top-2 z-3 bg-accent px-2 py-0.5 font-mono text-[10px] uppercase text-accent-foreground">
              Nuevo
            </span>
          )}
          <LikeButton
            liked={liked}
            label={liked ? "Quitar de favoritos" : "Agregar a favoritos"}
            onToggle={() => toggleFav(product.id)}
            className="absolute right-2 top-2 z-4 h-10 w-10 justify-center rounded-full bg-background/90 shadow-sm backdrop-blur"
          />
          {picking ? (
            <div onClick={stop} className="absolute inset-x-2 bottom-2 z-3 bg-background/95 p-2">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase">
                <span>Elige tu talla</span>
                <button
                  aria-label="Cerrar"
                  onClick={(e) => {
                    stop(e);
                    setPicking(false);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => {
                      stop(e);
                      add(product, s, 1, product.colors?.[0]?.name);
                      setPicking(false);
                    }}
                    className="k-squish border border-foreground py-1.5 font-mono text-[11px] hover:bg-accent hover:text-accent-foreground hover:border-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                stop(e);
                setPicking(true);
              }}
              className="k-squish absolute bottom-2 right-2 z-3 bg-foreground px-3 py-2 font-mono text-[11px] uppercase text-background transition-opacity md:opacity-0 md:group-hover:opacity-100"
            >
              + Agregar
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 min-h-10 font-sans text-sm leading-snug">{product.name}</h3>
          <span className="mt-2 font-mono text-xs">{formatPEN(product.price)}</span>
        </div>
      </Link>
    </article>
  );
}
