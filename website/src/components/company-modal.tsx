"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import type { Stock } from "@/types/stock";
import EnquiryModal from "@/components/enquiry-modal";

interface Props {
  stock: Stock;
  onClose: () => void;
}

const FUND_ORDER = [
  "Lot Size", "Depository", "ISIN", "PAN", "CIN", "RTA",
  "Market Cap", "P/E Ratio", "P/B Ratio", "Debt to Equity", "ROE", "Face Value",
];

export default function CompanyModal({ stock, onClose }: Props) {
  const [about, setAbout]           = useState("");
  const [fundamentals, setFunds]    = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(true);
  const [enquiry, setEnquiry]       = useState<"BUY" | "SELL" | null>(null);

  const isPositive = stock.changePct >= 0;

  useEffect(() => {
    const cachedFunds = stock.fundamentalsJson && Object.keys(stock.fundamentalsJson).length > 0;

    // If fundamentals are already stored in DB, use them instantly — no scraping needed
    if (cachedFunds && stock.description) {
      setAbout(stock.description);
      setFunds(stock.fundamentalsJson);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ name: stock.fullName });
    if (stock.fundamentalsUrl) params.set('fundamentalsUrl', stock.fundamentalsUrl);
    fetch(`/api/company-info?${params}`)
      .then(r => r.json())
      .then(d => {
        setAbout(d.about || stock.description || "");
        setFunds(cachedFunds ? stock.fundamentalsJson : (d.fundamentals || {}));
      })
      .catch(() => {
        setAbout(stock.description || "");
        if (cachedFunds) setFunds(stock.fundamentalsJson);
      })
      .finally(() => setLoading(false));
  }, [stock.fullName, stock.description, stock.fundamentalsUrl, stock.fundamentalsJson]);

  const hasFundamentals = Object.keys(fundamentals).length > 0;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            {/* Header */}
            <div className="px-5 py-4 shrink-0" style={{ background: "linear-gradient(135deg,#0D2040,#1565C0)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shrink-0"
                    style={{ backgroundColor: stock.color }}
                  >
                    {stock.initials}
                  </div>
                  <div>
                    <p className="text-white/50 text-[0.6rem] font-bold tracking-widest uppercase">
                      {stock.ticker} · {stock.sector}
                    </p>
                    <p className="text-white font-extrabold text-base leading-tight">{stock.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white text-sm font-bold">₹{stock.price.toLocaleString("en-IN")}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isPositive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? "+" : ""}{stock.changePct}%
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Price strip */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Price",    value: `₹${stock.price.toLocaleString("en-IN")}` },
                  { label: "52W High", value: `₹${stock.high52w.toLocaleString("en-IN")}` },
                  { label: "52W Low",  value: `₹${stock.low52w.toLocaleString("en-IN")}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
                    <p className="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-extrabold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">About</p>
                {loading ? (
                  <div className="space-y-2">
                    {[100, 90, 70].map(w => (
                      <div key={w} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {about || `${stock.fullName} is an Indian company operating in the ${stock.sector} sector, currently available for trading on the unlisted/pre-IPO market. Detailed company information will be added shortly.`}
                  </p>
                )}
              </div>

              {/* Fundamentals */}
              {!loading && hasFundamentals && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fundamentals</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FUND_ORDER.map(key => (
                      <div key={key} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                        <p className="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wide">{key}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5 break-all">{fundamentals[key] || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-2 flex gap-3 shrink-0 border-t border-gray-100">
              <button onClick={() => setEnquiry("BUY")}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-500 transition-all duration-200">
                BUY
              </button>
              <button onClick={() => setEnquiry("SELL")}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 transition-all duration-200">
                SELL
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {enquiry && (
        <EnquiryModal stock={stock} intention={enquiry} onClose={() => setEnquiry(null)} />
      )}
    </>
  );
}
