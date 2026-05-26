import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { calculateTDEE, calculateDailyCalories, calculateMacros } from "@/lib/nutrition";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, weightGoal, currentWeightKg, targetWeightKg, heightCm, age, sex, activityLevel, weeklyGoalKg, dietType } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        goals: {
          create: {
            weightGoal: weightGoal || "maintain",
            currentWeightKg: currentWeightKg || 70,
            targetWeightKg: targetWeightKg || null,
            heightCm: heightCm || 170,
            age: age || 30,
            sex: sex || "male",
            activityLevel: activityLevel || "moderate",
            weeklyGoalKg: weeklyGoalKg || 0.5,
            dietType: dietType || "balanced",
            dailyCalories: (() => {
              const tdee = calculateTDEE({ weightKg: currentWeightKg || 70, heightCm: heightCm || 170, age: age || 30, sex: sex || "male", activityLevel: activityLevel || "moderate" });
              return calculateDailyCalories({ tdee, weightGoal: weightGoal || "maintain", weeklyGoalKg: weeklyGoalKg || 0.5 });
            })(),
            ...calculateMacros(
              calculateDailyCalories({
                tdee: calculateTDEE({ weightKg: currentWeightKg || 70, heightCm: heightCm || 170, age: age || 30, sex: sex || "male", activityLevel: activityLevel || "moderate" }),
                weightGoal: weightGoal || "maintain",
                weeklyGoalKg: weeklyGoalKg || 0.5,
              }),
              dietType || "balanced"
            ),
          },
        },
      },
      include: { goals: true },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
