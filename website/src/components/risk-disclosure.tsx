"use client";
import {
  AlertTriangle,
  ShieldOff,
  BadgeCheck,
  Info,
  TrendingDown,
  FileWarning,
  History,
} from "lucide-react";

const SECTIONS = [
  {
    icon: ShieldOff,
    title: "Not a SEBI-Recognised Exchange",
    body: "Unlisted Merits (operated by Merits Capital Market Services Pvt. Ltd.) is NOT a stock exchange or a trading platform recognised by the Securities Exchange Board of India (SEBI). We function as an informational platform connecting buyers and sellers of unlisted shares and do not facilitate direct transactions.",
  },
  {
    icon: BadgeCheck,
    title: "Not SEBI-Registered",
    body: "Unlisted Merits is not a SEBI-registered investment advisor, stock broker, portfolio manager, financial planner, wealth manager, or recognised stock exchange. Nothing on this platform should be construed as advice from a SEBI-registered entity.",
  },
  {
    icon: Info,
    title: "For Informational Purposes Only",
    body: "All materials on this website — including articles, company analysis, share prices, valuations, and IPO predictions — are for informational and educational purposes only. They do not constitute financial advice, investment recommendations, legal counsel, tax guidance, personalised investment direction, or trading advice of any kind.",
  },
  {
    icon: TrendingDown,
    title: "Investment Risks — Read Carefully",
    body: "Investing in unlisted shares carries significant risks including but not limited to: potential total loss of capital, liquidity challenges, limited regulatory oversight, price volatility, valuation uncertainty, fraud exposure, extended lock-in periods, no IPO guarantee, business failure risk, information asymmetry, and regulatory change exposure. You should be prepared to lose your entire investment.",
  },
  {
    icon: FileWarning,
    title: "No Guarantee or Warranty",
    body: "All information is provided 'AS IS' without warranty of any kind, express or implied. Unlisted Merits provides no guarantees regarding share price accuracy, share availability, investment returns, IPO timing or success, company performance, authenticity of third-party information, or transaction completion.",
  },
  {
    icon: History,
    title: "Past Performance",
    body: "Previous returns, price appreciation, and IPO successes highlighted on this platform do not indicate or guarantee future performance. Historical data is illustrative only.",
  },
];

const NAVY = "#0D2040";
const ORANGE = "#E87A00";

export default function RiskDisclosure() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div
        className="relative overflow-hidden rounded-3xl p-7 sm:p-10"
        style={{
          background: "linear-gradient(160deg,#FFF8EF 0%,#FFF1DF 55%,#FDE9D2 100%)",
          border: "1px solid rgba(232,122,0,0.22)",
          boxShadow: "0 18px 50px -22px rgba(232,122,0,0.35)",
        }}
      >
        {/* decorative glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(255,183,77,0.55),transparent 70%)" }}
        />

        {/* header */}
        <div className="relative">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em]"
            style={{ background: "rgba(232,122,0,0.12)", color: ORANGE }}
          >
            <AlertTriangle className="h-3 w-3" />
            Investor Awareness
          </span>
          <h2
            className="mt-3 text-2xl sm:text-3xl font-extrabold font-heading tracking-tight"
            style={{ color: NAVY }}
          >
            Risk Disclosure &amp; Disclaimer
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Unlisted shares are high-risk instruments. Please read these key disclosures
            carefully before making any investment decision.
          </p>
          <div
            className="mt-5 h-1 w-20 rounded-full"
            style={{ background: `linear-gradient(90deg,#FFB74D,${ORANGE})` }}
          />
        </div>

        {/* cards */}
        <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ icon: Icon, title, body }, i) => (
            <article
              key={i}
              className="group flex flex-col rounded-2xl bg-white/85 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
              style={{
                border: "1px solid rgba(232,122,0,0.18)",
                boxShadow: "0 6px 18px -12px rgba(13,32,64,0.25)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg,#FFB74D,#E87A00)",
                    boxShadow: "0 6px 14px -6px rgba(232,122,0,0.6)",
                  }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold leading-snug" style={{ color: NAVY }}>
                  {title}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
