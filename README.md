# MUSE STUDIO

Tienda de moda conceptual creada como proyecto de portafolio. Incluye un catálogo responsive y un recorrido de compra interactivo construido con React, TanStack Start y Tailwind CSS.

> **Prototipo únicamente:** productos, precios, políticas y plazos son ilustrativos. No hay pasarela de pago ni se procesan pedidos reales. No ingreses datos personales; el checkout no los envía ni los guarda.

## Funcionalidades

- Catálogo con búsqueda, categorías, filtros, orden y favoritos.
- Páginas de producto con tallas, colores, guía de medidas y recomendaciones.
- Carrito persistido localmente en el navegador.
- Checkout de demostración con validación, selección de tarjetas visuales ficticias y pantalla de confirmación. El botón no realiza cargos.
- Importes y conversión de referencia centralizados en `src/config.ts`.
- Diseño adaptable, español (Perú), estados de carga y animaciones respetuosas con `prefers-reduced-motion`.

## Requisitos

- Node.js 22 o superior.
- Bun, o `npx` para ejecutarlo sin instalarlo globalmente.

## Desarrollo local

```sh
npx --yes bun install --frozen-lockfile
bun run dev
```

Vite mostrará la dirección local en la terminal.

## Despliegue en Netlify

El proyecto incluye la integración oficial de Netlify para TanStack Start. Conecta el repositorio en Netlify; el archivo `netlify.toml` define el comando de compilación y el directorio de publicación. La integración empaqueta el servidor de TanStack Start para Netlify.

Si configuras `LOVABLE_API_KEY` para el asesor de tallas, hazlo como variable de entorno privada en Netlify. No uses el prefijo `VITE_` ni publiques esa clave en el repositorio.

## Comprobaciones

```sh
bun run test
bunx tsc --noEmit
bun run lint
```

## Tecnologías

- React y TypeScript
- TanStack Start y TanStack Router
- Tailwind CSS
- Vitest y Testing Library

## Alcance y privacidad

El checkout es una simulación frontend: no integra un procesador de pagos, API de pedidos, correo, analítica ni servicio de contacto. Los datos escritos en el checkout permanecen en memoria durante esa vista y no se guardan ni transmiten. Solo el carrito y los favoritos se conservan en `localStorage`. Los enlaces comerciales externos están deshabilitados para no atribuir la marca a perfiles de terceros.
