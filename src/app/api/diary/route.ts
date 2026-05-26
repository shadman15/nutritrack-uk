import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: session.user.id, date },
    include: { food: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { foodItemId, date, mealType, quantityG, foodData } = await req.json();

    let food = null;
    if (foodItemId) {
      food = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
    }

    if (!food && foodData) {
      if (foodData.barcode) {
        food = await prisma.foodItem.findUnique({ where: { barcode: foodData.barcode } });
      }
      
      if (!food) {
        food = await prisma.foodItem.create({
          data: {
            barcode: foodData.barcode,
            name: foodData.name,
            brand: foodData.brand,
            category: foodData.category,
            superstore: foodData.superstore,
            per100gKcal: foodData.per100gKcal,
            per100gProtein: foodData.per100gProtein,
            per100gCarbs: foodData.per100gCarbs,
            per100gFat: foodData.per100gFat,
            per100gFibre: foodData.per100gFibre,
            per100gSalt: foodData.per100gSalt,
            per100gSugar: foodData.per100gSugar,
            per100gSaturates: foodData.per100gSaturates,
            imageUrl: foodData.imageUrl,
          }
        });
      }
    }

    if (!food) return NextResponse.json({ error: "Food not found" }, { status: 404 });

    const factor = quantityG / 100;
    const entry = await prisma.diaryEntry.create({
      data: {
        userId: session.user.id,
        date: date || new Date().toISOString().split("T")[0],
        mealType: mealType || "snacks",
        foodItemId: food.id,
        quantityG,
        kcal: food.per100gKcal * factor,
        proteinG: food.per100gProtein * factor,
        carbsG: food.per100gCarbs * factor,
        fatG: food.per100gFat * factor,
        fibreG: food.per100gFibre * factor,
        saltG: food.per100gSalt * factor,
        sugarG: food.per100gSugar * factor,
        saturatesG: food.per100gSaturates * factor,
      },
      include: { food: true },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Diary POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
