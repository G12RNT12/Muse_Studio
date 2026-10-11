import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/data/products";

export type CartLine = {
  key: string;
  productId: number;
  size: string;
  color?: string | undefined;
  qty: number;
};

type State = { lines: CartLine[]; favorites: number[]; hydrated: boolean };
type Action =
  | { type: "hydrate"; lines: CartLine[]; favorites: number[] }
  | { type: "add"; line: CartLine }
  | { type: "qty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "restore"; line: CartLine; index: number }
  | { type: "clear" }
  | { type: "fav"; id: number };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return { lines: a.lines, favorites: a.favorites, hydrated: true };
    case "add": {
      const ex = s.lines.find((l) => l.key === a.line.key);
      return {
        ...s,
        lines: ex
          ? s.lines.map((l) => (l.key === a.line.key ? { ...l, qty: l.qty + a.line.qty } : l))
          : [...s.lines, a.line],
      };
    }
    case "qty":
      return {
        ...s,
        lines: s.lines.map((l) => (l.key === a.key ? { ...l, qty: Math.max(1, a.qty) } : l)),
      };
    case "remove":
      return { ...s, lines: s.lines.filter((l) => l.key !== a.key) };
    case "restore": {
      const lines = [...s.lines];
      lines.splice(a.index, 0, a.line);
      return { ...s, lines };
    }
    case "clear":
      return { ...s, lines: [] };
    case "fav":
      return {
        ...s,
        favorites: s.favorites.includes(a.id)
          ? s.favorites.filter((x) => x !== a.id)
          : [...s.favorites, a.id],
      };
  }
}

const KEY_CART = "muse-cart";
const KEY_FAV = "muse-fav";
function read<T>(k: string, fb: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

type Removed = { line: CartLine; index: number; id: number } | null;

type Ctx = {
  lines: (CartLine & { product: Product })[];
  count: number;
  subtotal: number;
  favorites: number[];
  add: (p: Product, size: string, qty?: number, color?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  undo: () => void;
  removed: Removed;
  dismissRemoved: () => void;
  clear: () => void;
  toggleFav: (id: number) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  toast: { id: number; msg: string } | null;
  badgeTick: number;
};

// Cached on globalThis so hot reloads reuse the same context instance.
const g = globalThis as { __museStoreCtx?: React.Context<Ctx | null> };
const StoreCtx = (g.__museStoreCtx ??= createContext<Ctx | null>(null));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, { lines: [], favorites: [], hydrated: false });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<Ctx["toast"]>(null);
  const [badgeTick, setBadgeTick] = useState(0);
  const [removed, setRemoved] = useState<Removed>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    dispatch({ type: "hydrate", lines: read(KEY_CART, []), favorites: read(KEY_FAV, []) });
  }, []);
  useEffect(() => {
    if (s.hydrated) {
      write(KEY_CART, s.lines);
      write(KEY_FAV, s.favorites);
    }
  }, [s]);

  const add: Ctx["add"] = useCallback((p, size, qty = 1, color) => {
    dispatch({
      type: "add",
      line: { key: `${p.id}-${size}-${color ?? ""}`, productId: p.id, size, color, qty },
    });
    setBadgeTick((t) => t + 1);
    setToast({ id: Date.now(), msg: "Agregado al carrito ✓" });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const remove = (key: string) => {
    const index = s.lines.findIndex((l) => l.key === key);
    if (index < 0) return;
    setRemoved({ line: s.lines[index]!, index, id: Date.now() });
    dispatch({ type: "remove", key });
  };
  const undo = () => {
    if (removed) dispatch({ type: "restore", line: removed.line, index: removed.index });
    setRemoved(null);
  };

  const lines = s.lines
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.productId)! }))
    .filter((l) => l.product);

  const value: Ctx = {
    lines,
    count: lines.reduce((a, l) => a + l.qty, 0),
    subtotal: lines.reduce((a, l) => a + l.qty * l.product.price, 0),
    favorites: s.favorites,
    add,
    setQty: (key, qty) => dispatch({ type: "qty", key, qty }),
    remove,
    undo,
    removed,
    dismissRemoved: () => setRemoved(null),
    clear: () => dispatch({ type: "clear" }),
    toggleFav: (id) => dispatch({ type: "fav", id }),
    drawerOpen,
    setDrawerOpen,
    toast,
    badgeTick,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}
