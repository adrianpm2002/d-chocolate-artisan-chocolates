import bombones from "@/assets/p-bombones.jpg";
import tableta70 from "@/assets/p-tableta-70.jpg";
import fresas from "@/assets/p-fresas.jpg";
import cajaRegalo from "@/assets/p-caja-regalo.jpg";
import blancoFrambuesa from "@/assets/p-blanco-frambuesa.jpg";
import paletas from "@/assets/p-paletas.jpg";
import trufasCafe from "@/assets/p-trufas-cafe.jpg";
import bombonClasico from "@/assets/p-bombon-clasico.jpg";
import bombonCorazon from "@/assets/p-bombon-corazon.jpg";
import turron from "@/assets/p-turron.jpg";

export const CATEGORIES = [
  { id: "bombones", label: "Bombones y trufas" },
  { id: "turrones", label: "Turrones" },
  { id: "packs", label: "Packs y cajas de regalo" },
  { id: "tabletas", label: "Tabletas" },
  { id: "frutas", label: "Frutas cubiertas" },
  { id: "paletas", label: "Paletas" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const SORT_OPTIONS = [
  { id: "destacados", label: "Destacados" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "nombre", label: "Nombre (A–Z)" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

/* ---------- Pieces and variants ---------- */

export type Shell = "oscuro" | "leche" | "blanco" | "rubi";
export type Topping = "liso" | "hilos" | "punto" | "polvo" | "nuez" | "rayas";
export type Accent = "rosa" | "caramelo" | "blanco" | "oscuro" | "dorado" | "pistache";
export type PieceShape = "redondo" | "corazon" | "cuadrado" | "trufa";
export type PieceLook = { shell: Shell; topping: Topping; accent: Accent };

export type Variant = {
  id: string;
  label: string;
  price: number;
  detail?: string;
  look?: PieceLook;
};

type BaseProduct = {
  slug: string;
  name: string;
  category: CategoryId;
  presentation: string;
  cacao?: number;
  short: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  tag?: "Nuevo" | "Más vendido" | "Edición limitada";
  inStock: boolean;
  image?: string;
};

/** A product sold on its own. `piece` means it can also go inside a pack. */
export type IndividualProduct = BaseProduct & {
  kind: "individual";
  variants: Variant[];
  piece?: PieceShape;
};

export type PackSlot = { piece: string; variant: string };

/** A predefined pack: a container filled with pieces whose variants the customer can change. */
export type PackProduct = BaseProduct & {
  kind: "pack";
  container: string;
  contents: PackSlot[];
};

export type Product = IndividualProduct | PackProduct;

/* ---------- Containers ---------- */

export type Container = {
  id: string;
  label: string;
  description: string;
  shape: "caja" | "corazon" | "circulo";
  theme: "chocolate" | "caramelo" | "rosa" | "sanvalentin";
  capacity: number;
  price: number;
  grid?: { cols: number; rows: number };
  rings?: number[];
};

export const CONTAINERS: Container[] = [
  {
    id: "cajita-6",
    label: "Cajita",
    description: "Detalle pequeño de 6 piezas.",
    shape: "caja",
    theme: "rosa",
    capacity: 6,
    price: 25,
    grid: { cols: 3, rows: 2 },
  },
  {
    id: "caja-12",
    label: "Caja Celebración",
    description: "Caja rígida de 12 piezas con listón.",
    shape: "caja",
    theme: "caramelo",
    capacity: 12,
    price: 40,
    grid: { cols: 4, rows: 3 },
  },
  {
    id: "caja-16",
    label: "Caja clásica",
    description: "Caja color cacao de 16 piezas.",
    shape: "caja",
    theme: "chocolate",
    capacity: 16,
    price: 45,
    grid: { cols: 4, rows: 4 },
  },
  {
    id: "corazon-12",
    label: "Caja corazón",
    description: "Caja en forma de corazón de 12 piezas.",
    shape: "corazon",
    theme: "rosa",
    capacity: 12,
    price: 55,
  },
  {
    id: "lata-circular-20",
    label: "Lata circular San Valentín",
    description: "Envase circular de 20 piezas con decoración de San Valentín.",
    shape: "circulo",
    theme: "sanvalentin",
    capacity: 20,
    price: 60,
    rings: [1, 7, 12],
  },
];

export function getContainer(id: string) {
  return CONTAINERS.find((c) => c.id === id);
}

/* ---------- Products ---------- */

const s = (piece: string, variant: string, count = 1): PackSlot[] =>
  Array.from({ length: count }, () => ({ piece, variant }));

export const PRODUCTS: Product[] = [
  {
    kind: "individual",
    slug: "bombon-clasico",
    name: "Bombón clásico",
    category: "bombones",
    piece: "redondo",
    presentation: "Pieza individual · 12 g",
    short: "Bombón templado y decorado a mano. Elige tu relleno favorito.",
    description:
      "Nuestro bombón de siempre: una cubierta fina de chocolate templado con un relleno cremoso. El precio cambia según el relleno que elijas.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Chocolate blanco", "Crema", "Avellana", "Frutas naturales"],
    allergens: ["Leche", "Frutos secos", "Soya"],
    inStock: true,
    image: bombonClasico,
    variants: [
      { id: "ganache-oscuro", label: "Ganache oscuro", detail: "Chocolate 70% y crema", price: 18, look: { shell: "oscuro", topping: "hilos", accent: "dorado" } },
      { id: "praline-avellana", label: "Praliné de avellana", detail: "Avellana tostada", price: 20, look: { shell: "leche", topping: "nuez", accent: "caramelo" } },
      { id: "caramelo-salado", label: "Caramelo salado", detail: "Caramelo con flor de sal", price: 21, look: { shell: "oscuro", topping: "rayas", accent: "caramelo" } },
      { id: "maracuya", label: "Maracuyá", detail: "Ganache de fruta", price: 22, look: { shell: "blanco", topping: "punto", accent: "dorado" } },
      { id: "frutos-rojos", label: "Frutos rojos", detail: "Fresa y frambuesa", price: 22, look: { shell: "rubi", topping: "hilos", accent: "blanco" } },
    ],
  },
  {
    kind: "individual",
    slug: "bombon-corazon",
    name: "Bombón corazón",
    category: "bombones",
    piece: "corazon",
    presentation: "Pieza individual · 14 g",
    short: "Corazones de chocolate con rellenos suaves para regalar.",
    description:
      "Bombones en forma de corazón, perfectos para San Valentín o para decir te quiero cualquier día.",
    ingredients: ["Chocolate rubí", "Chocolate de leche", "Chocolate blanco", "Fresa", "Frambuesa"],
    allergens: ["Leche", "Soya"],
    tag: "Nuevo",
    inStock: true,
    image: bombonCorazon,
    variants: [
      { id: "ganache-leche", label: "Ganache de leche", detail: "Suave y cremoso", price: 22, look: { shell: "leche", topping: "hilos", accent: "rosa" } },
      { id: "fresa", label: "Fresa", detail: "Chocolate rubí y fresa", price: 24, look: { shell: "rubi", topping: "liso", accent: "blanco" } },
      { id: "frambuesa", label: "Frambuesa", detail: "Chocolate blanco y frambuesa", price: 24, look: { shell: "blanco", topping: "polvo", accent: "rosa" } },
    ],
  },
  {
    kind: "individual",
    slug: "trufa-artesanal",
    name: "Trufa artesanal",
    category: "bombones",
    piece: "trufa",
    presentation: "Pieza individual · 15 g",
    short: "Trufas de ganache enrolladas a mano y espolvoreadas.",
    description:
      "Trufas suaves de ganache, enrolladas a mano una por una. Elige el sabor; el precio depende del relleno.",
    ingredients: ["Chocolate oscuro", "Crema", "Café", "Cacao en polvo", "Coco"],
    allergens: ["Leche"],
    inStock: true,
    image: trufasCafe,
    variants: [
      { id: "cacao", label: "Cacao amargo", detail: "Clásica", price: 18, look: { shell: "leche", topping: "polvo", accent: "oscuro" } },
      { id: "cafe", label: "Café de altura", detail: "Café de especialidad", price: 19, look: { shell: "oscuro", topping: "polvo", accent: "caramelo" } },
      { id: "coco", label: "Coco", detail: "Coco rallado tostado", price: 20, look: { shell: "oscuro", topping: "polvo", accent: "blanco" } },
    ],
  },
  {
    kind: "individual",
    slug: "turron-artesanal",
    name: "Turrón artesanal",
    category: "turrones",
    piece: "cuadrado",
    presentation: "Pieza individual · 20 g",
    short: "Turrón crujiente de miel con frutos secos, bañado en chocolate.",
    description:
      "Turrón de miel y frutos secos tostados, cortado en cuadros y bañado en chocolate. Elige el fruto seco.",
    ingredients: ["Miel", "Almendra", "Avellana", "Pistache", "Chocolate"],
    allergens: ["Frutos secos", "Huevo", "Leche"],
    inStock: true,
    image: turron,
    variants: [
      { id: "almendra", label: "Almendra tostada", price: 20, look: { shell: "leche", topping: "nuez", accent: "dorado" } },
      { id: "avellana", label: "Avellana", price: 21, look: { shell: "oscuro", topping: "nuez", accent: "caramelo" } },
      { id: "pistache", label: "Pistache", price: 26, look: { shell: "blanco", topping: "nuez", accent: "pistache" } },
    ],
  },
  {
    kind: "pack",
    slug: "san-valentin-20",
    name: "Lata San Valentín",
    category: "packs",
    container: "lata-circular-20",
    presentation: "20 bombones en envase circular",
    short: "Veinte bombones en lata circular decorada para San Valentín.",
    description:
      "Un corazón de fresa al centro, rodeado de corazones de leche y un anillo de frutos rojos y frambuesa. Puedes cambiar el relleno de cada pieza.",
    ingredients: ["Chocolate rubí", "Chocolate de leche", "Chocolate blanco", "Fresa", "Frambuesa"],
    allergens: ["Leche", "Soya"],
    tag: "Edición limitada",
    inStock: true,
    contents: [
      ...s("bombon-corazon", "fresa"),
      ...s("bombon-corazon", "ganache-leche", 7),
      ...Array.from({ length: 6 }, () => [
        { piece: "bombon-clasico", variant: "frutos-rojos" },
        { piece: "bombon-corazon", variant: "frambuesa" },
      ]).flat(),
    ],
  },
  {
    kind: "pack",
    slug: "bombones-surtidos",
    name: "Bombones surtidos de autor",
    category: "packs",
    container: "caja-16",
    presentation: "Caja de 16 piezas",
    short: "Dieciséis bombones pintados a mano con rellenos de temporada.",
    description:
      "Nuestra selección insignia: ganache oscuro, praliné de avellana, maracuyá y frutos rojos. Cambia el relleno de las piezas que quieras.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Crema", "Avellana", "Frutas naturales"],
    allergens: ["Leche", "Frutos secos", "Soya"],
    tag: "Más vendido",
    inStock: true,
    image: bombones,
    contents: [
      ...s("bombon-clasico", "ganache-oscuro", 4),
      ...s("bombon-clasico", "praline-avellana", 4),
      ...s("bombon-clasico", "maracuya", 4),
      ...s("bombon-clasico", "frutos-rojos", 4),
    ],
  },
  {
    kind: "pack",
    slug: "caja-regalo-12",
    name: "Caja de regalo Celebración",
    category: "packs",
    container: "caja-12",
    presentation: "Caja de 12 piezas con listón",
    short: "Doce piezas variadas en caja rígida con listón de satín.",
    description:
      "Corazones, trufas, bombones y turrón en una caja rígida con listón. Incluye tarjeta para dedicatoria. Puedes cambiar el relleno de cada pieza.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Chocolate blanco", "Rellenos variados", "Almendra"],
    allergens: ["Leche", "Frutos secos", "Soya", "Huevo"],
    inStock: true,
    image: cajaRegalo,
    contents: [
      ...s("bombon-corazon", "fresa", 4),
      ...s("trufa-artesanal", "cafe"),
      ...s("bombon-clasico", "caramelo-salado"),
      ...s("trufa-artesanal", "cafe"),
      ...s("bombon-clasico", "caramelo-salado"),
      ...s("turron-artesanal", "almendra", 4),
    ],
  },
  {
    kind: "individual",
    slug: "tableta-oscura-70",
    name: "Tableta oscura 70%",
    category: "tabletas",
    presentation: "Tableta de 80 g",
    cacao: 70,
    short: "Cacao de origen con notas a frutos secos y un final largo.",
    description:
      "Elaborada en pequeños lotes con cacao fino de aroma. Textura sedosa, notas a nuez tostada y frutos rojos, con un amargor equilibrado.",
    ingredients: ["Pasta de cacao", "Azúcar de caña", "Manteca de cacao"],
    allergens: ["Puede contener trazas de leche y frutos secos"],
    inStock: true,
    image: tableta70,
    variants: [{ id: "unica", label: "Tableta de 80 g", price: 135 }],
  },
  {
    kind: "individual",
    slug: "fresas-cubiertas",
    name: "Fresas cubiertas",
    category: "frutas",
    presentation: "Charola de 8 piezas",
    short: "Fresas frescas bañadas en chocolate oscuro con hilos de blanco.",
    description:
      "Fresas seleccionadas el mismo día, cubiertas en chocolate oscuro 60% y decoradas con chocolate blanco. Ideales para regalar o compartir.",
    ingredients: ["Fresa fresca", "Chocolate oscuro 60%", "Chocolate blanco"],
    allergens: ["Leche", "Soya"],
    inStock: true,
    image: fresas,
    variants: [{ id: "unica", label: "Charola de 8 piezas", price: 260 }],
  },
  {
    kind: "individual",
    slug: "tableta-blanca-frambuesa",
    name: "Tableta blanca con frambuesa",
    category: "tabletas",
    presentation: "Tableta de 90 g",
    short: "Chocolate blanco cremoso con frambuesa liofilizada y pistache.",
    description:
      "Un contraste fresco y crujiente: chocolate blanco con vainilla natural, frambuesas liofilizadas y pistache tostado.",
    ingredients: ["Manteca de cacao", "Leche entera", "Azúcar", "Frambuesa", "Pistache", "Vainilla"],
    allergens: ["Leche", "Frutos secos"],
    inStock: true,
    image: blancoFrambuesa,
    variants: [{ id: "unica", label: "Tableta de 90 g", price: 150 }],
  },
  {
    kind: "individual",
    slug: "paletas-de-chocolate",
    name: "Paletas de chocolate",
    category: "paletas",
    presentation: "Paquete de 6 piezas",
    short: "Paletas de chocolate con nueces, frutos secos y fruta deshidratada.",
    description:
      "Discos de chocolate oscuro y de leche decorados con almendra, pistache, arándano y chabacano. Un detalle divertido para fiestas y mesas de dulces.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Almendra", "Pistache", "Arándano", "Chabacano"],
    allergens: ["Leche", "Frutos secos", "Soya"],
    inStock: false,
    image: paletas,
    variants: [{ id: "unica", label: "Paquete de 6 piezas", price: 180 }],
  },
];

/** Individual products that can be placed inside a pack. */
export const PIECES = PRODUCTS.filter(
  (p): p is IndividualProduct & { piece: PieceShape } => p.kind === "individual" && Boolean(p.piece),
);

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getPiece(slug: string) {
  return PIECES.find((p) => p.slug === slug);
}

export function getVariant(product: IndividualProduct, variantId: string) {
  return product.variants.find((v) => v.id === variantId);
}

/** Price of one slot inside a pack: the price of the chosen variant of that piece. */
export function slotPrice(slot: PackSlot) {
  const piece = getPiece(slot.piece);
  return (piece && getVariant(piece, slot.variant)?.price) ?? 0;
}

/** Pack price = container price + the price of every piece placed in it. */
export function packPrice(containerId: string, slots: (PackSlot | null)[]) {
  const container = getContainer(containerId);
  const pieces = slots.reduce((sum, slot) => sum + (slot ? slotPrice(slot) : 0), 0);
  return (container?.price ?? 0) + pieces;
}

/** Display price: cheapest variant for individual products, full pack price for packs. */
export function productPrice(product: Product) {
  if (product.kind === "pack") return packPrice(product.container, product.contents);
  return Math.min(...product.variants.map((v) => v.price));
}

export function hasPriceRange(product: Product) {
  return product.kind === "individual" && new Set(product.variants.map((v) => v.price)).size > 1;
}

/* ---------- Filtering ---------- */

export type CatalogFilters = {
  q?: string | undefined;
  categoria?: CategoryId | undefined;
  orden?: SortId | undefined;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterProducts(products: Product[], filters: CatalogFilters): Product[] {
  const query = filters.q ? normalize(filters.q.trim()) : "";
  const result = products.filter((p) => {
    if (filters.categoria && p.category !== filters.categoria) return false;
    if (query) {
      const variants = p.kind === "individual" ? p.variants.map((v) => v.label).join(" ") : "";
      const haystack = normalize(`${p.name} ${p.short} ${p.ingredients.join(" ")} ${variants}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  switch (filters.orden) {
    case "precio-asc":
      return [...result].sort((a, b) => productPrice(a) - productPrice(b));
    case "precio-desc":
      return [...result].sort((a, b) => productPrice(b) - productPrice(a));
    case "nombre":
      return [...result].sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      return result;
  }
}

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function formatPrice(value: number) {
  return `$${value.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const categoryIds = new Set<string>(CATEGORIES.map((c) => c.id));
const sortIds = new Set<string>(SORT_OPTIONS.map((s) => s.id));

export function parseCatalogSearch(search: Record<string, unknown>): CatalogFilters {
  const q = search["q"];
  const categoria = search["categoria"];
  const orden = search["orden"];
  return {
    q: typeof q === "string" && q.trim() ? q : undefined,
    categoria:
      typeof categoria === "string" && categoryIds.has(categoria)
        ? (categoria as CategoryId)
        : undefined,
    orden: typeof orden === "string" && sortIds.has(orden) ? (orden as SortId) : undefined,
  };
}
