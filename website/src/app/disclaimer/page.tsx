import Link from "next/link";
import { TrendingUp } from "lucide-react";

const SECTIONS = [
  {
    title: "Not a SEBI-Recognised Exchange",
    body: "Unlisted Merits (operated by Merits Capital Market Services Pvt. Ltd.) is NOT a stock exchange or a trading platform recognised by the Securities Exchange Board of India (SEBI). We function as an informational platform connecting buyers and sellers of unlisted shares and do not facilitate direct transactions.",
  },
  {
    title: "Not SEBI-Registered",
    body: "Unlisted Merits is not a SEBI-registered investment advisor, stock broker, portfolio manager, financial planner, wealth manager, or recognised stock exchange. Nothing on this platform should be construed as advice from a SEBI-registered entity.",
  },
  {
    title: "For Informational Purposes Only",
    body: "All materials on this website — including articles, company analysis, share prices, valuations, and IPO predictions — are for informational and educational purposes only. They do not constitute financial advice, investment recommendations, legal counsel, tax guidance, personalised investment direction, or trading advice of any kind.",
  },
  {
    title: "Investment Risks — Read Carefully",
    body: "Investing in unlisted shares carries significant risks including but not limited to: potential total loss of capital, liquidity challenges, limited regulatory oversight, price volatility, valuation uncertainty, fraud exposure, extended lock-in periods, no IPO guarantee, business failure risk, information asymmetry, and regulatory change exposure. You should be prepared to lose your entire investment.",
  },
  {
    title: "No Guarantee or Warranty",
    body: "All information is provided 'AS IS' without warranty of any kind, express or implied. Unlisted Merits provides no guarantees regarding share price accuracy, share availability, investment returns, IPO timing or success, company performance, authenticity of third-party information, or transaction completion.",
  },
  {
    title: "Past Performance",
    body: "Previous returns, price appreciation, and IPO successes highlighted on this platform do not indicate or guarantee future performance. Historical data is illustrative only.",
  },
  {
    title: "Your Responsibility",
    body: "Investors are solely responsible for conducting independent due diligence, verifying all information separately, assessing personal risk tolerance, consulting a SEBI-registered financial advisor, understanding tax implications, and ensuring compliance with applicable laws before making any investment decision. Third-party information about companies and valuations is not independently verified by Unlisted Merits. Do not invest money you cannot afford to lose.",
  },
  {
    title: "Role of Unlisted Merits",
    body: "Unlisted Merits's role is limited to providing information about unlisted shares and connecting potential buyers and sellers. Unlisted Merits does NOT hold client funds, execute trades, provide custody services, guarantee transaction completion, act as a fund transfer intermediary, or verify the authenticity of share certificates.",
  },
  {
    title: "Market Manipulation Warning",
    body: "Information on this platform must not be used for market manipulation, insider trading, fraud, misrepresentation, or unauthorised solicitation. Such activities are illegal under Indian securities law and carry severe civil and criminal penalties.",
  },
  {
    title: "External Links and Third-Party Content",
    body: "Unlisted Merits assumes no responsibility for the content of external websites linked from this platform, the privacy practices of third parties, the accuracy of third-party information, or products and services offered by third parties. Links are provided for convenience only.",
  },
  {
    title: "Limitation of Liability",
    body: "Merits Capital Market Services Pvt. Ltd. and its directors, officers, employees, agents, and affiliates shall NOT be liable for any investment losses, direct or indirect damages, loss of profit, loss of data, content errors, unauthorised access, service interruptions, third-party actions, or tax liabilities arising from use of this platform. Our aggregate liability under any circumstances is capped at ₹1,000 (One Thousand Rupees Only).",
  },
  {
    title: "Regulatory Compliance",
    body: "Users must comply with all applicable laws including the Securities Contracts (Regulation) Act, Income Tax Act, FEMA regulations (for NRI and foreign investors), anti-money laundering laws, KYC requirements, and all other relevant legislation when transacting in unlisted securities.",
  },
  {
    title: "Consult a Professional",
    body: "Before making any investment decision, you should consult a SEBI-registered Investment Advisor, a Chartered Accountant, a qualified legal advisor, and a financial planner who can assess your individual circumstances.",
  },
  {
    title: "Age Restriction",
    body: "This website is intended for users who are 18 years of age or older, legally competent to enter into contracts under Indian law, and duly authorised to make investment decisions.",
  },
  {
    title: "Jurisdiction and Governing Law",
    body: "This disclaimer and all matters related to your use of this platform are governed by Indian law. Any disputes shall be subject to the exclusive jurisdiction of the competent courts of India.",
  },
  {
    title: "Changes to This Disclaimer",
    body: "Unlisted Merits reserves the right to modify this disclaimer at any time without prior notice. Changes become effective immediately upon publication on this page. Continued use of the platform constitutes acceptance of the revised disclaimer.",
  },
  {
    title: "No Professional Relationship",
    body: "Access to or use of this website does not create any advisor-client, broker-client, or fiduciary relationship between you and Unlisted Merits, nor does it create any professional obligations on the part of Unlisted Merits.",
  },
  {
    title: "Acknowledgment",
    body: "By using this platform you acknowledge that you have read and understood this disclaimer, you accept the risks associated with unlisted share investments, you absolve Unlisted Merits of liability for investment outcomes, you will seek independent professional advice before investing, and you understand the high-risk nature of unlisted securities trading.",
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-extrabold text-gray-900">
              Unlisted <span className="text-blue-600">Merits</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-blue-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Risk Disclosure & Disclaimer</h1>
          <p className="text-sm text-gray-500">Last updated: May 2026</p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-center text-gray-400">
          © 2026 Unlisted Merits. By using this platform you agree to the terms outlined above.
        </p>
      </div>
    </div>
  );
}
