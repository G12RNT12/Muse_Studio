import { convertCOPToPEN } from "@/config";

const assets = import.meta.glob<string>("../assets/products/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const img = (file: string) => assets[`../assets/products/${file}`] ?? "";

export type Category = "Jeans" | "Tops" | "Sweaters" | "Faldas" | "Hoodies";
export const CATEGORIES: ("Todo" | Category)[] = [
  "Todo",
  "Jeans",
  "Tops",
  "Sweaters",
  "Faldas",
  "Hoodies",
];
export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export type ProductColor = { name: string; hex: string };
export type Product = {
  id: number;
  slug: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  sizes: string[];
  description: string;
  isNew: boolean;
  shopTheLook?: boolean;
  colors?: ProductColor[] | undefined;
};

type Raw = [string, string, Category, number, string, string, ProductColor[]?];

const raw: Raw[] = [
  [
    "blusa-campesina-blanca-jean-wide-leg",
    "Blusa Campesina Blanca + Jean Wide Leg",
    "Tops",
    119000,
    "01-blusa-blanca-jean-wide.jpg",
    "Blusa de algodón con escote campesino y jean wide leg de tiro alto.\nUn básico fresco para el día a día.",
  ],
  [
    "jersey-varsity-01-vino",
    'Jersey Varsity "01" Vino',
    "Tops",
    79000,
    "02-jersey-01-vino.jpg",
    "Jersey estilo varsity con número 01 bordado.\nCorte oversize para llevar con baggy.",
  ],
  [
    "jersey-weekend-muse",
    'Jersey "Weekend Muse"',
    "Tops",
    85000,
    "03-jersey-weekend-muse.jpg",
    "Jersey de malla deportiva con estampado Weekend Muse.\nEl centro de cualquier look de fin de semana.",
  ],
  [
    "top-negro-cut-out-botones",
    "Top Negro Cut-Out Botones",
    "Tops",
    69000,
    "04-top-negro-cutout.jpg",
    "Top ajustado con abertura y botones frontales.\nSensual, minimal y fácil de combinar.",
  ],
  [
    "jean-baggy-estrellas-gris",
    "Jean Baggy Estrellas Gris",
    "Jeans",
    139000,
    "05-jean-estrellas-capas.jpg",
    "Jean baggy en lavado gris con parches de estrellas.\nFit amplio y bota ancha.",
  ],
  [
    "polo-cafe-ajustado-jean-negro",
    "Polo Café Ajustado + Jean Negro",
    "Tops",
    75000,
    "06-polo-cafe-jean-negro.jpg",
    "Polo de punto ajustado en tono café.\nCombínalo con jean negro para un look limpio.",
  ],
  [
    "falda-cargo-volantes-gris",
    "Falda Cargo Volantes Gris",
    "Faldas",
    95000,
    "07-camiseta-mariposa-falda-cargo.jpg",
    "Falda cargo con bolsillos y volantes en capas.\nY2K puro con toque utilitario.",
  ],
  [
    "hoodie-cafe-oversize",
    "Hoodie Café Oversize",
    "Hoodies",
    129000,
    "08-hoodie-cafe-jean-baggy.jpg",
    "Hoodie de felpa pesada con capucha amplia.\nCálido, suave y totalmente oversize.",
    [
      { name: "Café", hex: "#6B4A35" },
      { name: "Negro", hex: "#161616" },
    ],
  ],
  [
    "sueter-hombros-caidos-vino",
    "Suéter Hombros Caídos Vino",
    "Sweaters",
    109000,
    "09-sueter-hombros-vino.jpg",
    "Suéter tejido con hombros caídos en tono vino.\nSoft grunge para días fríos.",
  ],
  [
    "hoodie-negro-zip-jean-negro-wide",
    "Hoodie Negro Zip + Jean Negro Wide",
    "Hoodies",
    135000,
    "10-hoodie-negro-jean-negro.jpg",
    "Hoodie con cremallera y jean negro wide leg.\nTotal black sin esfuerzo.",
  ],
  [
    "vestido-cuadros-amarillo",
    "Vestido Cuadros Amarillo",
    "Faldas",
    99000,
    "11-vestido-cuadros-amarillo.jpg",
    "Vestido corto a cuadros con falda plisada.\nPreppy con actitud.",
  ],
  [
    "polo-navy-contraste",
    "Polo Navy Contraste",
    "Tops",
    72000,
    "12-polo-navy-corbata.jpg",
    "Polo navy con ribetes en contraste.\nInspiración uniforme coreano.",
  ],
  [
    "cardigan-oversize-cuadros-verde",
    "Cardigan Oversize Cuadros Verde",
    "Sweaters",
    149000,
    "13-cardigan-cuadros-verde.jpg",
    "Cardigan tejido oversize con patrón de cuadros.\nPara capas infinitas.",
  ],
  [
    "sueter-trenzado-vino",
    "Suéter Trenzado Vino",
    "Sweaters",
    115000,
    "14-sueter-trenzado-vino.jpg",
    "Suéter de punto trenzado clásico.\nAbrigador y atemporal.",
    [
      { name: "Vino", hex: "#6E1A2B" },
      { name: "Crema", hex: "#E8DFCF" },
    ],
  ],
];

export const products: Product[] = raw.map(
  ([slug, name, category, price, file, description, colors], i) => ({
    id: i + 1,
    slug,
    name,
    category,
    price: convertCOPToPEN(price),
    image: img(file),
    sizes: [...SIZES],
    description,
    isNew: i < 4,
    shopTheLook: i === 2 || i === 8,
    colors,
  }),
);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

/** Medidas del cuerpo en cm: [talla, busto, cintura, cadera]. */
export const SIZE_CHART: [string, number, number, number][] = [
  ["XS", 80, 62, 86],
  ["S", 84, 66, 90],
  ["M", 88, 70, 94],
  ["L", 94, 76, 100],
  ["XL", 100, 82, 106],
];
