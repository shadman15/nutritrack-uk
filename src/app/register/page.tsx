"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, Target, Scale, Activity } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    age: 30,
    sex: "male",
    heightCm: 170,
    currentWeightKg: 75,
    weightGoal: "lose", // lose, maintain, gain
    targetWeightKg: 70,
    weeklyGoalKg: 0.5,
    activityLevel: "moderate", // sedentary, light, moderate, active, very_active
    dietType: "balanced",
  });

  const updateData = (fields: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => setStep((s) => Math.min(5, s + 1) as Step);
  const handleBack = () => setStep((s) => Math.max(1, s - 1) as Step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      handleNext();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register");
      }

      // Auto-login
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInRes?.error) {
        throw new Error("Login failed after registration");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface-2)]">
      <div className="glass-panel w-full max-w-lg p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(255,255,255,0.05)]">
          <div 
            className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <button 
          onClick={handleBack} 
          className={`mb-6 text-[var(--color-text-muted)] hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[var(--color-warning)] p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">Let's get started</h1>
                <p className="text-[var(--color-text-muted)]">Create your account to start tracking</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    required
                    type="text"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={data.email}
                    onChange={(e) => updateData({ email: e.target.value })}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    required
                    type="password"
                    value={data.password}
                    onChange={(e) => updateData({ password: e.target.value })}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <Scale className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
                <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">About you</h1>
                <p className="text-[var(--color-text-muted)]">We use this to calculate your metabolic rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex gap-4 p-1 bg-[rgba(255,255,255,0.05)] rounded-lg">
                  <button type="button" onClick={() => updateData({ sex: "male" })} className={`flex-1 py-2 rounded-md transition-colors ${data.sex === "male" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"}`}>Male</button>
                  <button type="button" onClick={() => updateData({ sex: "female" })} className={`flex-1 py-2 rounded-md transition-colors ${data.sex === "female" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"}`}>Female</button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input required type="number" min="16" max="100" value={data.age} onChange={(e) => updateData({ age: parseInt(e.target.value) })} className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height (cm)</label>
                  <input required type="number" value={data.heightCm} onChange={(e) => updateData({ heightCm: parseInt(e.target.value) })} className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input required type="number" step="0.1" value={data.currentWeightKg} onChange={(e) => updateData({ currentWeightKg: parseFloat(e.target.value) })} className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-[var(--color-cta)] mx-auto mb-4" />
                <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">Your Goal</h1>
                <p className="text-[var(--color-text-muted)]">What are you trying to achieve?</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: "lose", label: "Lose weight", desc: "Burn fat and get leaner" },
                  { id: "maintain", label: "Maintain weight", desc: "Stay at your current weight" },
                  { id: "gain", label: "Gain weight", desc: "Build muscle mass" },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => updateData({ weightGoal: goal.id as any })}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${data.weightGoal === goal.id ? "border-[var(--color-primary)] bg-[rgba(124,58,237,0.1)]" : "border-[var(--color-border)] hover:border-white/20"}`}
                  >
                    <div className="font-semibold">{goal.label}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">{goal.desc}</div>
                  </button>
                ))}
              </div>

              {data.weightGoal !== "maintain" && (
                <div className="mt-6 animate-in fade-in duration-300">
                  <label className="block text-sm font-medium mb-1">Target Weight (kg)</label>
                  <input required type="number" step="0.1" value={data.targetWeightKg} onChange={(e) => updateData({ targetWeightKg: parseFloat(e.target.value) })} className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3" />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <Activity className="w-12 h-12 text-[var(--color-positive)] mx-auto mb-4" />
                <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">Activity Level</h1>
                <p className="text-[var(--color-text-muted)]">How active are you day-to-day?</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: "sedentary", label: "Sedentary", desc: "Office job, little to no exercise" },
                  { id: "light", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
                  { id: "moderate", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
                  { id: "active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
                ].map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => updateData({ activityLevel: level.id as any })}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${data.activityLevel === level.id ? "border-[var(--color-primary)] bg-[rgba(124,58,237,0.1)]" : "border-[var(--color-border)] hover:border-white/20"}`}
                  >
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-20 h-20 rounded-full bg-[rgba(124,58,237,0.1)] border-4 border-[var(--color-primary)] flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">✨</span>
              </div>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-4">Your plan is ready!</h1>
              <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
                We've calculated your metabolic rate and built a personalised nutrition profile to help you hit your goals safely and sustainably.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-xl">
                  <div className="text-sm text-[var(--color-text-muted)]">Current</div>
                  <div className="text-2xl font-bold text-white">{data.currentWeightKg} kg</div>
                </div>
                <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-xl">
                  <div className="text-sm text-[var(--color-text-muted)]">Target</div>
                  <div className="text-2xl font-bold text-[var(--color-accent)]">{data.weightGoal === 'maintain' ? data.currentWeightKg : data.targetWeightKg} kg</div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold rounded-lg px-4 py-4 mt-2 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 5 ? (
              "Generate Plan & Start"
            ) : (
              "Continue"
            )}
            {!loading && step < 5 && <ArrowRight className="w-5 h-5" />}
          </button>

          {step === 1 && (
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
