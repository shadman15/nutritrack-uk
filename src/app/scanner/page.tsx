"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, X, Plus } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [foodData, setFoodData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(100);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    startScanner();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setError("");
      // Using facingMode: environment to force rear camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        readerRef.current?.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            handleScan(result.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied or unavailable.");
    }
  };

  const handleScan = async (code: string) => {
    if (scannedCode) return; // Prevent double scan
    setScannedCode(code);
    
    // Stop scanning once we get a code
    if (readerRef.current) {
      readerRef.current.reset();
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/foods/barcode/${code}`);
      const data = await res.json();
      
      if (res.ok && data.food) {
        setFoodData(data.food);
      } else {
        setError("Product not found in database.");
      }
    } catch (err) {
      setError("Failed to lookup barcode.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!foodData) return;
    setAdding(true);
    try {
      await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: foodData.id,
          foodData: foodData.id ? undefined : foodData,
          mealType: "snacks",
          quantityG: quantity, 
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setAdding(false);
    }
  };

  const resetScanner = () => {
    setScannedCode(null);
    setFoodData(null);
    setError("");
    startScanner();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-30 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => router.back()} className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-white shadow-sm">Scan Barcode</span>
        <div className="w-10"></div>
      </header>

      {/* Scanner View */}
      {!foodData && !error && (
        <div className="flex-1 relative flex items-center justify-center">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Overlay mask */}
          <div className="absolute inset-0 z-10 box-border border-[100px] border-black/50 w-full h-full pointer-events-none"></div>
          
          {/* Scanning reticle */}
          <div className="relative z-20 w-64 h-48 border-2 border-[var(--color-accent)] rounded-lg flex items-center justify-center">
            <div className="absolute w-full h-0.5 bg-[var(--color-accent)] animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
          </div>
          
          <div className="absolute bottom-12 z-20 text-white/80 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm text-sm">
            Align barcode within the frame
          </div>

          {loading && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent)] mb-4" />
              <p className="font-medium">Looking up product...</p>
            </div>
          )}
        </div>
      )}

      {/* Result Card */}
      {(foodData || error) && (
        <div className="flex-1 flex flex-col p-6 items-center justify-center bg-[var(--color-background)] z-40">
          
          {error ? (
            <div className="glass-panel p-8 w-full max-w-sm text-center flex flex-col items-center gap-4 border-red-500/30">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <X className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Not Found</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-4">{error}</p>
              
              <button onClick={resetScanner} className="w-full py-3 bg-[rgba(255,255,255,0.1)] rounded-lg font-medium hover:bg-[rgba(255,255,255,0.15)] transition-colors">
                Scan Again
              </button>
            </div>
          ) : (
            <div className="glass-panel w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
              {foodData.imageUrl && (
                <div className="w-full h-48 bg-white flex items-center justify-center p-4">
                  <img src={foodData.imageUrl} alt={foodData.name} className="max-h-full max-w-full object-contain" />
                </div>
              )}
              
              <div className="p-6">
                <div className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-semibold">
                  {foodData.brand || foodData.superstore || 'Product'}
                </div>
                <h2 className="text-xl font-bold mb-4 leading-tight">{foodData.name}</h2>
                
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
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">Total Calories</div>
                    <div className="font-bold text-xl text-[var(--color-accent)]">
                      {Math.round((foodData.per100gKcal * quantity) / 100)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={resetScanner} className="flex-1 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-xl font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={handleAdd}
                    disabled={adding}
                    className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2"
                  >
                    {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
