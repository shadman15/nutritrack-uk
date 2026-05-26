import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ScanBarcode, Flame, Trophy, Calendar, BarChart3 } from "lucide-react";
import CalorieRing from "@/components/CalorieRing";
import MacroBar from "@/components/MacroBar";
import { formatCalories } from "@/lib/nutrition";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const today = new Date().toISOString().split("T")[0];

  const [goals, diary] = await Promise.all([
    prisma.userGoals.findUnique({ where: { userId: session.user.id } }),
    prisma.diaryEntry.findMany({
      where: { userId: session.user.id, date: today },
      include: { food: true },
    }),
  ]);

  if (!goals) {
    redirect("/register");
  }

  const consumed = {
    kcal: diary.reduce((sum, e) => sum + e.kcal, 0),
    proteinG: diary.reduce((sum, e) => sum + e.proteinG, 0),
    carbsG: diary.reduce((sum, e) => sum + e.carbsG, 0),
    fatG: diary.reduce((sum, e) => sum + e.fatG, 0),
  };

  const remainingKcal = Math.max(0, goals.dailyCalories - consumed.kcal);

  // Group diary by meal
  const meals = {
    breakfast: diary.filter(e => e.mealType === 'breakfast'),
    lunch: diary.filter(e => e.mealType === 'lunch'),
    dinner: diary.filter(e => e.mealType === 'dinner'),
    snacks: diary.filter(e => e.mealType === 'snacks'),
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[rgba(10,10,15,0.8)] backdrop-blur-md border-b border-[var(--color-border)] px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <span className="font-bold text-white leading-none">N</span>
          </div>
          <span className="font-bold font-[family-name:var(--font-outfit)] text-lg">Today</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-full text-sm font-medium">
            <Flame className="w-4 h-4 text-[var(--color-cta)]" />
            <span>3 Day Streak</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] border border-white/20"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6 pb-24">
        
        {/* Calorie Ring Card */}
        <section className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-1 text-[var(--color-text-muted)] text-sm">
            <Calendar className="w-4 h-4" />
            <span>Today</span>
          </div>
          
          <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-6 self-start">Calories Remaining</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-around">
            <CalorieRing consumed={consumed.kcal} goal={goals.dailyCalories} />
            
            <div className="flex-1 w-full max-w-xs flex flex-col gap-4">
              <MacroBar label="Protein" consumed={consumed.proteinG} goal={goals.proteinG} colorClass="protein" />
              <MacroBar label="Carbs" consumed={consumed.carbsG} goal={goals.carbsG} colorClass="carbs" />
              <MacroBar label="Fat" consumed={consumed.fatG} goal={goals.fatG} colorClass="fat" />
            </div>
          </div>
        </section>

        {/* AI Coach Tip */}
        <div className="glass-panel p-4 flex gap-4 items-start bg-gradient-to-r from-[rgba(124,58,237,0.1)] to-transparent border-[var(--color-primary)]/30">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 text-[var(--color-primary)]">AI Coach Tip</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              You're doing great! To hit your protein goal today, try adding a 150g serving of Greek Yogurt or a small chicken breast to your next meal.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/search" className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
              <Search className="w-5 h-5 text-[var(--color-text-muted)]" />
            </div>
            <span className="font-medium text-sm">Search Food</span>
          </Link>
          <Link href="/scanner" className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.02)] transition-colors border-[var(--color-accent)]/30 bg-[rgba(6,182,212,0.05)]">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ScanBarcode className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-sm text-[var(--color-accent)]">Scan Barcode</span>
          </Link>
        </div>

        {/* Diary Sections */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mt-4">Food Diary</h2>
          
          <MealSection title="Breakfast" items={meals.breakfast} />
          <MealSection title="Lunch" items={meals.lunch} />
          <MealSection title="Dinner" items={meals.dinner} />
          <MealSection title="Snacks" items={meals.snacks} />
        </div>

      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full glass-panel rounded-none border-x-0 border-b-0 md:hidden flex justify-around p-4 pb-safe z-30">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[var(--color-primary)]">
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-medium">Diary</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-1 text-[var(--color-text-muted)]">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        <Link href="/scanner" className="relative -top-6">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-[0_4px_20px_rgba(6,182,212,0.5)] text-white">
            <ScanBarcode className="w-7 h-7" />
          </div>
        </Link>
        <Link href="/progress" className="flex flex-col items-center gap-1 text-[var(--color-text-muted)]">
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-medium">Progress</span>
        </Link>
        <div className="flex flex-col items-center gap-1 text-[var(--color-text-muted)]">
          <div className="w-6 h-6 rounded-full bg-gray-600"></div>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </nav>
    </div>
  );
}

function MealSection({ title, items }: { title: string, items: any[] }) {
  const totalKcal = items.reduce((sum, item) => sum + item.kcal, 0);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.02)]">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm font-medium">{Math.round(totalKcal)} kcal</span>
      </div>
      
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center gap-2">
            <span>Nothing logged yet.</span>
            <Link href={`/search?meal=${title.toLowerCase()}`} className="text-[var(--color-primary)] hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Food
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.01)] transition-colors cursor-pointer">
              <div>
                <div className="font-medium text-sm">{item.food.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">
                  {item.quantityG}g • {item.food.brand || item.food.superstore || 'Generic'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{Math.round(item.kcal)}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">kcal</div>
              </div>
            </div>
          ))
        )}
        {items.length > 0 && (
          <Link href={`/search?meal=${title.toLowerCase()}`} className="p-3 text-sm text-[var(--color-primary)] font-medium flex items-center justify-center gap-1 hover:bg-[rgba(124,58,237,0.1)] transition-colors">
            <Plus className="w-4 h-4" /> Add More
          </Link>
        )}
      </div>
    </div>
  );
}
