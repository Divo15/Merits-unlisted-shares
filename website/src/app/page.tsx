"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const sk =
    "relative overflow-hidden bg-slate-200/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent";
  const sb = (px: number) => ({ width: `${px}px` });

  return (
    <>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <Navbar query={query} onSearch={handleNavSearch} stocks={stocks} />
      <main>
        <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Hero skeleton — matches real Hero layout (pt-10/16/24, max-w-7xl, 2-col grid on lg) */}
            <section className="relative overflow-hidden">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[120px]" style={{ background: "rgba(21,101,192,0.13)" }} />
                <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full blur-[100px]" style={{ background: "rgba(21,101,192,0.10)" }} />
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[90px]" style={{ background: "rgba(240,144,32,0.08)" }} />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 sm:pt-16 sm:pb-12 lg:pt-24 lg:pb-16">
                <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-0 lg:items-start">
                  <div>
                    {/* Eyebrow */}
                    <div className={`inline-flex rounded-full h-8 mb-8 ${sk}`} style={{ ...sb(248), backgroundColor: "rgba(240,144,32,0.22)" }} />
                    {/* Headline — matches real h1 line-height 0.95 exactly */}
                    <div className="space-y-1">
                      <div className={`h-9 sm:h-11 md:h-[57px] xl:h-[65px] rounded-md ${sk}`} style={sb(200)} />
                      <div className={`h-9 sm:h-11 md:h-[57px] xl:h-[65px] rounded-md ${sk}`} style={sb(300)} />
                      <div className={`h-9 sm:h-11 md:h-[57px] xl:h-[65px] rounded-md ${sk}`} style={sb(420)} />
                    </div>
                    {/* Subtitle — mt-7, max-w-lg, 2 lines */}
                    <div className="mt-7 space-y-2 max-w-lg">
                      <div className={`h-4 w-full rounded ${sk}`} />
                      <div className={`h-4 w-4/5 rounded ${sk}`} />
                      <div className={`h-4 w-3/5 rounded ${sk}`} />
                    </div>
                    {/* CTAs — mt-10 */}
                    <div className="mt-10 flex flex-wrap gap-3">
                      <div className={`h-11 rounded-lg ${sk}`} style={{ ...sb(168), backgroundColor: "rgba(240,144,32,0.3)" }} />
                      <div className={`h-11 rounded-lg ${sk}`} style={{ ...sb(184), backgroundColor: "rgba(21,101,192,0.28)" }} />
                    </div>
                    {/* Trust badges — mt-8 */}
                    <div className="mt-8 flex flex-wrap gap-2">
                      {[148, 132, 132].map((w, i) => (
                        <div key={i} className={`h-6 rounded-full border border-border ${sk}`} style={sb(w)} />
                      ))}
                    </div>
                    {/* Featured deal bar — mt-10 */}
                    <div className="mt-10 rounded-xl border border-accent/25 p-4 sm:p-5" style={{ background: "rgba(240,144,32,0.04)" }}>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`h-6 rounded-full ${sk}`} style={{ ...sb(104), backgroundColor: "rgba(240,144,32,0.18)" }} />
                        <div className={`h-4 rounded flex-1 ${sk}`} style={{ minWidth: 200 }} />
                      </div>
                      <div className={`mt-1.5 h-3 w-2/3 rounded ${sk}`} />
                    </div>
                  </div>
                  {/* Right column — news banner placeholder, only on lg */}
                  <div className="hidden lg:flex flex-col gap-4 mt-8 lg:mt-0 lg:pt-36 lg:-ml-16">
                    <div className={`h-32 rounded-xl border border-border ${sk}`} />
                  </div>
                </div>
                {/* 3-stat strip — mt-10 */}
                <div className="mt-10 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`rounded-xl h-[72px] ${sk}`} style={{ backgroundColor: "rgba(21,101,192,0.18)" }} />
                  ))}
                </div>
              </div>
            </section>

            {/* Real SearchFilter — keep it visible, it doesn't need stocks */}
            <SearchFilter onFilter={handleFilter} />

            {/* TopPicks skeleton — matches real layout (py-10/16, max-w-7xl, heading flex, 4-col grid gap-4) */}
            <section className="py-10 sm:py-16 border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div className="space-y-2">
                    <div className={`h-8 md:h-9 rounded-md ${sk}`} style={sb(360)} />
                    <div className={`h-4 rounded ${sk}`} style={sb(280)} />
                  </div>
                  <div className={`hidden sm:block h-5 rounded ${sk}`} style={sb(112)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <article
                      key={i}
                      className="rounded-2xl p-4 sm:p-5 border border-border bg-card"
                    >
                      {/* Header row — matches StockCard */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl shrink-0 ${sk}`} />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className={`h-4 w-4/5 rounded ${sk}`} />
                            <div className={`h-3 w-1/2 rounded ${sk}`} />
                          </div>
                        </div>
                        <div className={`h-5 rounded-full shrink-0 ${sk}`} style={{ ...sb(56), backgroundColor: "rgba(21,101,192,0.12)" }} />
                      </div>
                      {/* Price block — mb-4 */}
                      <div className="mb-4">
                        <div className={`h-8 rounded-md ${sk}`} style={sb(132)} />
                        <div className={`mt-1.5 h-6 rounded-full ${sk}`} style={{ ...sb(120), backgroundColor: "rgba(16,185,129,0.14)" }} />
                      </div>
                      {/* 52W grid — mb-4 */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {[0, 1].map((j) => (
                          <div key={j} className="bg-surface/70 border border-border rounded-xl p-2.5 space-y-1">
                            <div className={`h-2.5 mx-auto rounded ${sk}`} style={sb(40)} />
                            <div className={`h-4 mx-auto rounded ${sk}`} style={sb(56)} />
                          </div>
                        ))}
                      </div>
                      {/* Sector pill — mb-3 */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`h-6 rounded-full border border-border ${sk}`} style={sb(88)} />
                      </div>
                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`h-10 rounded-xl border border-emerald-200 ${sk}`} style={{ backgroundColor: "rgba(16,185,129,0.10)" }} />
                        <div className={`h-10 rounded-xl border border-red-200 ${sk}`} style={{ backgroundColor: "rgba(239,68,68,0.10)" }} />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
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
          </motion.div>
        )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
