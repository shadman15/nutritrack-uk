// Open Food Facts API integration with UK focus
import { prisma } from "./db";

const OFF_API = "https://world.openfoodfacts.org/api/v0/product";
const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";

export interface FoodItemData {
  id?: string;
  barcode?: string;
  name: string;
  brand?: string;
  category?: string;
  superstore?: string;
  per100gKcal: number;
  per100gProtein: number;
  per100gCarbs: number;
  per100gFat: number;
  per100gFibre: number;
  per100gSalt: number;
  per100gSugar: number;
  per100gSaturates: number;
  imageUrl?: string;
  verified: boolean;
}

export async function lookupBarcode(barcode: string): Promise<FoodItemData | null> {
  // 1. Check local DB cache first
  const cached = await prisma.foodItem.findUnique({ where: { barcode } });
  if (cached) return cached as unknown as FoodItemData;

  // 2. Fetch from Open Food Facts
  try {
    const res = await fetch(`${OFF_API}/${barcode}.json`, {
      next: { revalidate: 86400 },
    });
    const data = await res.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const nutriments = p.nutriments || {};

    const foodData: FoodItemData = {
      barcode,
      name: p.product_name_en || p.product_name || "Unknown Product",
      brand: p.brands || undefined,
      category: p.categories_tags?.[0]?.replace("en:", "") || undefined,
      superstore: detectSuperstore(p.stores || ""),
      per100gKcal: parseFloat(nutriments["energy-kcal_100g"]) || 0,
      per100gProtein: parseFloat(nutriments.proteins_100g) || 0,
      per100gCarbs: parseFloat(nutriments.carbohydrates_100g) || 0,
      per100gFat: parseFloat(nutriments.fat_100g) || 0,
      per100gFibre: parseFloat(nutriments.fiber_100g) || 0,
      per100gSalt: parseFloat(nutriments.salt_100g) || 0,
      per100gSugar: parseFloat(nutriments.sugars_100g) || 0,
      per100gSaturates: parseFloat(nutriments["saturated-fat_100g"]) || 0,
      imageUrl: p.image_front_url || p.image_url || undefined,
      verified: false,
    };

    // Cache in DB
    const saved = await prisma.foodItem.create({ data: foodData });
    return saved as unknown as FoodItemData;
  } catch (e) {
    console.error("Barcode lookup failed:", e);
    return null;
  }
}

export async function searchFoods(
  query: string,
  superstore?: string,
  limit = 20
): Promise<FoodItemData[]> {
  // Search local DB first
  const localResults = await prisma.foodItem.findMany({
    where: {
      name: { contains: query },
      ...(superstore ? { superstore } : {}),
    },
    take: limit,
    orderBy: [{ verified: "desc" }, { name: "asc" }],
  });

  if (localResults.length >= limit) {
    return localResults as unknown as FoodItemData[];
  }

  // Supplement with Open Food Facts
  try {
    const params = new URLSearchParams({
      search_terms: superstore ? `${SUPERSTORE_LABELS[superstore] || superstore} ${query}` : query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: superstore ? "50" : String(limit - localResults.length),
      tagtype_0: "countries",
      tag_contains_0: "contains",
      tag_0: "united kingdom",
      fields:
        "product_name,brands,categories_tags,stores,nutriments,image_front_url,code",
    });

    const res = await fetch(`${OFF_SEARCH}?${params}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    let offResults: FoodItemData[] = (data.products || [])
      .filter((p: Record<string, unknown>) => p.product_name)
      .map((p: Record<string, unknown>) => {
        const nutriments = (p.nutriments as Record<string, unknown>) || {};
        const pName = String(p.product_name_en || p.product_name || "Unknown");
        const pBrand = String(p.brands || "");
        const pStores = String(p.stores || "");
        
        return {
          barcode: String(p.code || ""),
          name: pName,
          brand: pBrand || undefined,
          category: (p.categories_tags as string[])?.[0]?.replace("en:", "") || undefined,
          superstore: detectSuperstore(pStores, pBrand, pName),
          per100gKcal: parseFloat(String(nutriments["energy-kcal_100g"] || "0")) || 0,
          per100gProtein: parseFloat(String(nutriments.proteins_100g || "0")) || 0,
          per100gCarbs: parseFloat(String(nutriments.carbohydrates_100g || "0")) || 0,
          per100gFat: parseFloat(String(nutriments.fat_100g || "0")) || 0,
          per100gFibre: parseFloat(String(nutriments.fiber_100g || "0")) || 0,
          per100gSalt: parseFloat(String(nutriments.salt_100g || "0")) || 0,
          per100gSugar: parseFloat(String(nutriments.sugars_100g || "0")) || 0,
          per100gSaturates: parseFloat(String(nutriments["saturated-fat_100g"] || "0")) || 0,
          imageUrl: String(p.image_front_url || p.image_url || "") || undefined,
          verified: false,
        };
      });

    if (superstore) {
      offResults = offResults.filter(p => p.superstore === superstore);
    }
    
    offResults = offResults.slice(0, limit - localResults.length);

    return [...localResults as unknown as FoodItemData[], ...offResults];
  } catch {
    return localResults as unknown as FoodItemData[];
  }
}

function detectSuperstore(stores: string, brand: string = "", name: string = ""): string | undefined {
  const combined = (stores + " " + brand + " " + name).toLowerCase();
  if (combined.includes("tesco")) return "tesco";
  if (combined.includes("asda")) return "asda";
  if (combined.includes("sainsbury")) return "sainsburys";
  if (combined.includes("aldi")) return "aldi";
  if (combined.includes("marks") || combined.includes("m&s")) return "marks_spencer";
  if (combined.includes("waitrose")) return "waitrose";
  if (combined.includes("lidl")) return "lidl";
  if (combined.includes("co-op") || combined.includes("coop")) return "coop";
  if (combined.includes("morrisons")) return "morrisons";
  return undefined;
}

export const SUPERSTORE_LABELS: Record<string, string> = {
  tesco: "Tesco",
  asda: "ASDA",
  sainsburys: "Sainsbury's",
  aldi: "ALDI",
  marks_spencer: "M&S",
  waitrose: "Waitrose",
  lidl: "Lidl",
  coop: "Co-op",
  morrisons: "Morrisons",
};

export const SUPERSTORE_COLORS: Record<string, string> = {
  tesco: "#00539F",
  asda: "#78BE20",
  sainsburys: "#FF7400",
  aldi: "#003882",
  marks_spencer: "#000000",
  waitrose: "#4B8B3B",
  lidl: "#0050AA",
  coop: "#00B1A9",
  morrisons: "#FFD700",
};
