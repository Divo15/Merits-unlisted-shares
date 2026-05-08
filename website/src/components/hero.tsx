"use client";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { Stock } from "@/types/stock";
import NewsBanner from "@/components/news-banner";

interface HeroProps {
  stock: Stock;
}

const TRUST_BADGES = [
  "SAME DAY SETTLEMENT",
  "ASSISTED EXECUTION",
  "PRIVATE DEAL FLOW",
] as const;

const STATS = [
  { icon: Shield, value: "₹850Cr+", label: "Total Volume Traded" },
  { icon: Users, value: "12,000+", label: "Active Investors" },
  { icon: Zap, value: "Same Day", label: "Settlement" },
] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] as const } },
};

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-6 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(21,101,192,0.28)]"
      style={{
        background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
        boxShadow: "0 2px 12px rgba(21,101,192,0.22)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}
      >
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div>
        <div className="text-xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</div>
      </div>
    </div>
  );
}

export default function Hero({ stock }: HeroProps) {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Background atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-orb   absolute -top-40 -left-40  w-[700px] h-[700px] rounded-full blur-[120px]" style={{ background: "rgba(21,101,192,0.13)" }} />
        <div className="animate-orb-b absolute top-0  right-0    w-[550px] h-[550px] rounded-full blur-[100px]" style={{ background: "rgba(21,101,192,0.10)" }} />
        <div className="animate-orb-c absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[90px]"  style={{ background: "rgba(240,144,32,0.08)" }} />
        <div className="animate-orb   absolute top-1/2 left-1/2  w-[300px] h-[300px] rounded-full blur-[80px]"  style={{ background: "rgba(99,102,241,0.06)", animationDelay: "4s" }} />
        <div className="absolute inset-0 bg-grid opacity-100" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 sm:pt-16 sm:pb-12 lg:pt-24 lg:pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-0 lg:items-start">

          {/* ── LEFT COLUMN: copy + featured deal ── */}
          <div>
            <motion.div variants={containerVariants} initial="hidden" animate="show">

              {/* Eyebrow badge */}
              <motion.div variants={itemVariants}>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
                  style={{ background: "linear-gradient(90deg, #F09020, #E87A00)", color: "#0D2040", boxShadow: "0 2px 16px rgba(240,144,32,0.28)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70" style={{ animation: "pulse-soft 2.5s ease-in-out infinite" }} aria-hidden="true" />
                  <span className="text-xs font-bold tracking-[0.1em]">TRUSTED BY 12,000+ INVESTORS</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                id="hero-heading"
                variants={itemVariants}
                className="font-heading text-4xl sm:text-5xl md:text-6xl xl:text-[4.25rem] leading-[0.95] tracking-[-0.025em] text-foreground"
              >
                Invest in
                <br />
                tomorrow&apos;s
                <br />
                <span className="text-gradient-blue italic">leaders</span>
                <span className="text-muted-foreground text-3xl sm:text-4xl md:text-5xl xl:text-[3.25rem]">{" "}before IPO</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={itemVariants} className="mt-7 text-base leading-7 text-muted-foreground max-w-lg">
                Access curated unlisted equity opportunities with transparent pricing,
                assisted onboarding, and a relationship-first investment experience.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#explore"
                  className="btn-shine inline-flex items-center gap-2 font-bold text-sm px-7 py-3 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  style={{ background: "linear-gradient(135deg, #FFB74D 0%, #F09020 60%, #E87A00 100%)", color: "#0D2040", boxShadow: "0 4px 22px rgba(240,144,32,0.45)" }}
                >
                  Explore Deals <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="#founders"
                  className="btn-shine inline-flex items-center justify-center font-semibold text-sm px-7 py-3 rounded-lg transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  style={{ background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)", color: "#ffffff", boxShadow: "0 4px 18px rgba(21,101,192,0.30)" }}
                >
                  Speak to an Advisor
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-2">
                {TRUST_BADGES.map((badge) => (
                  <span key={badge} className="rounded-full border border-border bg-surface/50 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.1em] text-muted-foreground">
                    {badge}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Featured deal bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 rounded-xl border border-accent/25 bg-accent/[0.04] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(240,144,32,0.15)", color: "#B36000" }}>
                  Featured Deal
                </span>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{stock.name}</span>{" "}
                  ({stock.ticker}) · Indicative price{" "}
                  <span className="font-semibold text-foreground">₹{stock.price.toLocaleString("en-IN")}</span>{" "}
                  · {stock.sector}
                </p>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Real-time data modules continue below with filtering, charting, and buy/sell discovery.
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: TV news banner ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col gap-4 mt-8 lg:mt-0 lg:pt-36 lg:-ml-16"
          >
            <NewsBanner />
          </motion.div>

        </div>

        {/* ── Full-width 3-stat strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 1, 0.5, 1] }}
          className="mt-10 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </motion.div>

      </div>
    </section>
  );
}
