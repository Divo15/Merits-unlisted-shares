"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, X, TrendingUp, LogOut, Loader2, RefreshCw, Upload } from "lucide-react";

const CATEGORIES = ["Pre-IPO", "DRHP Filed", "Listed"];
const SECTORS = ["Fintech", "Tech", "BFSI", "Infrastructure", "Healthcare", "Consumer", "EV & Auto", "Other"];
const DJANGO_API = process.env.NEXT_PUBLIC_DJANGO_API || "http://localhost:8000";
function resolveLogoUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("/")) return `${DJANGO_API}${url}`;
  return url;
}
const FUND_FIELDS = ["Lot Size", "Depository", "ISIN", "PAN", "CIN", "RTA", "Market Cap", "P/E Ratio", "P/B Ratio", "Debt to Equity", "ROE", "Face Value"];

interface Stock {
  id: string;
  name: string;
  fullName: string;
  ticker: string;
  sector: string;
  category: string;
  price: number;
  change: number;
  changePct: number;
  high52w: number;
  low52w: number;
  description?: string;
  fundamentalsUrl?: string;
  fundamentalsJson?: Record<string, string>;
  logoUrl?: string;
}

const EMPTY_FORM = {
  name: "", fullName: "", ticker: "", sector: "Tech", category: "Pre-IPO",
  price: "", high52w: "", low52w: "", description: "", fundamentalsUrl: "",
};

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white";
const editInputCls =
  "px-2 py-1.5 border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white w-full";

export default function AdminPage() {
  // --- Auth state ---
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // --- Stock state ---
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // --- Add form ---
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // --- Edit row ---
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editFunds, setEditFunds] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // --- Delete ---
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- Logo upload ---
  const [addLogoFile, setAddLogoFile]       = useState<File | null>(null);
  const [addLogoPreview, setAddLogoPreview] = useState("");
  const [editLogoFile, setEditLogoFile]     = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      const data = await res.json();
      setStocks(Array.isArray(data) ? data : []);
    } catch {
      setFetchError("Failed to load stocks from Django.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchStocks();
  }, [authed, fetchStocks]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_authed", "1");
        setAuthed(true);
      } else {
        setAuthError("Incorrect password.");
      }
    } catch {
      setAuthError("Network error.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function uploadLogo(file: File, ticker: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("ticker", ticker);
    const res = await fetch("/api/admin/logo", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Logo upload failed");
    const data = await res.json();
    return data.logoUrl as string;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      let logoUrl = "";
      if (addLogoFile && addForm.ticker) {
        logoUrl = await uploadLogo(addLogoFile, addForm.ticker);
      }
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          fullName: addForm.fullName || addForm.name,
          ticker: addForm.ticker,
          sector: addForm.sector,
          category: addForm.category,
          description: addForm.description,
          fundamentalsUrl: addForm.fundamentalsUrl,
          logoUrl,
          price: parseFloat(addForm.price) || 0,
          high52w: parseFloat(addForm.high52w) || parseFloat(addForm.price) || 0,
          low52w: parseFloat(addForm.low52w) || parseFloat(addForm.price) || 0,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setAddError(d.error || "Failed to create stock.");
        return;
      }
      setShowAdd(false);
      setAddForm({ ...EMPTY_FORM });
      setAddLogoFile(null);
      setAddLogoPreview("");
      fetchStocks();
    } catch {
      setAddError("Network error.");
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(stock: Stock) {
    setEditId(stock.id);
    setEditForm({
      name: stock.name,
      fullName: stock.fullName,
      ticker: stock.ticker,
      sector: stock.sector,
      category: stock.category,
      description: stock.description ?? "",
      fundamentalsUrl: stock.fundamentalsUrl ?? "",
      logoUrl: stock.logoUrl ?? "",
      price: String(stock.price),
      high52w: String(stock.high52w),
      low52w: String(stock.low52w),
    });
    setEditFunds(stock.fundamentalsJson ?? {});
    setEditLogoFile(null);
    setEditLogoPreview(resolveLogoUrl(stock.logoUrl));
    setEditError("");
  }

  async function handleEdit() {
    if (!editId) return;
    setEditLoading(true);
    setEditError("");
    try {
      let logoUrl = editForm.logoUrl ?? "";
      if (editLogoFile && editForm.ticker) {
        logoUrl = await uploadLogo(editLogoFile, editForm.ticker);
      }
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: editForm.name,
          fullName: editForm.fullName,
          ticker: editForm.ticker,
          sector: editForm.sector,
          category: editForm.category,
          description: editForm.description,
          fundamentalsUrl: editForm.fundamentalsUrl,
          fundamentalsJson: Object.fromEntries(Object.entries(editFunds).filter(([, v]) => v.trim())),
          logoUrl,
          price: parseFloat(editForm.price) || undefined,
          high52w: parseFloat(editForm.high52w) || undefined,
          low52w: parseFloat(editForm.low52w) || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setEditError(d.error || "Update failed.");
        return;
      }
      setEditId(null);
      setEditLogoFile(null);
      setEditLogoPreview("");
      fetchStocks();
    } catch {
      setEditError("Network error.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin?id=${id}`, { method: "DELETE" });
      if (!res.ok) alert("Failed to delete stock.");
      else fetchStocks();
    } finally {
      setDeleteId(null);
    }
  }

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#F09020,#E87A00)" }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              Unlisted Merits <span style={{ color: "#F09020" }}>Admin</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Stock Management</h1>
            {authError && (
              <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{authError}</p>
            )}
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls}
                autoFocus
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#F09020,#E87A00)" }}
              >
                {authLoading ? "Verifying…" : "Enter →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Main admin UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#F09020,#E87A00)" }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold text-gray-900">
            Unlisted Merits <span style={{ color: "#F09020" }}>Admin</span>
          </span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Stocks</h1>
            <span className="text-sm text-gray-400">{stocks.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStocks}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => { setShowAdd(v => !v); setAddError(""); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)", boxShadow: "0 4px 14px rgba(21,101,192,0.25)" }}
            >
              <Plus className="w-4 h-4" /> Add Stock
            </button>
          </div>
        </div>

        {/* Add Stock form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">New Stock</h2>
            {addError && (
              <p className="mb-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>
            )}
            <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Short Name *</label>
                <input required value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Reliance" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                <input value={addForm.fullName}
                  onChange={e => setAddForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Reliance Industries Ltd" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Ticker *</label>
                <input required value={addForm.ticker}
                  onChange={e => setAddForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                  placeholder="RELIANCE" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Sector</label>
                <select value={addForm.sector}
                  onChange={e => setAddForm(f => ({ ...f, sector: e.target.value }))} className={inputCls}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                <select value={addForm.category}
                  onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹) *</label>
                <input required type="number" step="0.01" min="0" value={addForm.price}
                  onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="1200.00" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">52W High (₹)</label>
                <input type="number" step="0.01" min="0" value={addForm.high52w}
                  onChange={e => setAddForm(f => ({ ...f, high52w: e.target.value }))}
                  placeholder="1500.00" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">52W Low (₹)</label>
                <input type="number" step="0.01" min="0" value={addForm.low52w}
                  onChange={e => setAddForm(f => ({ ...f, low52w: e.target.value }))}
                  placeholder="900.00" className={inputCls} />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                <textarea value={addForm.description}
                  onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short company description…" rows={2}
                  className={inputCls + " resize-none"} />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Fundamentals URL <span className="font-normal text-gray-400">(unlistedzone.com page for this stock)</span></label>
                <input value={addForm.fundamentalsUrl}
                  onChange={e => setAddForm(f => ({ ...f, fundamentalsUrl: e.target.value }))}
                  placeholder="https://unlistedzone.com/shares/company-name-unlisted-shares/"
                  className={inputCls} />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Company Logo</label>
                <div className="flex items-center gap-3">
                  {addLogoPreview && (
                    <img src={addLogoPreview} alt="Preview" className="w-10 h-10 rounded-lg object-contain bg-gray-100 border border-gray-200 p-0.5 shrink-0" />
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="truncate">{addLogoFile ? addLogoFile.name : "Upload logo (jpg, png, webp…)"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0] ?? null;
                      setAddLogoFile(f);
                      setAddLogoPreview(f ? URL.createObjectURL(f) : "");
                    }} />
                  </label>
                  {addLogoFile && (
                    <button type="button" onClick={() => { setAddLogoFile(null); setAddLogoPreview(""); }}
                      className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="md:col-span-3 flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#1E88E5,#1565C0)" }}>
                  {addLoading ? "Creating…" : "Create Stock"}
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stock table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading && stocks.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading stocks…
            </div>
          ) : fetchError ? (
            <div className="text-center py-20 text-red-500">{fetchError}</div>
          ) : stocks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No stocks yet. Add one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {["Name", "Ticker", "Sector", "Category", "Price (₹)", "52W High", "52W Low", "Change", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock =>
                    editId === stock.id ? (
                      <React.Fragment key={stock.id}>
                      <tr className="border-b border-blue-50 bg-blue-50/20">
                        <td className="px-3 py-2">
                          <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={editInputCls} />
                        </td>
                        <td className="px-3 py-2">
                          <input value={editForm.ticker}
                            onChange={e => setEditForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                            className={editInputCls + " w-24"} />
                        </td>
                        <td className="px-3 py-2">
                          <select value={editForm.sector} onChange={e => setEditForm(f => ({ ...f, sector: e.target.value }))} className={editInputCls}>
                            {SECTORS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className={editInputCls}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={editForm.price}
                            onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                            className={editInputCls + " w-28"} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={editForm.high52w}
                            onChange={e => setEditForm(f => ({ ...f, high52w: e.target.value }))}
                            className={editInputCls + " w-28"} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={editForm.low52w}
                            onChange={e => setEditForm(f => ({ ...f, low52w: e.target.value }))}
                            className={editInputCls + " w-28"} />
                        </td>
                        <td className="px-3 py-2 text-gray-300">—</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 flex-nowrap">
                            {editError && <span className="text-red-500 text-xs mr-1">{editError}</span>}
                            <button onClick={handleEdit} disabled={editLoading}
                              className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-40">
                              {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-blue-50 bg-blue-50/10">
                        <td colSpan={9} className="px-3 pb-3">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Description</label>
                              <input value={editForm.description}
                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Short description…" className={editInputCls} />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Fundamentals URL</label>
                              <input value={editForm.fundamentalsUrl}
                                onChange={e => setEditForm(f => ({ ...f, fundamentalsUrl: e.target.value }))}
                                placeholder="https://unlistedzone.com/shares/…" className={editInputCls} />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Company Logo</label>
                            <div className="flex items-center gap-3">
                              {editLogoPreview && (
                                <img src={editLogoPreview} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-gray-100 border border-gray-200 p-0.5 shrink-0" />
                              )}
                              <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
                                <Upload className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{editLogoFile ? editLogoFile.name : "Change logo…"}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                  const f = e.target.files?.[0] ?? null;
                                  setEditLogoFile(f);
                                  setEditLogoPreview(f ? URL.createObjectURL(f) : resolveLogoUrl(editForm.logoUrl));
                                }} />
                              </label>
                              {editLogoFile && (
                                <button type="button" onClick={() => { setEditLogoFile(null); setEditLogoPreview(resolveLogoUrl(editForm.logoUrl)); }}
                                  className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Fundamentals — manual entry <span className="font-normal normal-case">(overrides auto-fetch)</span></label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                              {FUND_FIELDS.map(field => (
                                <div key={field}>
                                  <label className="text-[10px] text-gray-400 mb-0.5 block">{field}</label>
                                  <input
                                    value={editFunds[field] ?? ""}
                                    onChange={e => setEditFunds(f => ({ ...f, [field]: e.target.value }))}
                                    placeholder="—"
                                    className={editInputCls}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                      </React.Fragment>
                    ) : (
                      <tr key={stock.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {stock.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={resolveLogoUrl(stock.logoUrl)} alt="" className="w-7 h-7 rounded object-contain bg-gray-100 border border-gray-100 p-0.5 shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded bg-gray-100 shrink-0" />
                            )}
                            <span className="font-medium text-gray-900">{stock.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{stock.ticker}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{stock.sector}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{stock.category}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₹{stock.price.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">₹{stock.high52w.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-600">₹{stock.low52w.toLocaleString("en-IN")}</td>
                        <td className={`px-4 py-3 font-medium text-sm ${stock.changePct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEdit(stock)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(stock.id, stock.name)}
                              disabled={deleteId === stock.id}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                              title="Delete">
                              {deleteId === stock.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
