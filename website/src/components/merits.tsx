"use client";
import { Zap, Lock, BarChart2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function useCountUp(end: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, shouldStart]);
  return count;
}

function AnimatedStat({
  to,
  prefix = "",
  suffix = "",
  label,
  fixed = false,
}: {
  to?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  fixed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(to ?? 0, 2000, started && !fixed);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const display = fixed
    ? `${prefix}${suffix}`
    : `${prefix}${count.toLocaleString("en-IN")}${suffix}`;

  return (
    <div ref={ref} className="text-3xl font-extrabold text-white tracking-tight mb-1">
      {display}
    </div>
  );
}

const STATS = [
  { to: 850,   prefix: "₹", suffix: "Cr+", label: "Total Volume"        },
  { to: 12000, prefix: "",   suffix: "+",   label: "Satisfied Investors" },
  { to: 180,   prefix: "",   suffix: "+",   label: "Companies Listed"    },
  { to: 0,     prefix: "Same Day", suffix: "",   label: "Settlement", fixed: true },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: "Same-Day Settlement",
    desc: "Shares transferred to your demat the same business day. No delays, no excuses.",
    iconClass: "text-amber-500 bg-amber-50 border-amber-200",
    glow: "rgba(245,158,11,0.18)",
  },
  {
    icon: Lock,
    title: "100% Secure Transactions",
    desc: "Payment is processed only after deal confirmation. Your funds stay fully protected.",
    iconClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
    glow: "rgba(16,185,129,0.18)",
  },
  {
    icon: BarChart2,
    title: "Deep Research & Financials",
    desc: "Audited financials, valuation models, and analyst notes for every listed company.",
    iconClass: "text-primary bg-primary/[0.07] border-primary/[0.20]",
    glow: "rgba(21,101,192,0.18)",
  },
  {
    icon: Users,
    title: "Dedicated Relationship Manager",
    desc: "Personal RM assigned at signup. WhatsApp-first support, always available.",
    iconClass: "text-violet-600 bg-violet-50 border-violet-200",
    glow: "rgba(124,58,237,0.18)",
  },
] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] as const } },
};

export default function Merits() {
  return (
    <section id="about" className="py-12 sm:py-20 border-b border-border" aria-labelledby="merits-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2
            id="merits-heading"
            className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3"
          >
            Merits That Matter
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Why 12,000+ investors trust Meritspe for their pre-IPO investments
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-2xl px-5 sm:px-8 py-4 sm:py-5 mt-8 border w-full sm:w-auto" style={{ background: "linear-gradient(135deg, rgba(240,144,32,0.08) 0%, rgba(240,144,32,0.04) 100%)", borderColor: "rgba(240,144,32,0.28)" }}>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-gradient-orange leading-none">9.6</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
                Trust Score
              </div>
            </div>
            <div className="w-full sm:w-px h-px sm:h-12 bg-border" aria-hidden="true" />
            <div className="text-center sm:text-left">
              <div className="flex gap-0.5 mb-2 justify-center sm:justify-start" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-xl leading-none" aria-hidden="true">★</span>
                ))}
              </div>
              <div className="text-sm text-foreground">
                Based on <span className="font-bold">4,800+</span> verified reviews
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Google · Trustpilot · App Store</div>
            </div>
          </div>
        </motion.div>

        {/* Stats row — count-up + shine */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="shine-card rounded-2xl p-6 text-center hover:-translate-y-1.5 transition-all duration-300 cursor-default"
              style={{
                background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
                boxShadow: "0 2px 14px rgba(21,101,192,0.22)",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(21,101,192,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(21,101,192,0.22)"; }}
            >
              <AnimatedStat
                to={s.to}
                prefix={s.prefix}
                suffix={s.suffix}
                label={s.label}
                fixed={"fixed" in s ? (s as { fixed?: boolean }).fixed : false}
              />
              <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.78)" }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map(({ icon: Icon, title, desc, iconClass, glow }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className="shine-card bg-card rounded-2xl p-6 border border-border transition-all duration-300 group cursor-default"
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 16px 40px ${glow}`;
                e.currentTarget.style.borderColor = "rgba(240,144,32,0.38)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border ${iconClass}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-base">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
