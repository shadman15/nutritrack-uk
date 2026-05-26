import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { calculateTDEE, calculateDailyCalories, calculateMacros } from "@/lib/nutrition";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.userGoals.findUnique({
    where: { userId: session.user.id },
  });

  if (!goals) return NextResponse.json({ error: "Goals not found" }, { status: 404 });

  return NextResponse.json({ goals });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { weightGoal, currentWeightKg, targetWeightKg, heightCm, age, sex, activityLevel, weeklyGoalKg, dietType } = body;

    const tdee = calculateTDEE({
      weightKg: currentWeightKg,
      heightCm,
      age,
      sex,
      activityLevel,
    });

    const dailyCalories = calculateDailyCalories({
      tdee,
      weightGoal,
      weeklyGoalKg,
    });

    const macros = calculateMacros(dailyCalories, dietType);

    const goals = await prisma.userGoals.update({
      where: { userId: session.user.id },
      data: {
        weightGoal,
        currentWeightKg,
        targetWeightKg,
        heightCm,
        age,
        sex,
        activityLevel,
        weeklyGoalKg,
        dietType,
        dailyCalories,
        proteinG: macros.proteinG,
        carbsG: macros.carbsG,
        fatG: macros.fatG,
      },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Update goals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
