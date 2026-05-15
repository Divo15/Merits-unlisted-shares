"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Award, TrendingUp, Globe, AlertTriangle } from "lucide-react";

const DISCLOSURES = [
  {
    title: "Not a SEBI-Recognised Exchange",
    body: "Unlisted Merits (operated by Merits Capital Market Services Pvt. Ltd.) is NOT a stock exchange or a trading platform recognised by SEBI. We function as an informational platform connecting buyers and sellers of unlisted shares.",
  },
  {
    title: "Not SEBI-Registered",
    body: "Unlisted Merits is not a SEBI-registered investment advisor, stock broker, portfolio manager, or wealth manager. Nothing on this platform should be construed as advice from a SEBI-registered entity.",
  },
  {
    title: "For Informational Purposes Only",
    body: "All materials — articles, company analysis, share prices, valuations, and IPO predictions — are for informational and educational purposes only. They do not constitute financial, legal, or tax advice of any kind.",
  },
  {
    title: "Investment Risks — Read Carefully",
    body: "Investing in unlisted shares carries significant risks including potential total loss of capital, liquidity challenges, price volatility, valuation uncertainty, fraud exposure, and no IPO guarantee. Be prepared to lose your entire investment.",
  },
  {
    title: "No Guarantee or Warranty",
    body: "All information is provided 'AS IS' without warranty of any kind. Unlisted Merits provides no guarantees regarding share price accuracy, availability, investment returns, IPO timing, or transaction completion.",
  },
  {
    title: "Past Performance",
    body: "Previous returns, price appreciation, and IPO successes highlighted on this platform do not indicate or guarantee future performance. Historical data is illustrative only.",
  },
];

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "SEBI Registered",        sub: "Regulated Intermediary"             },
  { icon: Award,       label: "#2 of 8,000+",           sub: "Motilal Oswal Partners 2023–24"     },
  { icon: TrendingUp,  label: "30+ Years Legacy",       sub: "Est. 1993"                          },
  { icon: Globe,       label: "Multi-Asset Platform",   sub: "Equities · Funds · Real Estate"     },
] as const;

const SERVICES = [
  "Unlisted Equities",
  "Algorithmic Strategies",
  "Mutual Funds",
  "Financial Planning",
  "International Real Estate",
  "Dubai Property",
] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

export default function AboutUs() {
  return (
    <section
      id="about-us"
      className="relative overflow-hidden border-b border-border"
      aria-labelledby="about-heading"
    >
      {/* Dark navy background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0D2040 0%, #0F2A50 60%, #1565C0 100%)" }}
        aria-hidden="true"
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      {/* Orange radial glow top-right */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: "#F09020" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="lg:grid lg:grid-cols-[1fr_480px] lg:gap-16 lg:items-start">

          {/* ── LEFT: heading + body copy ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{ background: "rgba(240,144,32,0.18)", border: "1px solid rgba(240,144,32,0.35)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F09020" }} aria-hidden="true" />
                <span className="text-xs font-bold tracking-[0.12em] text-orange-300 uppercase">Est. 1993 · 30+ Years</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h2
              id="about-heading"
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.05] mb-6"
            >
              Welcome to{" "}
              <span style={{ color: "#F09020" }}>Merits.</span>
            </motion.h2>

            {/* Body paragraphs */}
            <motion.div variants={itemVariants} className="space-y-5 text-[0.95rem] leading-[1.75]" style={{ color: "rgba(255,255,255,0.72)" }}>
              <p>
                Established in <strong className="text-white font-semibold">1993</strong>, Merits Capital Market Services Pvt. Ltd. brings over{" "}
                <strong className="text-white font-semibold">30 years of legacy</strong> in delivering trust, transparency, and innovation in financial markets.
                As a <strong className="text-white font-semibold">SEBI-registered intermediary</strong> and the{" "}
                <strong className="text-white font-semibold">second top (out of 8,000) business partners of Motilal Oswal</strong> for the year 2023–24,
                we operate at the intersection of Fintech, Research, and Wealth strategy.
              </p>
              <p>
                We don&apos;t just sell financial products. We facilitate intelligent participation — from Unlisted Equities and
                Algorithmic Strategies to Mutual Funds, Financial Planning, and International Real Estate, especially Dubai.
                Every offering is backed by deep research, regulatory clarity, and personal guidance — we don&apos;t push products,
                we guide clients with structured, data-driven frameworks designed to build long-term wealth.
              </p>
              <p>
                At Merits, <strong className="text-white font-semibold">innovation isn&apos;t a buzzword</strong> — it&apos;s how we evolve with our clients.
              </p>
            </motion.div>

            {/* Service pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mt-8">
              {SERVICES.map((s) => (
                <span
                  key={s}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {s}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: highlight cards ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 mt-12 lg:mt-0 lg:pt-6"
          >
            {HIGHLIGHTS.map(({ icon: Icon, label, sub }) => (
              <motion.div
                key={label}
                variants={itemVariants}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,144,32,0.12)"; e.currentTarget.style.borderColor = "rgba(240,144,32,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(240,144,32,0.18)", border: "1px solid rgba(240,144,32,0.3)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#F09020" }} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white leading-tight">{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{sub}</div>
                </div>
              </motion.div>
            ))}

            {/* CTA card */}
            <motion.div
              variants={itemVariants}
              className="col-span-2 rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, rgba(240,144,32,0.18) 0%, rgba(240,144,32,0.08) 100%)",
                border: "1px solid rgba(240,144,32,0.28)",
              }}
            >
              <p className="text-sm font-semibold text-white/80 leading-relaxed mb-4">
                Ready to invest with three decades of institutional expertise behind you?
              </p>
              <a
                href="#explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #FFB74D 0%, #F09020 60%, #E87A00 100%)",
                  color: "#0D2040",
                  boxShadow: "0 4px 16px rgba(240,144,32,0.4)",
                }}
              >
                Explore Deals
              </a>
            </motion.div>
          </motion.div>

        </div>

        {/* ── Risk Disclosure & Disclaimer ── */}
        <motion.div
          id="disclaimer"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="scroll-mt-24 mt-16 sm:mt-20 pt-12 border-t"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
        >
          <motion.div variants={itemVariants}>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
              style={{ background: "rgba(240,144,32,0.18)", border: "1px solid rgba(240,144,32,0.35)" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#F09020" }} aria-hidden="true" />
              <span className="text-xs font-bold tracking-[0.12em] text-orange-300 uppercase">Investor Awareness</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Risk Disclosure &amp; Disclaimer
            </h3>
            <p className="text-[0.95rem] leading-[1.7] max-w-2xl mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              Unlisted shares are high-risk instruments. Please read these key disclosures carefully before making any investment decision.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DISCLOSURES.map(({ title, body }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,144,32,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(240,144,32,0.18)", border: "1px solid rgba(240,144,32,0.3)" }}
                  >
                    <AlertTriangle className="w-4 h-4" style={{ color: "#F09020" }} aria-hidden="true" />
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{title}</h4>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
