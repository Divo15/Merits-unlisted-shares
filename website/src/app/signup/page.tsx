"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { register_step1 } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", phone: "", password: "", confirm_password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const data = await register_step1(form.email, form.phone, form.password, form.confirm_password);
      if (data.access) {
        login(data.access, data.refresh, { id: data.user_id, email: form.email, phone: form.phone, account_type: null, registration_step: 1, kyc_status: 'pending' });
        router.push('/register/type');
      } else {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors(errs);
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)", boxShadow: "0 4px 14px rgba(21,101,192,0.35)" }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">Unlisted <span className="text-blue-600">Merits</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Become a Partner</h1>
          <p className="text-sm text-gray-500 mb-7">Want to become a Partner? Simply verify your email to get started</p>

          {errors.general && <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" inputMode="tel" required placeholder="+91 98765 43210" value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  style={{ borderColor: errors.phone ? '#ef4444' : '#e2e8f0' }} />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  style={{ borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? "text" : "password"} required placeholder="Min. 8 characters" value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  style={{ borderColor: errors.password ? '#ef4444' : '#e2e8f0' }} />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showCpw ? "text" : "password"} required placeholder="Re-enter password" value={form.confirm_password}
                  onChange={e => set('confirm_password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  style={{ borderColor: errors.confirm_password ? '#ef4444' : '#e2e8f0' }} />
                <button type="button" onClick={() => setShowCpw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)", boxShadow: "0 4px 14px rgba(21,101,192,0.35)" }}>
              {loading ? 'Creating account…' : 'Sign Up →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
