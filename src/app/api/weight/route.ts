import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const history = await prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { weightKg, date } = await req.json();

    if (!weightKg) {
      return NextResponse.json({ error: "Missing weight" }, { status: 400 });
    }

    const entryDate = date || new Date().toISOString().split("T")[0];

    // Check if an entry already exists for this date, if so update it, otherwise create
    const existing = await prisma.weightEntry.findFirst({
      where: { userId: session.user.id, date: entryDate },
    });

    let entry;
    if (existing) {
      entry = await prisma.weightEntry.update({
        where: { id: existing.id },
        data: { weightKg },
      });
    } else {
      entry = await prisma.weightEntry.create({
        data: {
          userId: session.user.id,
          date: entryDate,
          weightKg,
        },
      });
    }

    // Also update the user's current weight in their goals
    await prisma.userGoals.update({
      where: { userId: session.user.id },
      data: { currentWeightKg: weightKg },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Log weight error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
