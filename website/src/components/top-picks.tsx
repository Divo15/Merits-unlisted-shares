"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { Stock } from "@/types/stock";
import EnquiryModal from "@/components/enquiry-modal";
import CompanyModal from "@/components/company-modal";

const CARD_DELAY_CYCLE = 4;
const DJANGO_API = process.env.NEXT_PUBLIC_DJANGO_API || "";

function resolveLogoUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/")) return `${DJANGO_API}${url}`;
  return url;
}

const SECTOR_MAP: Record<string, string[]> = {
  "BFSI":           ["financial services", "banking", "insurance", "bfsi", "finance"],
  "Tech":           ["technology", "tech", "it", "software"],
  "Fintech":        ["fintech", "financial technology"],
  "Infrastructure": ["infrastructure"],
  "Healthcare":     ["healthcare", "pharma", "pharmaceutical", "health"],
  "Consumer":       ["consumer goods", "consumer services", "consumer", "retail", "fmcg"],
  "EV & Auto":      ["automobile", "automotive", "auto", "ev", "electric vehicle"],
};

function StockCard({
  stock,
  onSelect,
  isSelected,
  index,
  onEnquire,
}: {
  stock: Stock;
  onSelect: () => void;
  isSelected: boolean;
  index: number;
  onEnquire: (intention: "BUY" | "SELL") => void;
}) {
  const isPositive = stock.changePct >= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        ease: [0, 0, 0.2, 1],
        delay: (index % CARD_DELAY_CYCLE) * 0.07,
      }}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      className={`group rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 border ${
        isSelected
          ? "border-primary/40 bg-card shadow-[0_0_0_1px_rgba(21,101,192,0.14),0_8px_24px_rgba(21,101,192,0.14)]"
          : "border-border bg-card hover:border-primary/25 hover:bg-card hover:shadow-[0_8px_24px_rgba(21,101,192,0.09)]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {stock.logoUrl ? (
            <div
              className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.15)] bg-white flex items-center justify-center"
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveLogoUrl(stock.logoUrl)}
                alt={stock.name}
                className="object-contain w-full h-full"
                onError={(e) => {
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) parent.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              style={{ backgroundColor: stock.color }}
              aria-hidden="true"
            >
              {stock.initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-foreground text-sm truncate leading-tight">
              {stock.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stock.ticker}
            </div>
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
            stock.category === "Pre-IPO"
              ? "bg-primary/10 text-primary"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {stock.category}
        </span>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-2xl font-extrabold text-foreground tracking-tight">
          ₹{stock.price.toLocaleString("en-IN")}
        </div>
        <div
          className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3 h-3" aria-hidden="true" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {stock.changePct}%
          </span>
          <span className="font-normal opacity-70 ml-0.5">
            ({isPositive ? "+" : ""}₹{Math.abs(stock.change)})
          </span>
        </div>
      </div>

      {/* 52W range */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(["High", "Low"] as const).map((kind) => (
          <div
            key={kind}
            className="bg-surface/70 border border-border rounded-xl p-2.5 text-center"
          >
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
              52W {kind}
            </div>
            <div className="text-sm font-bold text-foreground">
              ₹{(kind === "High" ? stock.high52w : stock.low52w).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      {/* Sector badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-surface text-muted-foreground px-2.5 py-1 rounded-full font-medium border border-border">
          {stock.sector}
        </span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEnquire("BUY"); }}
          className="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border border-emerald-200 hover:border-emerald-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          aria-label={`Buy ${stock.name}`}
        >
          BUY
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEnquire("SELL"); }}
          className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border border-red-200 hover:border-red-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
          aria-label={`Sell ${stock.name}`}
        >
          SELL
        </button>
      </div>
    </motion.article>
  );
}

interface TopPicksProps {
  allStocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  selectedStockId: string;
  query: string;
  filterTab: string;
}

export default function TopPicks({
  allStocks,
  onSelectStock,
  selectedStockId,
  query,
  filterTab,
}: TopPicksProps) {
  const [modal, setModal]         = useState<{ stock: Stock; intention: "BUY" | "SELL" } | null>(null);
  const [companyStock, setCompanyStock] = useState<Stock | null>(null);

  const filtered = allStocks.filter((s) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q || s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q);
    const sectorLower = s.sector.toLowerCase();
    const matchesSector = SECTOR_MAP[filterTab]
      ? SECTOR_MAP[filterTab].some(v => sectorLower.includes(v))
      : sectorLower === filterTab.toLowerCase();
    const matchesTab =
      filterTab === "All" ||
      s.category.toLowerCase() === filterTab.toLowerCase() ||
      matchesSector ||
      (filterTab === "Top Gainers" && s.changePct > 2);
    return matchesQuery && matchesTab;
  });

  return (
    <section
      id="top-picks"
      className="py-10 sm:py-16 border-b border-border"
      aria-labelledby="top-picks-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              id="top-picks-heading"
              className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight"
            >
              Top Picks in the Unlisted Market
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Click any card to view its price chart below
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/75 font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1">
            View All 180+ →
          </button>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Search className="w-10 h-10 mb-3 opacity-25" aria-hidden="true" />
            <p className="font-medium text-foreground">No stocks match your search</p>
            <p className="text-sm mt-1 opacity-70">Try a different name or category</p>
          </motion.div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            role="listbox"
            aria-label="Available stocks"
          >
            {filtered.map((stock, i) => (
              <StockCard
                key={stock.id}
                stock={stock}
                onSelect={() => setCompanyStock(stock)}
                isSelected={stock.id === selectedStockId}
                index={i}
                onEnquire={(intention) => setModal({ stock, intention })}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <EnquiryModal
          stock={modal.stock}
          intention={modal.intention}
          onClose={() => setModal(null)}
        />
      )}

      {companyStock && (
        <CompanyModal
          stock={companyStock}
          onClose={() => setCompanyStock(null)}
        />
      )}
    </section>
  );
}
