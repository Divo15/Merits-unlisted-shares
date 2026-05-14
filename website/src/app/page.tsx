"use client";
import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import SearchFilter from "@/components/search-filter";
import TopPicks from "@/components/top-picks";
import Merits from "@/components/merits";
import AboutUs from "@/components/about-us";
import Community from "@/components/community";
import Footer from "@/components/footer";
import type { Stock } from "@/types/stock";

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [query, setQuery] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stocks/")
      .then((res) => res.json())
      .then((data) => {
        const list: Stock[] = Array.isArray(data) ? data : [];
        setStocks(list);
        setSelectedStock(list[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = useCallback((q: string, tab: string) => {
    setQuery(q);
    setFilterTab(tab);
  }, []);

  const handleNavSearch = useCallback((q: string) => {
    setQuery(q);
    setFilterTab("All");
    if (q) {
      setTimeout(() => {
        document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, []);

  if (loading) {
    const sk =
      "relative overflow-hidden bg-slate-200/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent";
    const sb = (px: number) => ({ width: `${px}px` });
    return (
      <div className="min-h-screen bg-background">
        <style>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
          @keyframes float-in { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
          .sk-stagger > * { animation: float-in 0.5s ease-out backwards; }
          .sk-stagger > *:nth-child(1) { animation-delay: 0.00s; }
          .sk-stagger > *:nth-child(2) { animation-delay: 0.06s; }
          .sk-stagger > *:nth-child(3) { animation-delay: 0.12s; }
          .sk-stagger > *:nth-child(4) { animation-delay: 0.18s; }
          .sk-stagger > *:nth-child(5) { animation-delay: 0.24s; }
          .sk-stagger > *:nth-child(6) { animation-delay: 0.30s; }
          .sk-stagger > *:nth-child(7) { animation-delay: 0.36s; }
          .sk-stagger > *:nth-child(8) { animation-delay: 0.42s; }
        `}</style>

        {/* Brand top bar */}
        <div className="h-9 w-full flex items-center justify-end px-6 gap-4" style={{ background: "linear-gradient(90deg,#F09020,#E87A00)" }}>
          <div className="h-3 w-32 rounded bg-white/30" />
          <div className="h-3 w-24 rounded bg-white/30" />
        </div>

        {/* Navbar */}
        <div className="h-16 border-b border-border bg-card flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-lg ${sk}`} />
              <div className={`h-6 rounded-md ${sk}`} style={sb(112)} />
            </div>
            <div className="hidden md:flex gap-7 items-center">
              {[56, 64, 48, 72, 56].map((w, i) => (
                <div key={i} className={`h-3.5 rounded ${sk}`} style={sb(w)} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-9 w-9 rounded-full ${sk}`} />
              <div className={`h-9 rounded-lg ${sk}`} style={sb(96)} />
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,144,32,0.08),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(21,101,192,0.06),transparent_50%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="max-w-3xl sk-stagger">
              <div className={`h-7 rounded-full mb-6 ${sk}`} style={{ ...sb(160), backgroundColor: "rgba(240,144,32,0.18)" }} />
              <div className="space-y-3 mb-6">
                <div className={`h-11 sm:h-14 w-full rounded-lg ${sk}`} />
                <div className={`h-11 sm:h-14 w-11/12 rounded-lg ${sk}`} />
                <div className={`h-11 sm:h-14 w-3/5 rounded-lg ${sk}`} />
              </div>
              <div className="space-y-2.5 mb-7">
                <div className={`h-4 w-4/5 rounded ${sk}`} />
                <div className={`h-4 w-3/5 rounded ${sk}`} />
              </div>
              <div className="flex flex-wrap gap-3 mb-5">
                <div className={`h-12 rounded-xl ${sk}`} style={{ ...sb(176), backgroundColor: "rgba(240,144,32,0.25)" }} />
                <div className={`h-12 rounded-xl border border-slate-200 ${sk}`} style={sb(176)} />
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {[120, 140, 128].map((w, i) => (
                  <div key={i} className={`h-7 rounded-full ${sk}`} style={sb(w)} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6 max-w-2xl border-t border-slate-200/70 pt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className={`h-8 rounded ${sk}`} style={sb(88)} />
                    <div className={`h-3 rounded ${sk}`} style={sb(112)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search & filter bar */}
        <div className="border-y border-border bg-card/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <div className={`h-11 w-full max-w-2xl rounded-xl border border-slate-200 ${sk}`} />
            <div className="flex gap-2 overflow-hidden">
              {[64, 80, 56, 96, 72, 88, 76, 84].map((w, i) => (
                <div key={i} className={`h-9 rounded-full shrink-0 ${sk}`} style={sb(w)} />
              ))}
            </div>
          </div>
        </div>

        {/* Top picks */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <div className={`h-8 rounded-lg ${sk}`} style={sb(320)} />
              <div className={`h-4 rounded ${sk}`} style={sb(256)} />
            </div>
            <div className={`hidden sm:block h-5 rounded ${sk}`} style={sb(112)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sk-stagger">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 sm:p-5 border border-border bg-card shadow-[0_1px_3px_rgba(13,32,64,0.04)]"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-xl shrink-0 ${sk}`} />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className={`h-4 w-3/4 rounded ${sk}`} />
                      <div className={`h-3 w-1/2 rounded ${sk}`} />
                    </div>
                  </div>
                  <div className={`h-5 rounded-full ${sk}`} style={sb(56)} />
                </div>
                <div className="mb-4 space-y-2">
                  <div className={`h-8 rounded-md ${sk}`} style={sb(128)} />
                  <div className={`h-6 rounded-full ${sk}`} style={{ ...sb(112), backgroundColor: "rgba(16,185,129,0.12)" }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[0, 1].map((j) => (
                    <div key={j} className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 space-y-1.5">
                      <div className={`h-2.5 mx-auto rounded ${sk}`} style={sb(48)} />
                      <div className={`h-4 mx-auto rounded ${sk}`} style={sb(64)} />
                    </div>
                  ))}
                </div>
                <div className={`h-6 rounded-full mb-3 ${sk}`} style={sb(88)} />
                <div className="grid grid-cols-2 gap-2">
                  <div className={`h-11 rounded-xl ${sk}`} style={{ backgroundColor: "rgba(16,185,129,0.14)" }} />
                  <div className={`h-11 rounded-xl ${sk}`} style={{ backgroundColor: "rgba(239,68,68,0.14)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar query={query} onSearch={handleNavSearch} stocks={stocks} />
      <main>
        {selectedStock && <Hero stock={selectedStock} />}
        <SearchFilter onFilter={handleFilter} />
        <TopPicks
          allStocks={stocks}
          onSelectStock={setSelectedStock}
          selectedStockId={selectedStock?.id ?? ""}
          query={query}
          filterTab={filterTab}
        />
        <Merits />
        <AboutUs />
        <Community />
      </main>
      <Footer />
    </>
  );
}
