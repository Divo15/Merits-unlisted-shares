"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Upload, CheckCircle, X } from "lucide-react";
import { register_step3 } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const STEPS = ['Account Type', 'Account Info', 'Agreement', 'Completed'];

function Field({ label, placeholder, value, onChange, type = 'text', error }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${error ? 'border-red-400' : 'border-gray-200'}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FileDropZone({ label, file, onFile }: { label: string; file: File | null; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
    >
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      {file ? (
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold">
          <CheckCircle className="w-4 h-4" /> {file.name}
        </div>
      ) : (
        <>
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG · max 5MB</p>
        </>
      )}
    </div>
  );
}

export default function RegisterKYCPage() {
  const router = useRouter();
  const { accessToken, updateUser, user } = useAuth();

  const [form, setForm] = useState({
    pan_number: '', pan_name: '', state: '', city: '', address: '', zip_code: '',
    bank_account: '', ifsc_code: '', bank_name: '', account_holder_name: '',
  });
  const [panDoc, setPanDoc]       = useState<File | null>(null);
  const [chequeDoc, setChequeDoc] = useState<File | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.pan_number) e.pan_number = 'PAN number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number)) e.pan_number = 'Invalid PAN format (e.g. ABCDE1234F)';
    if (!form.pan_name.trim()) e.pan_name = 'Name as per PAN is required';
    if (!form.bank_account) e.bank_account = 'Account number is required';
    else if (!/^[0-9]{9,18}$/.test(form.bank_account)) e.bank_account = 'Must be 9–18 digits';
    if (!form.ifsc_code) e.ifsc_code = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code)) e.ifsc_code = 'Invalid IFSC format (e.g. SBIN0001234)';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.zip_code) e.zip_code = 'ZIP code is required';
    else if (!/^[0-9]{6}$/.test(form.zip_code)) e.zip_code = 'Must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (panDoc)    fd.append('pan_card_doc', panDoc);
      if (chequeDoc) fd.append('cheque_doc', chequeDoc);
      if (user?.email)        fd.append('_crm_email', user.email);
      if (user?.phone)        fd.append('_crm_phone', user.phone);
      if (user?.account_type) fd.append('_crm_account_type', user.account_type);

      const data = await register_step3(fd, accessToken!);
      if (data.success) {
        updateUser({ registration_step: 3, kyc_status: 'submitted' });
        router.push('/');
      } else {
        const msgs = Object.values(data).flat();
        setError((msgs[0] as string) || 'Something went wrong.');
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
            const done   = i === 0;
            const active = i === 1;
            return (
              <li key={s} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${active ? 'font-bold text-gray-900' : done ? 'text-gray-400 line-through' : 'text-gray-400'}`}>{s}</span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Main */}
      <main className="flex-1 px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">KYC Verification</h1>
          <p className="text-sm text-gray-500 mb-8">Complete your verification to start investing</p>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              <X className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1 — Identity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                Individual Verification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PAN Number</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="ABCDE1234F" value={form.pan_number}
                      onChange={e => set('pan_number', e.target.value.toUpperCase())}
                      maxLength={10}
                      className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 uppercase ${errors.pan_number ? 'border-red-400' : 'border-gray-200'}`} />
                    <button type="button" className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)" }}>
                      Verify
                    </button>
                  </div>
                  {errors.pan_number && <p className="text-xs text-red-500 mt-1">{errors.pan_number}</p>}
                </div>
                <Field label="Name as per PAN" placeholder="Full name" value={form.pan_name} onChange={v => set('pan_name', v)} error={errors.pan_name} />
              </div>
            </div>

            {/* Section 2 — Bank */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Bank A/c Verification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Account Number" placeholder="Enter account number" value={form.bank_account} onChange={v => set('bank_account', v)} error={errors.bank_account} />
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">IFSC Code</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="SBIN0001234" value={form.ifsc_code}
                      onChange={e => set('ifsc_code', e.target.value.toUpperCase())}
                      className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 uppercase ${errors.ifsc_code ? 'border-red-400' : 'border-gray-200'}`} />
                    <button type="button" className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)" }}>
                      Verify
                    </button>
                  </div>
                  {errors.ifsc_code && <p className="text-xs text-red-500 mt-1">{errors.ifsc_code}</p>}
                </div>
                <Field label="Bank Name" placeholder="Auto-populated on verify" value={form.bank_name} onChange={v => set('bank_name', v)} />
                <Field label="Account Holder Name" placeholder="Auto-populated on verify" value={form.account_holder_name} onChange={v => set('account_holder_name', v)} />
              </div>
            </div>

            {/* Section 3 — Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                Address Verification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="State" placeholder="e.g. Maharashtra" value={form.state} onChange={v => set('state', v)} error={errors.state} />
                <Field label="City" placeholder="e.g. Mumbai" value={form.city} onChange={v => set('city', v)} error={errors.city} />
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address</label>
                  <textarea placeholder="Full address" value={form.address}
                    onChange={e => set('address', e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none" />
                </div>
                <Field label="ZIP Code" placeholder="400001" value={form.zip_code} onChange={v => set('zip_code', v)} error={errors.zip_code} />
              </div>
            </div>

            {/* Section 4 — Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                Upload Documents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileDropZone label="PAN Card" file={panDoc} onFile={setPanDoc} />
                <FileDropZone label="Cancelled Cheque" file={chequeDoc} onFile={setChequeDoc} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-4">
              <button type="button" onClick={() => router.push('/register/type')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)", boxShadow: "0 4px 14px rgba(21,101,192,0.35)" }}>
                {loading ? 'Saving…' : 'Save & Continue →'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
