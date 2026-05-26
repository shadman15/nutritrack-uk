import { NextRequest, NextResponse } from "next/server";
import { searchFoods } from "@/lib/food-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const superstore = searchParams.get("superstore") || undefined;
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });
  }

  try {
    const results = await searchFoods(query, superstore, limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
