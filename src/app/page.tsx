import Link from "next/link";
import { ArrowRight, ScanLine, Utensils, BarChart3, Star, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <span className="font-bold text-white leading-none">N</span>
          </div>
          <span className="font-[family-name:var(--font-outfit)] font-bold text-xl tracking-tight">
            NutriTrack<span className="text-[var(--color-accent)]">UK</span>
          </span>
        </div>
        <div className="flex items-center gap-4 font-medium text-sm">
          <Link href="/login" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            Log in
          </Link>
          <Link 
            href="/register" 
            className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] text-[var(--color-primary)] text-sm font-medium mb-8">
          <Star className="w-4 h-4 fill-current" />
          <span>#1 AI-Powered UK Calorie Tracker</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Smarter tracking for <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
            lasting results.
          </span>
        </h1>
        
        <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl">
          Instantly scan barcodes, search 500k+ UK superstore foods, and get daily AI coaching to hit your weight goals faster than ever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
          <Link 
            href="/register" 
            className="flex items-center justify-center gap-2 bg-[var(--color-cta)] hover:bg-[#E06413] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
          >
            Create Your Plan <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto text-left">
          <FeatureCard 
            icon={<ScanLine className="w-6 h-6 text-[var(--color-accent)]" />}
            title="Instant Barcode Scan"
            description="Use your camera to instantly log foods. Matches directly with UK packaging."
          />
          <FeatureCard 
            icon={<Utensils className="w-6 h-6 text-[var(--color-cta)]" />}
            title="500k+ UK Foods"
            description="Tesco, ASDA, Sainsbury's, ALDI, M&S. If it's in a UK store, it's in our database."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-[var(--color-primary)]" />}
            title="AI Nutrition Coach"
            description="Get daily personalised tips and diet plans generated just for you by GPT-4."
          />
        </div>
      </main>

      {/* Social Proof */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Join thousands tracking smarter</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[var(--color-text-muted)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-white">500k+</span>
              <span>Foods Logged</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-white">12k+</span>
              <span>Active Users</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-white">4.9/5</span>
              <span>App Store Rating</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 hover:border-[rgba(255,255,255,0.2)] transition-colors">
      <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}
