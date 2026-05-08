"use client";
import { useState } from "react";
import { Search } from "lucide-react";

const TABS = [
  "All",
  "Pre-IPO",
  "DRHP Filed",
  "Fintech",
  "Tech",
  "BFSI",
  "Infrastructure",
  "Healthcare",
  "Consumer",
  "EV & Auto",
  "Top Gainers",
] as const;

interface SearchFilterProps {
  onFilter: (query: string, tab: string) => void;
}

export default function SearchFilter({ onFilter }: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");

  const update = (q: string, t: string) => {
    setQuery(q);
    setActiveTab(t);
    onFilter(q, t);
  };

  return (
    <section
      id="explore"
      className="bg-card/85 backdrop-blur-2xl border-b border-border sticky top-[96px] z-40"
      style={{ boxShadow: "0 4px 24px -8px rgba(0,0,0,0.08)" }}
      aria-label="Search and filter stocks"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Search input */}
        <div className="relative mb-3 max-w-2xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => update(e.target.value, activeTab)}
            placeholder="Search shares e.g. OYO, Groww…"
            className="w-full pl-11 pr-4 py-2.5 bg-surface/80 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 focus:bg-surface transition-all duration-200"
            aria-label="Search stocks"
          />
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5"
          role="tablist"
          aria-label="Filter by category"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => update(query, tab)}
                className="relative shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
                        color: "#ffffff",
                        borderColor: "#1565C0",
                        boxShadow: "0 2px 14px rgba(21,101,192,0.38)",
                      }
                    : {
                        background: "#ffffff",
                        color: "#4a5568",
                        borderColor: "#d1d9e6",
                      }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(21,101,192,0.06)";
                    e.currentTarget.style.borderColor = "#1565C0";
                    e.currentTarget.style.color = "#1565C0";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#d1d9e6";
                    e.currentTarget.style.color = "#4a5568";
                  }
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
