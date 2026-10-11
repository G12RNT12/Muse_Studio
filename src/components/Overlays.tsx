import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";

export function Toast() {
  const { toast } = useStore();
  const [last, setLast] = useState("");
  useEffect(() => {
    if (toast) setLast(toast.msg);
  }, [toast]);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      <div
        key={toast?.id}
        className={`k-toast bg-foreground px-5 py-3 font-mono text-xs uppercase text-background ${toast ? "show" : ""}`}
      >
        {toast?.msg ?? last}
      </div>
    </div>
  );
}

export function UndoSnackbar() {
  const { removed, undo, dismissRemoved } = useStore();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!removed) {
      setShow(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(raf);
  }, [removed]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <div
        className={`k-snack pointer-events-auto w-full max-w-sm overflow-hidden bg-foreground text-background ${show ? "show" : ""}`}
      >
        <div className="flex items-center justify-between px-4 py-3 font-mono text-xs">
          <span>Producto eliminado</span>
          <button onClick={undo} className="k-underline font-bold uppercase text-background">
            Deshacer
          </button>
        </div>
        {removed && (
          <div
            key={removed.id}
            className="k-snack-bar h-0.5 bg-accent"
            onAnimationEnd={dismissRemoved}
          />
        )}
      </div>
    </div>
  );
}
