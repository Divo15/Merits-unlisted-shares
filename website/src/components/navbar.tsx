"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, TrendingUp, Phone, Mail, Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Stock } from "@/types/stock";
import { useAuth } from "@/context/AuthContext";
import { getPortfolio } from "@/lib/auth";

const CONTACT_PHONE = "+91-98103 11446";
const CONTACT_EMAIL = "info@merits.in";
const TOP_BG        = "#F09020";
const NAV_TEXT      = "#0D2040";
const MAIN_TEXT     = "#0D2040";

const NAV_ITEMS = [
  ["Explore",              "#explore"],
  ["About Us",             "#about-us"],
  ["Merits Capital Group", "https://merits.in/"],
  ["Merits PE",            "https://meritspe.com/"],
  ["Contact Us",           "#contact"],
] as const;

interface Holding {
  id: number;
  stock_name: string;
  ticker: string;
  quantity: string;
  purchase_price: string;
  purchase_date: string;
  current_price: number | null;
  unrealized_pnl: number | null;
  pct_return: number | null;
}

function fmt(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

interface NavbarProps {
  query: string;
  onSearch: (q: string) => void;
  stocks: Stock[];
}

export default function Navbar({ query, onSearch, stocks }: NavbarProps) {
  const { isAuthenticated, accessToken } = useAuth();

  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [localQ, setLocalQ]     = useState(query);
  const [suggestions, setSuggestions] = useState<Stock[]>([]);
  const [showDrop, setShowDrop] = useState(false);

  const [showPortfolio, setShowPortfolio]   = useState(false);
  const [holdings, setHoldings]             = useState<Holding[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [holdingsFetched, setHoldingsFetched] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalQ(query); }, [query]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch holdings when panel first opens
  useEffect(() => {
    if (!showPortfolio || holdingsFetched || !accessToken) return;
    setHoldingsLoading(true);
    getPortfolio(accessToken)
      .then((data) => setHoldings(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => { setHoldingsLoading(false); setHoldingsFetched(true); });
  }, [showPortfolio, holdingsFetched, accessToken]);

  const handleInput = (val: string) => {
    setLocalQ(val);
    onSearch(val);
    if (val.trim().length > 0) {
      const q = val.toLowerCase();
      setSuggestions(
        stocks
          .filter((s) => s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q))
          .slice(0, 6)
      );
      setShowDrop(true);
    } else {
      setSuggestions([]);
      setShowDrop(false);
    }
  };

  const selectSuggestion = (s: Stock) => {
    setLocalQ(s.name);
    onSearch(s.name);
    setShowDrop(false);
  };

  const clearSearch = () => {
    setLocalQ("");
    onSearch("");
    setShowDrop(false);
  };

  const togglePortfolio = () => {
    setShowPortfolio((prev) => !prev);
    setOpen(false);
  };

  const navLinkStyle = (active = false) => ({
    color: active ? "#F09020" : MAIN_TEXT,
    background: active ? "rgba(240,144,32,0.08)" : "transparent",
  });

  const navHoverOn  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = "rgba(240,144,32,0.08)"; e.currentTarget.style.color = "#F09020"; };
  const navHoverOff = (e: React.MouseEvent<HTMLElement>, active = false) => { e.currentTarget.style.background = active ? "rgba(240,144,32,0.08)" : "transparent"; e.currentTarget.style.color = active ? "#F09020" : MAIN_TEXT; };

  const mainShadow = scrolled ? "0 4px 24px rgba(0,0,0,0.10)" : "0 1px 0 rgba(0,0,0,0.06)";
  const navLinkCls = "relative px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group";

  return (
    <header className="sticky top-0 z-50" role="banner">

      {/* ── Orange contact strip ── */}
      <div style={{ background: TOP_BG }}>
        <div className="border-b" style={{ borderColor: "rgba(13,32,64,0.12)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-[0.7rem] font-semibold" style={{ color: NAV_TEXT }}>
            <div className="flex items-center gap-5">
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded" aria-label={`Call ${CONTACT_PHONE}`}>
                <Phone className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hidden sm:flex items-center gap-1.5 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded" aria-label={`Email ${CONTACT_EMAIL}`}>
                <Mail className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
            </div>
            <p className="hidden md:block uppercase tracking-widest opacity-65 text-[0.62rem]">
              India&apos;s Trusted Pre-IPO Platform
            </p>
          </div>
        </div>
      </div>

      {/* ── Main nav ── */}
      <div className="bg-white transition-shadow duration-300" style={{ borderTopLeftRadius: "22px", boxShadow: mainShadow }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="UnlistedMerits home">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)", boxShadow: "0 2px 8px rgba(21,101,192,0.3)" }}>
                <TrendingUp className="w-4.5 h-4.5 text-white" aria-hidden="true" />
              </div>
              <div className="leading-none">
                <p className="text-[0.95rem] font-extrabold tracking-tight" style={{ color: MAIN_TEXT }}>
                  Unlisted <span style={{ color: "#F09020" }}>Merits</span>
                </p>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0.5" role="menubar">
              {/* Explore */}
              <a
                href="#explore"
                role="menuitem"
                className={navLinkCls}
                style={navLinkStyle()}
                onMouseEnter={navHoverOn}
                onMouseLeave={(e) => navHoverOff(e)}
              >
                Explore
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full transition-all duration-200 group-hover:w-3/5" style={{ background: "#F09020" }} aria-hidden="true" />
              </a>

              {/* Portfolio — authenticated users only */}
              {isAuthenticated && (
                <button
                  role="menuitem"
                  onClick={togglePortfolio}
                  aria-expanded={showPortfolio}
                  className={`${navLinkCls} flex items-center gap-1`}
                  style={navLinkStyle(showPortfolio)}
                  onMouseEnter={(e) => { if (!showPortfolio) navHoverOn(e); }}
                  onMouseLeave={(e) => { if (!showPortfolio) navHoverOff(e); }}
                >
                  Portfolio
                  {showPortfolio
                    ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full transition-all duration-200 group-hover:w-3/5" style={{ background: "#F09020" }} aria-hidden="true" />
                </button>
              )}

              {/* About Us, Merits Capital Group, Merits PE, Contact Us */}
              {NAV_ITEMS.slice(1).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  role="menuitem"
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={navLinkCls}
                  style={navLinkStyle()}
                  onMouseEnter={navHoverOn}
                  onMouseLeave={(e) => navHoverOff(e)}
                >
                  {label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full transition-all duration-200 group-hover:w-3/5" style={{ background: "#F09020" }} aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* ── Desktop search bar ── */}
            <div ref={searchRef} className="hidden lg:block relative flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#9ca3af" }} aria-hidden="true" />
                <input
                  type="search"
                  value={localQ}
                  onChange={(e) => handleInput(e.target.value)}
                  placeholder="Search companies…"
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border outline-none transition-all duration-200"
                  style={{
                    borderColor: localQ ? "#1E88E5" : "#e2e8f0",
                    background: "#f8fafc",
                    color: MAIN_TEXT,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#1E88E5"; e.target.style.background = "#fff"; if (suggestions.length) setShowDrop(true); }}
                  onBlur={(e) => { e.target.style.borderColor = localQ ? "#1E88E5" : "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                  aria-label="Search companies"
                  aria-autocomplete="list"
                  aria-expanded={showDrop}
                />
                {localQ && (
                  <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showDrop && suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border overflow-hidden z-50"
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                    role="listbox"
                  >
                    {suggestions.map((s) => (
                      <li key={s.id}>
                        <button
                          onMouseDown={() => selectSuggestion(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary/[0.05] transition-colors duration-100"
                          role="option"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[0.6rem] font-extrabold shrink-0" style={{ backgroundColor: s.color }}>
                            {s.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                            <p className="text-[0.65rem] text-muted-foreground">{s.ticker}</p>
                          </div>
                          <span className={`ml-auto text-xs font-bold ${s.changePct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {s.changePct >= 0 ? "+" : ""}{s.changePct}%
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link href="/signup" className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" style={{ background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)", boxShadow: "0 2px 16px rgba(21,101,192,0.45)" }}>
                Partner with Us
              </Link>
              <a href="#explore" className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" style={{ background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)", boxShadow: "0 2px 16px rgba(21,101,192,0.45)" }}>
                Start Investing
              </a>
            </div>

            {/* Mobile burger */}
            <button
              className="lg:hidden p-2 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{ color: MAIN_TEXT }}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="block">
                    <X className="w-5 h-5" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="block">
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

          </div>
        </nav>

        {/* ── Portfolio panel ── */}
        <AnimatePresence>
          {showPortfolio && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold" style={{ color: MAIN_TEXT }}>My Portfolio</h2>
                  <button
                    onClick={() => setShowPortfolio(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close portfolio"
                  >
                    <X className="w-4 h-4" style={{ color: MAIN_TEXT }} />
                  </button>
                </div>

                {holdingsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#1E88E5" }} />
                  </div>
                ) : holdings.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: "#6b7280" }}>No holdings yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>Stock</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>Qty</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>Buy Price</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>Current</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>P&amp;L</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>% Return</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: MAIN_TEXT }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((h) => {
                          const pos = h.unrealized_pnl !== null && h.unrealized_pnl >= 0;
                          const clr = h.unrealized_pnl === null ? "#6b7280" : pos ? "#16a34a" : "#dc2626";
                          return (
                            <tr key={h.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-semibold" style={{ color: MAIN_TEXT }}>{h.stock_name}</span>
                                <span className="ml-1.5 text-xs" style={{ color: "#6b7280" }}>{h.ticker}</span>
                              </td>
                              <td className="px-4 py-3 text-right" style={{ color: MAIN_TEXT }}>{parseFloat(h.quantity).toLocaleString("en-IN")}</td>
                              <td className="px-4 py-3 text-right" style={{ color: MAIN_TEXT }}>₹{fmt(parseFloat(h.purchase_price))}</td>
                              <td className="px-4 py-3 text-right" style={{ color: MAIN_TEXT }}>{h.current_price !== null ? `₹${fmt(h.current_price)}` : "—"}</td>
                              <td className="px-4 py-3 text-right font-medium" style={{ color: clr }}>
                                {h.unrealized_pnl !== null ? `${pos ? "+" : ""}₹${fmt(h.unrealized_pnl)}` : "—"}
                              </td>
                              <td className="px-4 py-3 text-right font-medium" style={{ color: clr }}>
                                {h.pct_return !== null ? `${pos ? "+" : ""}${fmt(h.pct_return)}%` : "—"}
                              </td>
                              <td className="px-4 py-3 text-right text-xs" style={{ color: "#6b7280" }}>{h.purchase_date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden border-t border-border"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

                {/* Mobile search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" aria-hidden="true" />
                  <input
                    type="search"
                    value={localQ}
                    onChange={(e) => handleInput(e.target.value)}
                    placeholder="Search companies…"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all duration-200"
                    aria-label="Search companies"
                  />
                  {localQ && (
                    <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Mobile suggestions */}
                {suggestions.length > 0 && localQ && (
                  <ul className="mb-2 rounded-xl border border-border overflow-hidden bg-white" role="listbox">
                    {suggestions.map((s) => (
                      <li key={s.id}>
                        <button
                          onMouseDown={() => { selectSuggestion(s); setOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/[0.05] transition-colors text-left"
                          role="option"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[0.6rem] font-extrabold shrink-0" style={{ backgroundColor: s.color }}>
                            {s.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                            <p className="text-[0.65rem] text-muted-foreground">{s.ticker}</p>
                          </div>
                          <span className={`ml-auto text-xs font-bold ${s.changePct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {s.changePct >= 0 ? "+" : ""}{s.changePct}%
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Explore */}
                <motion.a
                  href="#explore"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0, duration: 0.18 }}
                  className="block px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  style={{ color: MAIN_TEXT }}
                  onMouseEnter={navHoverOn}
                  onMouseLeave={(e) => navHoverOff(e)}
                  onClick={() => setOpen(false)}
                >
                  Explore
                </motion.a>

                {/* Portfolio (mobile — authenticated only) */}
                {isAuthenticated && (
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05, duration: 0.18 }}
                    onClick={togglePortfolio}
                    className="w-full flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    style={navLinkStyle(showPortfolio)}
                    onMouseEnter={navHoverOn}
                    onMouseLeave={(e) => navHoverOff(e, showPortfolio)}
                  >
                    Portfolio
                    {showPortfolio
                      ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
                  </motion.button>
                )}

                {/* About Us, Merits Capital Group, Merits PE, Contact Us */}
                {NAV_ITEMS.slice(1).map(([label, href], i) => (
                  <motion.a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (i + (isAuthenticated ? 2 : 1)) * 0.05, duration: 0.18 }}
                    className="block px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    style={{ color: MAIN_TEXT }}
                    onMouseEnter={navHoverOn}
                    onMouseLeave={(e) => navHoverOff(e)}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </motion.a>
                ))}

                <Link href="/signup">
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: NAV_ITEMS.length * 0.05 + 0.05, duration: 0.18 }}
                    className="block mt-3 text-center px-5 py-3 rounded-lg text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    style={{ background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)", boxShadow: "0 2px 12px rgba(21,101,192,0.40)" }}
                    onClick={() => setOpen(false)}
                  >
                    Partner with Us
                  </motion.span>
                </Link>
                <motion.a
                  href="#explore"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_ITEMS.length * 0.05 + 0.1, duration: 0.18 }}
                  className="block mt-2 text-center px-5 py-3 rounded-lg text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  style={{ background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)", boxShadow: "0 2px 12px rgba(21,101,192,0.40)" }}
                  onClick={() => setOpen(false)}
                >
                  Start Investing
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
