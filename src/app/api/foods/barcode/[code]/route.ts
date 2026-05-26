import { NextRequest, NextResponse } from "next/server";
import { lookupBarcode } from "@/lib/food-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: "Missing barcode" }, { status: 400 });
  }

  try {
    const food = await lookupBarcode(code);
    
    if (!food) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ food });
  } catch (error) {
    console.error("Barcode lookup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
