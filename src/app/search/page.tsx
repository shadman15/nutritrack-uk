"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search as SearchIcon, Loader2, Plus } from "lucide-react";
import { SUPERSTORE_COLORS, SUPERSTORE_LABELS } from "@/lib/food-api";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meal = searchParams.get("meal") || "snacks";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [superstore, setSuperstore] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(100);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(debouncedQuery)}${superstore ? `&superstore=${superstore}` : ''}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, superstore]);

  const handleAdd = async (food: any, quantityG: number) => {
    setAddingId(food.id || food.barcode);
    try {
      await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: food.id,
          foodData: food.id ? undefined : food, // send full data if no id
          mealType: meal,
          quantityG, 
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <header className="sticky top-0 z-30 bg-[rgba(10,10,15,0.8)] backdrop-blur-md border-b border-[var(--color-border)] p-4">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a food..."
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>

        {/* Superstore Filters */}
        <div className="max-w-2xl mx-auto mt-4 overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 px-2">
            <FilterChip label="All" active={superstore === ""} onClick={() => setSuperstore("")} />
            {Object.entries(SUPERSTORE_LABELS).map(([key, label]) => (
              <FilterChip 
                key={key} 
                label={label} 
                active={superstore === key} 
                color={SUPERSTORE_COLORS[key]}
                onClick={() => setSuperstore(key)} 
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            No foods found. Try another search or scan a barcode.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pb-24">
          {results.map((food, i) => (
            <div key={food.id || food.barcode || i} className="glass-panel flex flex-col hover:border-white/20 transition-colors overflow-hidden group">
              {/* Image Section */}
              <div className="bg-white h-36 w-full flex items-center justify-center p-3 relative">
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt={food.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <SearchIcon className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                
                {/* Store Badge */}
                {food.superstore && (
                  <span 
                    className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider uppercase text-white shadow-sm"
                    style={{ backgroundColor: SUPERSTORE_COLORS[food.superstore] || 'var(--color-primary)' }}
                  >
                    {SUPERSTORE_LABELS[food.superstore]}
                  </span>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-semibold leading-tight text-sm line-clamp-2 mb-1">{food.name}</h3>
                
                <div className="text-xs text-[var(--color-text-muted)] mb-3">
                  {food.brand ? `${food.brand} • ` : ''}100g
                </div>
                
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--color-accent)]">{Math.round(food.per100gKcal)} kcal</span>
                    <div className="text-[9px] text-[var(--color-text-muted)] flex gap-1.5 mt-0.5 uppercase tracking-wider font-medium">
                      <span>P:{Math.round(food.per100gProtein)}</span>
                      <span>C:{Math.round(food.per100gCarbs)}</span>
                      <span>F:{Math.round(food.per100gFat)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setSelectedFood(food); setQuantity(100); }}
                    disabled={addingId === (food.id || food.barcode)}
                    className="w-8 h-8 rounded-full bg-[rgba(124,58,237,0.1)] text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-50 shrink-0"
                  >
                    {addingId === (food.id || food.barcode) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-panel p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-lg mb-1">{selectedFood.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                {selectedFood.brand || selectedFood.superstore || "Generic"}
              </p>

              <div className="mb-6 flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Amount (grams)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                      className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] font-medium text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">g</span>
                  </div>
                </div>
                <div className="flex-1 bg-[rgba(255,255,255,0.02)] border border-[var(--color-border)] rounded-lg p-3 text-center">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Calories</div>
                  <div className="font-bold text-xl text-[var(--color-accent)]">
                    {Math.round((selectedFood.per100gKcal * quantity) / 100)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedFood(null)} 
                  className="flex-1 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-xl font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAdd(selectedFood, quantity)}
                  disabled={addingId === (selectedFood.id || selectedFood.barcode)}
                  className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2"
                >
                  {addingId === (selectedFood.id || selectedFood.barcode) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add to Diary"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
        active 
          ? "border-transparent text-white" 
          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-white/20 hover:text-white"
      }`}
      style={active ? { backgroundColor: color || 'var(--color-primary)' } : {}}
    >
      {label}
    </button>
  );
}
