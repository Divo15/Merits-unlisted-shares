"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import type { Stock } from "@/types/stock";

interface Props {
  stock: Stock;
  intention: "BUY" | "SELL";
  onClose: () => void;
}

export default function EnquiryModal({ stock, intention, onClose }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBuy = intention === "BUY";
  const accentGradient = isBuy
    ? "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)"
    : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
  const accentShadow = isBuy
    ? "0 4px 18px rgba(21,101,192,0.35)"
    : "0 4px 18px rgba(239,68,68,0.35)";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enquiry/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          stockName: stock.name,
          ticker: stock.ticker,
          intention,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Header */}
          <div className="px-5 sm:px-7 py-5 sm:py-6" style={{ background: accentGradient }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-extrabold shrink-0"
                  style={{ backgroundColor: stock.color }}
                >
                  {stock.initials}
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold tracking-widest text-white/60 uppercase">
                    {intention} Enquiry
                  </p>
                  <p className="text-white font-extrabold text-lg leading-tight">
                    {stock.name}
                  </p>
                  <p className="text-white/60 text-sm mt-0.5">
                    {stock.ticker} · ₹{stock.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-7 py-5 sm:py-6">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "rgba(240,144,32,0.10)" }}
                >
                  <CheckCircle className="w-6 h-6" style={{ color: "#F09020" }} />
                </div>
                <p className="font-extrabold text-base" style={{ color: "#0D2040" }}>
                  Enquiry Submitted!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Our team will reach out shortly.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: accentGradient, boxShadow: accentShadow }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Pills */}
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: "rgba(240,144,32,0.10)", color: "#B36000" }}>
                    {stock.sector}
                  </span>
                  <span className={`text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full ${
                    isBuy ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}>
                    {intention}
                  </span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors placeholder:text-muted-foreground/50"
                  style={{ borderColor: "#e2e8f0", color: "#0D2040" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1E88E5")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />

                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors placeholder:text-muted-foreground/50"
                  style={{ borderColor: "#e2e8f0", color: "#0D2040" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1E88E5")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />

                <input
                  type="email"
                  required
                  placeholder="Email ID"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors placeholder:text-muted-foreground/50"
                  style={{ borderColor: "#e2e8f0", color: "#0D2040" }}
                  onFocus={(e) => (e.target.style.borderColor = "#1E88E5")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />

                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: accentGradient, boxShadow: accentShadow }}
                >
                  {loading ? "Submitting…" : `Submit ${intention} Enquiry`}
                </button>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  For further enquiry:{" "}
                  <a
                    href="tel:9818829442"
                    className="text-base font-extrabold hover:underline"
                    style={{ color: "#F09020" }}
                  >
                    9818829442
                  </a>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
