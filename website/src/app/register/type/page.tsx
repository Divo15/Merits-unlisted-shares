"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, User, Building2, CheckCircle } from "lucide-react";
import { register_step2 } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const STEPS = ['Account Type', 'Account Info', 'Agreement', 'Completed'];

export default function RegisterTypePage() {
  const router = useRouter();
  const { accessToken, updateUser } = useAuth();

  const [selected, setSelected] = useState<'individual' | 'corporate' | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleContinue() {
    if (!selected) return;
    setError("");
    setLoading(true);
    try {
      const data = await register_step2(selected, accessToken!);
      if (data.success) {
        updateUser({ account_type: selected, registration_step: 2 });
        router.push('/register/kyc');
      } else {
        setError(data.account_type?.[0] || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 px-6 py-10 shrink-0">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)" }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-sm">Unlisted Merits</span>
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Registration Steps</p>
        <ol className="space-y-4">
          {STEPS.map((s, i) => {
            const active  = i === 0;
            const done    = false;
            return (
              <li key={s} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${active ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{s}</span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Choose Account Type</h1>
          <p className="text-sm text-gray-500 mb-8">Select the type of account you want to open</p>

          {error && <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Individual */}
            <button onClick={() => setSelected('individual')}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                selected === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
              }`}>
              <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">Popular</span>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 mb-1">Individual Account</p>
              <p className="text-xs text-gray-500 leading-relaxed">For personal investors buying or selling unlisted shares</p>
              {selected === 'individual' && (
                <div className="absolute top-4 left-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* Corporate */}
            <button onClick={() => setSelected('corporate')}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                selected === 'corporate' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
              }`}>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <p className="font-bold text-gray-900 mb-1">Corporate Account</p>
              <p className="text-xs text-gray-500 leading-relaxed">For companies, funds, or institutional investors</p>
              {selected === 'corporate' && (
                <div className="absolute top-4 left-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>

          <button onClick={handleContinue} disabled={!selected || loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)", boxShadow: "0 4px 14px rgba(21,101,192,0.35)" }}>
            {loading ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </main>
    </div>
  );
}
