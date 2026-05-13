"use client";
import { Bell, TrendingUp, Users, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const PERKS = [
  { icon: Bell, text: "Daily price updates" },
  { icon: TrendingUp, text: "Pre-IPO deal alerts" },
  { icon: Users, text: "8,000+ active members" },
  { icon: MessageCircle, text: "Direct RM access" },
] as const;

const WHATSAPP_URL = "https://chat.whatsapp.com/Gq2IObcgpwGBMWM3OKgyRK";

export default function Community() {
  return (
    <section
      className="py-12 sm:py-20 border-b border-border"
      aria-labelledby="community-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-10 sm:px-8 sm:py-14 text-center"
          style={{ boxShadow: "0 12px 40px -12px rgba(0,0,0,0.08)" }}
        >
          {/* Orange radial glow at top — brand DNA */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(240,144,32,0.10), transparent 60%)",
            }}
          />
          {/* Subtle green base glow for WhatsApp */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background:
                "radial-gradient(ellipse 55% 40% at 50% 100%, rgba(34,197,94,0.05), transparent 65%)",
            }}
          />
          {/* Subtle grid */}
          <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-100 rounded-3xl" />

          {/* WhatsApp icon with pulsing rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative inline-flex items-center justify-center w-16 h-16 mb-6"
            aria-hidden="true"
          >
            <span className="absolute inset-0 rounded-2xl bg-emerald-400/30" style={{ animation: "ring-expand 2s ease-out infinite" }} />
            <span className="absolute inset-0 rounded-2xl bg-emerald-400/20" style={{ animation: "ring-expand 2s ease-out 1s infinite" }} />
            <div className="relative w-full h-full bg-emerald-500 rounded-2xl flex items-center justify-center" style={{ boxShadow: "0 8px 24px rgba(34,197,94,0.35)" }}>
              <svg viewBox="0 0 24 24" className="w-9 h-9" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.088 1.504 5.814L.057 23.143a.75.75 0 0 0 .924.924l5.329-1.447A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.51-5.17-1.399l-.371-.217-3.846 1.044 1.044-3.846-.217-.371A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </div>
          </motion.div>

          <h2
            id="community-heading"
            className="relative text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3"
          >
            Join 8,000+ Investors on WhatsApp
          </h2>
          <p className="relative text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Get real-time alerts on unlisted share price moves, pre-IPO announcements,
            DRHP filings, and exclusive deals — straight to WhatsApp.
          </p>

          {/* Perks */}
          <div className="relative flex flex-wrap justify-center gap-3 mb-10">
            {PERKS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                {text}
              </div>
            ))}
          </div>

          {/* CTA button */}
          <motion.a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="relative inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base px-8 py-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            style={{ boxShadow: "0 4px 20px rgba(34,197,94,0.3)" }}
            aria-label="Join Unlisted Merits WhatsApp community (opens WhatsApp)"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.088 1.504 5.814L.057 23.143a.75.75 0 0 0 .924.924l5.329-1.447A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.51-5.17-1.399l-.371-.217-3.846 1.044 1.044-3.846-.217-.371A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            Join WhatsApp Community
          </motion.a>

          <p className="relative text-sm text-muted-foreground mt-5">
            Free to join · No spam · Exit anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
