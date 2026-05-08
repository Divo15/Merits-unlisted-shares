"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPortfolio } from "@/lib/auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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

function fmtINR(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#1E88E5","#F09020","#22c55e","#8b5cf6","#ec4899","#0D2040"];

export default function PortfolioPage() {
  const { isAuthenticated, loading, accessToken } = useAuth();
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    getPortfolio(accessToken)
      .then((data) => setHoldings(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [isAuthenticated, accessToken]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1E88E5" }} />
      </div>
    );
  }

  const totalInvested    = holdings.reduce((s, h) => s + parseFloat(h.purchase_price) * parseFloat(h.quantity), 0);
  const totalCurrent     = holdings.reduce((s, h) => s + (h.current_price ?? parseFloat(h.purchase_price)) * parseFloat(h.quantity), 0);
  const totalPnl         = holdings.reduce((s, h) => s + (h.unrealized_pnl ?? 0), 0);
  const totalPnlPositive = totalPnl >= 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar query="" onSearch={() => {}} stocks={[]} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 space-y-5">

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Invested",      value: `₹${fmtINR(totalInvested)}`,  sub: "Total cost basis" },
            { label: "Current Value", value: `₹${fmtINR(totalCurrent)}`,   sub: "At last price" },
            { label: "Unrealized P&L",
              value: `${totalPnlPositive ? "+" : ""}₹${fmtINR(Math.abs(totalPnl))}`,
              sub: `${totalPnlPositive ? "+" : ""}${((totalPnl / totalInvested) * 100).toFixed(2)}% overall`,
              accent: totalPnlPositive },
          ].map(({ label, value, sub, accent }) => (
            <div
              key={label}
              className="rounded-xl px-4 py-3.5"
              style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(30,136,229,0.18)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 2px 12px rgba(13,32,64,0.07)",
              }}
            >
              <p className="text-[0.65rem] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(13,32,64,0.45)" }}>{label}</p>
              <p
                className="text-base font-extrabold tracking-tight"
                style={{
                  color: accent === true ? "#16a34a" : accent === false ? "#dc2626" : "#0D2040",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </p>
              <p className="text-[0.65rem] mt-0.5 font-medium" style={{ color: "rgba(13,32,64,0.4)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Holdings card ── */}
        <div
          className="overflow-hidden rounded-xl"
          style={{
            background: "rgba(255,255,255,0.80)",
            border: "1px solid rgba(30,136,229,0.22)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 24px rgba(13,32,64,0.09)",
          }}
        >
          {/* Orange top accent */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #F09020 0%, #FFB74D 50%, #F09020 100%)" }} />

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              background: "linear-gradient(90deg, #F09020 0%, #E87A00 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D2040]" style={{ boxShadow: "0 0 5px rgba(13,32,64,0.5)" }} />
              <span className="text-[0.65rem] font-extrabold tracking-[0.2em] uppercase text-[#0D2040]">My Holdings</span>
            </div>
            <span className="text-[0.58rem] font-black tracking-widest px-2 py-0.5 rounded-sm" style={{ background: "#0D2040", color: "#fff" }}>
              {holdings.length} STOCK{holdings.length !== 1 ? "S" : ""}
            </span>
          </div>

          {/* Table */}
          {holdings.length === 0 ? (
            <p className="text-sm text-center py-16" style={{ color: "rgba(13,32,64,0.35)" }}>No holdings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(30,136,229,0.15)", background: "rgba(30,136,229,0.05)" }}>
                    {[
                      { label: "Stock",          align: "left"  },
                      { label: "Qty",            align: "right" },
                      { label: "Buy",            align: "right" },
                      { label: "Current",        align: "right" },
                      { label: "P&L",            align: "right" },
                      { label: "Return",         align: "right" },
                      { label: "Date",           align: "right" },
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className={`px-3 py-2.5 text-[0.65rem] font-bold tracking-wider uppercase whitespace-nowrap text-${align}`}
                        style={{ color: "rgba(13,32,64,0.5)" }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const pos   = h.unrealized_pnl !== null && h.unrealized_pnl >= 0;
                    const clr   = h.unrealized_pnl === null ? "rgba(13,32,64,0.4)" : pos ? "#16a34a" : "#dc2626";
                    const Icon  = h.unrealized_pnl === null ? Minus : pos ? TrendingUp : TrendingDown;
                    const color = AVATAR_COLORS[holdings.indexOf(h) % AVATAR_COLORS.length];

                    return (
                      <tr
                        key={h.id}
                        className="transition-colors duration-150 cursor-default"
                        style={{ borderBottom: "1px solid rgba(30,136,229,0.10)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(30,136,229,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Stock */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[0.55rem] font-extrabold shrink-0"
                              style={{ background: color }}
                            >
                              {initials(h.stock_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs leading-tight truncate" style={{ color: "#0D2040" }}>{h.stock_name}</p>
                              <p className="text-[0.6rem] font-bold mt-0.5" style={{ color: "rgba(13,32,64,0.4)" }}>{h.ticker}</p>
                            </div>
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-3 text-right text-xs font-medium" style={{ color: "#0D2040" }}>
                          {parseFloat(h.quantity).toLocaleString("en-IN")}
                        </td>

                        {/* Buy price */}
                        <td className="px-3 py-3 text-right text-xs" style={{ color: "rgba(13,32,64,0.6)" }}>
                          ₹{fmtINR(parseFloat(h.purchase_price))}
                        </td>

                        {/* Current price */}
                        <td className="px-3 py-3 text-right text-xs font-semibold" style={{ color: "#0D2040" }}>
                          {h.current_price !== null ? `₹${fmtINR(h.current_price)}` : "—"}
                        </td>

                        {/* P&L */}
                        <td className="px-3 py-3 text-right">
                          <span className="inline-flex items-center justify-end gap-1 text-xs font-bold" style={{ color: clr }}>
                            <Icon className="w-3 h-3 shrink-0" />
                            {h.unrealized_pnl !== null ? `₹${fmtINR(Math.abs(h.unrealized_pnl))}` : "—"}
                          </span>
                        </td>

                        {/* % Return */}
                        <td className="px-3 py-3 text-right">
                          {h.pct_return !== null ? (
                            <span
                              className="inline-block text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded-md"
                              style={{
                                color: clr,
                                background: pos ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
                              }}
                            >
                              {pos ? "+" : ""}{h.pct_return.toFixed(2)}%
                            </span>
                          ) : "—"}
                        </td>

                        {/* Date */}
                        <td className="px-3 py-3 text-right text-[0.65rem] whitespace-nowrap" style={{ color: "rgba(13,32,64,0.4)", minWidth: "88px" }}>
                          {h.purchase_date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-2.5"
            style={{ background: "rgba(30,136,229,0.05)", borderTop: "1px solid rgba(30,136,229,0.12)" }}
          >
            <span className="text-[0.6rem] font-semibold tracking-wide" style={{ color: "rgba(13,32,64,0.35)" }}>
              P&amp;L based on last recorded price
            </span>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
