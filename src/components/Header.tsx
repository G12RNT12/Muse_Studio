import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { BRAND_NAME } from "@/config";
import { useStore } from "@/context/StoreContext";
import { retrigger } from "@/components/kinetics/motion";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  const { count, favorites, setDrawerOpen, badgeTick } = useStore();
  const badge = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (badgeTick) retrigger(badge.current, "pop", 320);
  }, [badgeTick]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        <Link to="/" aria-label={`${BRAND_NAME}, inicio`} className="shrink-0">
          <BrandLogo />
        </Link>
        <nav className="ml-6 hidden gap-6 font-mono text-xs uppercase md:flex">
          <Link
            to="/tienda"
            className="k-underline"
            activeOptions={{ includeSearch: false }}
            activeProps={{ className: "active" }}
          >
            Tienda
          </Link>
          <Link to="/tienda" search={{ nuevo: true }} className="k-underline">
            Nuevo
          </Link>
          <Link to="/" hash="looks" className="k-underline">
            Looks
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <form
            role="search"
            className="k-search flex h-11 items-center rounded-full border border-border"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/tienda", search: { q: q || undefined } });
            }}
          >
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar productos"
              placeholder="Buscar…"
              className="h-full w-full bg-transparent pl-10 pr-3 text-sm outline-none"
            />
          </form>
          <Link
            to="/tienda"
            search={{ fav: true }}
            aria-label="Favoritos"
            className="relative grid h-11 w-11 place-items-center"
          >
            <Heart className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 font-mono text-[10px] text-background">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            aria-label="Abrir carrito"
            onClick={() => setDrawerOpen(true)}
            className="relative grid h-11 w-11 place-items-center"
          >
            <ShoppingBag className="h-5 w-5" />
            <span
              ref={badge}
              className="k-badge absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 font-mono text-[10px] text-accent-foreground"
              style={{ opacity: count ? 1 : 0 }}
            >
              {count}
            </span>
          </button>
        </div>
      </div>
      <nav className="flex justify-center gap-6 border-t border-border py-2 font-mono text-[11px] uppercase md:hidden">
        <Link to="/tienda" className="k-underline">
          Tienda
        </Link>
        <Link to="/tienda" search={{ nuevo: true }} className="k-underline">
          Nuevo
        </Link>
        <Link to="/" hash="looks" className="k-underline">
          Looks
        </Link>
      </nav>
    </header>
  );
}
