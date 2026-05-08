"use client";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Zap, BarChart2, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

const REFRESH_INTERVAL = 30000;
const ROTATE_INTERVAL  = 8000;

const FALLBACK: NewsItem[] = [
  { title: "OYO expansion plans hint at renewed IPO filing for FY25.", url: "#", source: "Market Watch", publishedAt: "" },
  { title: "Tata Capital IPO rumors drive significant volume in secondary markets.", url: "#", source: "Institutional Desk", publishedAt: "" },
  { title: "NCDEX volume surge observed as pre-listing interest peaks.", url: "#", source: "Trading Floor", publishedAt: "" },
  { title: "SEBI tightens unlisted securities norms ahead of IPO season.", url: "#", source: "Regulatory Desk", publishedAt: "" },
  { title: "Startup funding rounds push pre-IPO valuations to record highs.", url: "#", source: "Deal Flow", publishedAt: "" },
  { title: "Investors flock to unlisted shares ahead of anticipated IPO wave.", url: "#", source: "IPO Watch", publishedAt: "" },
];

const ITEM_ICONS = [
  { Icon: TrendingUp, color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
  { Icon: BarChart2,  color: "#ffffff", bg: "#F09020"                 },
  { Icon: Zap,        color: "#F09020", bg: "rgba(240,144,32,0.15)"  },
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Just now";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1)  return "Just now";
  if (diff < 60) return `${diff} min${diff !== 1 ? "s" : ""} ago`;
  const h = Math.floor(diff / 60);
  return `${h} hr${h !== 1 ? "s" : ""} ago`;
}

export default function NewsBanner() {
  const [items, setItems]   = useState<NewsItem[]>(FALLBACK);
  const [offset, setOffset] = useState(0);
  const rotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/stocks/news/");
      if (!res.ok) return;
      const data: NewsItem[] = await res.json();
      if (Array.isArray(data) && data.length > 0) { setItems(data); setOffset(0); }
    } catch { /* keep fallback */ }
  };

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (rotateRef.current) clearInterval(rotateRef.current);
    rotateRef.current = setInterval(() => {
      setOffset((o) => (o + 3) % items.length);
    }, ROTATE_INTERVAL);
    return () => { if (rotateRef.current) clearInterval(rotateRef.current); };
  }, [items.length]);

  const visible = [0, 1, 2].map((i) => items[(offset + i) % items.length]);

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "rgba(30, 136, 229, 0.15)",
        border: "1px solid rgba(30,136,229,0.3)",
        borderRadius: "16px",
        boxShadow: "none",
      }}
      role="region"
      aria-label="Live IPO news terminal"
      aria-live="polite"
    >
      {/* ── Orange top accent bar ── */}
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, #F09020 0%, #FFB74D 50%, #F09020 100%)" }}
      />

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-3.5"
        style={{
          background: "linear-gradient(90deg, #F09020 0%, #E87A00 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "#0D2040", boxShadow: "0 0 6px rgba(13,32,64,0.5)", animation: "pulse-soft 1.8s ease-in-out infinite" }}
            aria-hidden="true"
          />
          <span className="text-[0.7rem] font-extrabold tracking-[0.22em] uppercase text-[#0D2040]">
            Live News Terminal
          </span>
        </div>

        {/* Orange "IPO" badge */}
        <span
          className="text-[0.6rem] font-black tracking-[0.15em] px-2.5 py-1 rounded-sm"
          style={{ background: "#0D2040", color: "#ffffff" }}
        >
          IPO
        </span>
      </div>

      {/* ── News items ── */}
      <div className="divide-y" style={{ borderColor: "rgba(30,136,229,0.2)" }}>
        {visible.map((item, i) => {
          const { Icon, color, bg } = ITEM_ICONS[i % ITEM_ICONS.length];
          return (
            <a
              key={`${offset}-${i}`}
              href={item.url !== "#" ? item.url : undefined}
              target={item.url !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-start gap-4 px-6 py-4 group transition-all duration-150"
              style={{ background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,136,229,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Icon bubble */}
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: bg, border: "1px solid rgba(255,255,255,0.12)" }}
                aria-hidden="true"
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[0.88rem] font-semibold text-foreground leading-[1.4] line-clamp-2 group-hover:text-primary transition-colors duration-150">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm"
                    style={{ background: "rgba(30,136,229,0.12)", color: "#1565C0" }}
                  >
                    {item.source}
                  </span>
                  <span className="text-[0.6rem]" style={{ color: "rgba(0,0,0,0.4)" }}>
                    · {timeAgo(item.publishedAt)}
                  </span>
                </div>
              </div>

              {item.url !== "#" && (
                <ExternalLink
                  className="w-3 h-3 shrink-0 mt-1.5 opacity-0 group-hover:opacity-50 transition-opacity"
                  style={{ color: "#fff" }}
                  aria-hidden="true"
                />
              )}
            </a>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(30,136,229,0.08)",
          borderTop: "1px solid rgba(30,136,229,0.2)",
        }}
      >
        <span className="text-[0.65rem] font-semibold tracking-wide" style={{ color: "rgba(0,0,0,0.4)" }}>
          NSE Index Proxy
        </span>
        <span
          className="text-[0.72rem] font-bold px-2 py-0.5 rounded-sm"
          style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          +1.24%
        </span>
      </div>
    </div>
  );
}
