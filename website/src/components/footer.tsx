import Link from "next/link";
import { TrendingUp, Mail, Phone } from "lucide-react";

const LINKS: Record<string, { label: string; href: string }[]> = {
  Platform: [
    { label: "Explore Shares", href: "/" },
    { label: "Top Gainers", href: "/" },
    { label: "DRHP Filed", href: "/" },
    { label: "Pre-IPO Deals", href: "/" },
  ],
  Company: [
    { label: "About Us", href: "/#about-us" },
  ],
  Support: [
    { label: "Contact Us", href: "/#contact" },
  ],
  Legal: [
    { label: "Disclaimer", href: "/#disclaimer" },
  ],
};


function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOCIALS = [
  { Icon: LinkedInIcon, label: "LinkedIn", href: "https://www.linkedin.com/company/merits-capital-market-services-pvt-ltd-/" },
  { Icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/meritscapital/?igsh=MTM4dXkxNXFsazk4bA%3D%3D" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 sm:gap-10 mb-12">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-5"
              aria-label="Unlisted Merits home"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)", boxShadow: "0 2px 10px rgba(21,101,192,0.28)" }}>
                <TrendingUp className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-base font-bold text-foreground">
                Unlisted <span className="text-primary">Merits</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              India&apos;s most trusted platform for unlisted shares and pre-IPO stock investments.
            </p>

            <div className="space-y-2.5 text-sm mb-6">
              <a
                href="mailto:unlisted@merits.in"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                unlisted@merits.in
              </a>
              <a
                href="tel:+919871325544"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                +91 98713 25544
              </a>
            </div>

            {/* Social links */}
            <div className="flex gap-2.5">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Unlisted Merits on ${label}`}
                  className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-surface-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, items]) => (
            <nav key={category} aria-labelledby={`footer-nav-${category}`}>
              <h4
                id={`footer-nav-${category}`}
                className="text-foreground font-semibold mb-4 text-sm"
              >
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8">
          <div className="bg-surface/50 border border-border rounded-xl p-4 mb-6 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground/60">Disclaimer:</strong>{" "}
            Unlisted Merits is not a registered broker or SEBI-registered entity. Investments in unlisted
            shares are subject to market risks. Please read all risk disclosures carefully. Past
            performance is not indicative of future returns. This website does not constitute
            investment advice.
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Unlisted Merits. All rights reserved.</p>
            <p>Built for India&apos;s next generation of investors.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
