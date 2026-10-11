import { BRAND_NAME, WHATSAPP_NUMBER, HAS_WHATSAPP_NUMBER } from "@/config";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-8">
        <div>
          <BrandLogo />
          <p className="mt-3 text-sm text-muted-foreground">
            Básicos con actitud. Perú · Precios en soles.
          </p>
        </div>
        <ul className="space-y-2 font-mono text-xs uppercase">
          <li>Redes sociales: demo</li>
          <li>Sin perfiles comerciales reales</li>
        </ul>
        <ul className="space-y-2 font-mono text-xs uppercase">
          <li>
            <span>Política de cambios: ejemplo</span>
          </li>
          <li>
            {HAS_WHATSAPP_NUMBER ? (
              <a
                className="k-underline"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
              >
                Contacto
              </a>
            ) : (
              <span>Contacto no habilitado en esta demo</span>
            )}
          </li>
        </ul>
      </div>
      <p className="border-t border-border py-5 text-center font-mono text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} {BRAND_NAME}
      </p>
    </footer>
  );
}
