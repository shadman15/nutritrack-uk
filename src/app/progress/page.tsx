"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, TrendingDown, Target, Loader2, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { calculateBMI, getBMICategory } from "@/lib/nutrition";

export default function ProgressPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, goalsRes] = await Promise.all([
          fetch("/api/weight"),
          fetch("/api/goals")
        ]);
        
        const historyData = await historyRes.json();
        const goalsData = await goalsRes.json();
        
        if (historyData.history) setHistory(historyData.history);
        if (goalsData.goals) {
          setGoals(goalsData.goals);
          if (historyData.history.length === 0) {
            // Set initial weight if no history
            setNewWeight(goalsData.goals.currentWeightKg.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load progress data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    setLogging(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: parseFloat(newWeight) }),
      });
      
      const data = await res.json();
      if (data.entry) {
        // Update local history
        setHistory(prev => {
          const filtered = prev.filter(p => p.date !== data.entry.date);
          return [...filtered, data.entry].sort((a, b) => a.date.localeCompare(b.date));
        });
        setGoals((prev: any) => ({ ...prev, currentWeightKg: data.entry.weightKg }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const currentWeight = goals?.currentWeightKg || 0;
  const bmi = calculateBMI(currentWeight, goals?.heightCm || 170);
  const bmiCategory = getBMICategory(bmi);
  const totalLost = history.length > 0 ? history[0].weightKg - currentWeight : 0;

  // Format data for chart
  const chartData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    weight: h.weightKg
  }));

  // Ensure chart has points even if only 1 entry
  if (chartData.length === 1) {
    chartData.unshift({ date: "Start", weight: chartData[0].weight });
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24">
      <header className="sticky top-0 z-30 bg-[rgba(10,10,15,0.8)] backdrop-blur-md border-b border-[var(--color-border)] p-4 flex items-center gap-4">
        <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold font-[family-name:var(--font-outfit)] text-xl">Progress & Weight</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Current Weight</span>
            <div className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-white">
              {currentWeight} <span className="text-lg text-[var(--color-text-muted)] font-normal">kg</span>
            </div>
            {goals?.weightGoal === "lose" && totalLost > 0 && (
              <span className="text-xs text-[var(--color-positive)] font-medium mt-1">-{totalLost.toFixed(1)}kg total lost</span>
            )}
          </div>
          
          <div className="glass-panel p-4 flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-1"><Target className="w-4 h-4" /> Target Weight</span>
            <div className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-[var(--color-accent)]">
              {goals?.weightGoal === 'maintain' ? currentWeight : goals?.targetWeightKg} <span className="text-lg opacity-70 font-normal">kg</span>
            </div>
          </div>
        </div>

        {/* Log Weight Card */}
        <div className="glass-panel p-6 border-[var(--color-primary)]/30 bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-transparent">
          <h2 className="font-semibold mb-4">Log Today's Weight</h2>
          <form onSubmit={handleLogWeight} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={currentWeight.toString()}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-[var(--color-primary)] text-xl font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">kg</span>
            </div>
            <button 
              type="submit"
              disabled={logging}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {logging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Log
            </button>
          </form>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="glass-panel p-6 h-80 flex flex-col">
            <h2 className="font-semibold mb-6">Weight Trend</h2>
            <div className="flex-1 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--color-text-muted)" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    stroke="var(--color-text-muted)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--color-accent)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Health Stats */}
        <div className="glass-panel overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="font-semibold">Health Stats</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[var(--color-text-muted)] mb-1">BMI</div>
              <div className="text-2xl font-bold">{bmi}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--color-text-muted)] mb-1">Category</div>
              <div className={`text-lg font-bold ${bmiCategory === 'Healthy Weight' ? 'text-[var(--color-positive)]' : 'text-[var(--color-warning)]'}`}>
                {bmiCategory}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
