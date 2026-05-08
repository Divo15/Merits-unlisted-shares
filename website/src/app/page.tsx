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
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading stocks…
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
