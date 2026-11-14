import bombones from "@/assets/p-bombones.jpg";
import tableta70 from "@/assets/p-tableta-70.jpg";
import fresas from "@/assets/p-fresas.jpg";
import cajaRegalo from "@/assets/p-caja-regalo.jpg";
import blancoFrambuesa from "@/assets/p-blanco-frambuesa.jpg";
import paletas from "@/assets/p-paletas.jpg";
import trufasCafe from "@/assets/p-trufas-cafe.jpg";

export const CATEGORIES = [
  { id: "bombones", label: "Bombones y trufas" },
  { id: "tabletas", label: "Tabletas" },
  { id: "frutas", label: "Frutas cubiertas" },
  { id: "regalos", label: "Cajas de regalo" },
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

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  presentation: string;
  cacao?: number;
  short: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  tag?: "Nuevo" | "Más vendido" | "Edición limitada";
  inStock: boolean;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "bombones-surtidos",
    name: "Bombones surtidos de autor",
    category: "bombones",
    price: 420,
    presentation: "Caja de 16 piezas",
    short: "Dieciséis bombones pintados a mano con rellenos de temporada.",
    description:
      "Nuestra selección insignia: bombones de chocolate oscuro, de leche y blanco con rellenos de ganache, praliné de avellana, maracuyá y frutos rojos. Cada pieza se templa y decora a mano.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Crema", "Avellana", "Frutas naturales"],
    allergens: ["Leche", "Frutos secos", "Soya"],
    tag: "Más vendido",
    inStock: true,
    image: bombones,
  },
  {
    slug: "tableta-oscura-70",
    name: "Tableta oscura 70%",
    category: "tabletas",
    price: 135,
    presentation: "Tableta de 80 g",
    cacao: 70,
    short: "Cacao de origen con notas a frutos secos y un final largo.",
    description:
      "Elaborada en pequeños lotes con cacao fino de aroma. Textura sedosa, notas a nuez tostada y frutos rojos, con un amargor equilibrado.",
    ingredients: ["Pasta de cacao", "Azúcar de caña", "Manteca de cacao"],
    allergens: ["Puede contener trazas de leche y frutos secos"],
    inStock: true,
    image: tableta70,
  },
  {
    slug: "fresas-cubiertas",
    name: "Fresas cubiertas",
    category: "frutas",
    price: 260,
    presentation: "Charola de 8 piezas",
    short: "Fresas frescas bañadas en chocolate oscuro con hilos de blanco.",
    description:
      "Fresas seleccionadas el mismo día, cubiertas en chocolate oscuro 60% y decoradas con chocolate blanco. Ideales para regalar o compartir.",
    ingredients: ["Fresa fresca", "Chocolate oscuro 60%", "Chocolate blanco"],
    allergens: ["Leche", "Soya"],
    tag: "Nuevo",
    inStock: true,
    image: fresas,
  },
  {
    slug: "caja-regalo-12",
    name: "Caja de regalo Celebración",
    category: "regalos",
    price: 380,
    presentation: "Caja de 12 piezas con listón",
    short: "Doce bombones variados en caja rígida con listón de satín.",
    description:
      "Pensada para ocasiones especiales: doce bombones elegidos por nuestros chocolateros, presentados en una caja rígida color cacao con listón. Incluye tarjeta para dedicatoria.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Chocolate blanco", "Rellenos variados"],
    allergens: ["Leche", "Frutos secos", "Soya", "Gluten"],
    tag: "Edición limitada",
    inStock: true,
    image: cajaRegalo,
  },
  {
    slug: "tableta-blanca-frambuesa",
    name: "Tableta blanca con frambuesa",
    category: "tabletas",
    price: 150,
    presentation: "Tableta de 90 g",
    short: "Chocolate blanco cremoso con frambuesa liofilizada y pistache.",
    description:
      "Un contraste fresco y crujiente: chocolate blanco con vainilla natural, frambuesas liofilizadas y pistache tostado.",
    ingredients: ["Manteca de cacao", "Leche entera", "Azúcar", "Frambuesa", "Pistache", "Vainilla"],
    allergens: ["Leche", "Frutos secos"],
    inStock: true,
    image: blancoFrambuesa,
  },
  {
    slug: "paletas-de-chocolate",
    name: "Paletas de chocolate",
    category: "paletas",
    price: 180,
    presentation: "Paquete de 6 piezas",
    short: "Paletas de chocolate con nueces, frutos secos y fruta deshidratada.",
    description:
      "Discos de chocolate oscuro y de leche decorados con almendra, pistache, arándano y chabacano. Un detalle divertido para fiestas y mesas de dulces.",
    ingredients: ["Chocolate oscuro", "Chocolate de leche", "Almendra", "Pistache", "Arándano", "Chabacano"],
    allergens: ["Leche", "Frutos secos", "Soya"],
    inStock: false,
    image: paletas,
  },
  {
    slug: "trufas-de-cafe",
    name: "Trufas de café",
    category: "bombones",
    price: 240,
    presentation: "Caja de 9 piezas",
    short: "Ganache de café de altura cubierta con cacao en polvo.",
    description:
      "Trufas suaves de ganache con café de especialidad, enrolladas a mano y espolvoreadas con cacao amargo.",
    ingredients: ["Chocolate oscuro", "Crema", "Café", "Cacao en polvo"],
    allergens: ["Leche"],
    tag: "Nuevo",
    inStock: true,
    image: trufasCafe,
  },
];

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
      const haystack = normalize(`${p.name} ${p.short} ${p.ingredients.join(" ")}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  switch (filters.orden) {
    case "precio-asc":
      return [...result].sort((a, b) => a.price - b.price);
    case "precio-desc":
      return [...result].sort((a, b) => b.price - a.price);
    case "nombre":
      return [...result].sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      return result;
  }
}

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
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
  return {
    q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
    categoria:
      typeof search.categoria === "string" && categoryIds.has(search.categoria)
        ? (search.categoria as CategoryId)
        : undefined,
    orden:
      typeof search.orden === "string" && sortIds.has(search.orden)
        ? (search.orden as SortId)
        : undefined,
  };
}
