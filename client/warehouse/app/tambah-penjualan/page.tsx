"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
  harga_jual?: number;
};

type ItemInput = {
  barang_id: number;
  qty: number;
  harga: number;
  subtotal: number;
  availableStock?: number;
  stockError?: string;
};

export default function TambahPenjualanPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [noFaktur, setNoFaktur] = useState("");
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [items, setItems] = useState<ItemInput[]>([]);
  // quick add row state
  const [rowBarangId, setRowBarangId] = useState<number>(0);
  const [rowQty, setRowQty] = useState<number>(1);
  const [rowHarga, setRowHarga] = useState<number>(0);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; type: 'error' | 'success'; message: string }>>([]);

  function pushToast(type: 'error' | 'success', message: string) {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }

  useEffect(() => {
    // cek token, redirect ke login kalau belum ada
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchBarang();
  }, [router]);

  async function fetchBarang() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/barang`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json?.data ?? []);
      setBarangList(arr);
    } catch (err) {
      console.error("fetchBarang error", err);
    }
  }

  function addItem() {
    setItems((s) => [...s, { barang_id: 0, qty: 1, harga: 0, subtotal: 0 }]);
  }

  function removeItem(idx: number) {
    setItems((s) => s.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, patch: Partial<ItemInput>) {
    setItems((s) =>
      s.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, ...patch };
        // recalc subtotal
        const qty = Number(updated.qty) || 0;
        const harga = Number(updated.harga) || 0;
        updated.subtotal = qty * harga;
        return updated;
      })
    );
  }

  async function onSelectBarang(idx: number, barangIdStr: string) {
    const barangId = Number(barangIdStr);
    const b = barangList.find((x) => x.id === barangId);
    const harga = b?.harga_jual ?? 0;
    updateItem(idx, { barang_id: barangId, harga, qty: 1 });
    // fetch stock for selected barang
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/stok/${barangId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await res.json();
      const data = Array.isArray(json) ? json[0] : json?.data;
      const stok = data?.stok_akhir ?? data?.StokAkhir ?? null;
      const s = typeof stok === 'number' ? stok : undefined;
      setItems((prev) => prev.map((it, i) => i === idx ? { ...it, availableStock: s, stockError: undefined } : it));
      if (s !== undefined && s <= 0) {
        setItems((prev) => prev.map((it, i) => i === idx ? { ...it, stockError: 'Stok tidak mencukupi' } : it));
        pushToast('error', 'Stok tidak mencukupi untuk barang ini');
      }
    } catch {}
  }

  async function handleAddRow() {
    if (!rowBarangId) return;
    const selected = barangList.find((b) => b.id === rowBarangId);
    const hargaAuto = rowHarga || Number(selected?.harga_jual) || 0;
    const qty = rowQty > 0 ? rowQty : 1;
    const subtotal = qty * hargaAuto;
    // pre-check stock before adding row
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/stok/${rowBarangId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await res.json();
      const data = Array.isArray(json) ? json[0] : json?.data;
      const stok = data?.stok_akhir ?? data?.StokAkhir ?? null;
      const s = typeof stok === 'number' ? stok : undefined;
      if (s !== undefined && qty > s) {
        pushToast('error', `Stok tidak mencukupi. Stok tersedia: ${s}`);
        return;
      }
      setItems((curr) => [...curr, { barang_id: rowBarangId, qty, harga: hargaAuto, subtotal, availableStock: s }]);
    } catch {
      setItems((curr) => [...curr, { barang_id: rowBarangId, qty, harga: hargaAuto, subtotal }]);
    }
    setRowBarangId(0);
    setRowQty(1);
    setRowHarga(0);
  }

  const total = items.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // simple validations
    if (!noFaktur.trim()) {
      setError("Mohon isi No Faktur.");
      pushToast('error', 'Mohon isi No Faktur.');
      return;
    }
    if (!customer.trim()) {
      setError("Mohon isi nama customer.");
      pushToast('error', 'Mohon isi nama customer.');
      return;
    }
    if (items.length === 0) {
      setError("Tambahkan minimal 1 item penjualan.");
      pushToast('error', 'Tambahkan minimal 1 item penjualan.');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.barang_id || it.barang_id === 0) {
        setError(`Pilih barang pada baris ${i + 1}.`);
        return;
      }
      if (!it.qty || it.qty <= 0) {
        setError(`Masukkan qty valid pada baris ${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      // decode user_id from JWT
      function parseJwt(t: string): any | null {
        try {
          const parts = t.split(".");
          if (parts.length < 2) return null;
          const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          return JSON.parse(atob(payload));
        } catch {
          return null;
        }
      }
      const p = parseJwt(token);
      const userId = p?.user_id ?? p?.UserID ?? null;
      if (!userId) throw new Error("User ID tidak ditemukan di token.");

      // payload shape sesuai backend
      const payload = {
        no_faktur: noFaktur,
        customer,
        user_id: Number(userId),
        items: items.map((it) => ({
          barang_id: it.barang_id,
          qty: Number(it.qty),
          harga: Number(it.harga),
        })),
      };

      const res = await fetch(`${BASE}/penjualan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json && json.success === false)) {
        const msg = (json && json.message) || `Request failed: ${res.status}`;
        pushToast('error', msg);
        throw new Error(msg);
      }

      setSuccess("Penjualan berhasil dibuat.");
      pushToast('success', 'Penjualan berhasil dibuat.');
      setTimeout(() => router.push("/penjualan"), 700);
    } catch (err: any) {
      console.error(err);
      const m = err.message || "Terjadi kesalahan saat membuat penjualan";
      setError(m);
      pushToast('error', m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-white text-slate-900">
        {/* Toasts */}
        <div className="fixed right-6 top-6 z-50 space-y-2">
          {toasts.map((t) => (
            <div key={t.id} className={`min-w-[280px] px-4 py-3 rounded-md shadow-sm border ${t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              {t.message}
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-5">Tambah Penjualan</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">No Faktur</label>
              <input
                type="text"
                value={noFaktur}
                onChange={(e) => setNoFaktur(e.target.value)}
                className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Nomor faktur..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Customer</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Nama customer..."
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600">Daftar Item</h2>
            </div>

            {/* POS-style quick add row with editable qty and harga */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Barang</label>
                <select
                  value={rowBarangId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setRowBarangId(id);
                    const selected = barangList.find((b) => b.id === id);
                    const hargaAuto = Number(selected?.harga_jual) || 0;
                    if (!rowHarga) setRowHarga(hargaAuto);
                  }}
                  className="border border-cyan-200 px-2 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value={0}>Pilih Barang</option>
                  {barangList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.kode_barang} - {b.nama_barang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={rowQty}
                  onChange={(e) => setRowQty(Number(e.target.value))}
                  className="border border-cyan-200 px-3 py-2 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Harga</label>
                <input
                  type="number"
                  min={0}
                  value={rowHarga}
                  onChange={(e) => setRowHarga(Number(e.target.value))}
                  className="border border-cyan-200 px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="md:col-span-5">
                <button type="button" onClick={handleAddRow} className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Tambah
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white border border-cyan-100 rounded-md p-2">
                  <select
                    value={it.barang_id}
                    onChange={(e) => onSelectBarang(idx, e.target.value)}
                    className="border border-cyan-200 px-2 py-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value={0}>Pilih Barang</option>
                    {barangList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.kode_barang} — {b.nama_barang}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={it.qty}
                    min={1}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      const s = items[idx]?.availableStock;
                      if (typeof s === 'number' && q > s) {
                        setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, stockError: `Maksimum ${s}` } : it)));
                        pushToast('error', `Stok tidak mencukupi. Stok tersedia: ${s}`);
                        return;
                      }
                      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, stockError: undefined } : it)));
                      updateItem(idx, { qty: q });
                    }}
                    className="w-24 border border-cyan-200 px-3 py-2 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />

                  <input
                    type="number"
                    value={it.harga}
                    min={0}
                    onChange={(e) => updateItem(idx, { harga: Number(e.target.value) })}
                    className="w-32 border border-cyan-200 px-3 py-2 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />

                  <div className="w-40 text-right px-2 font-semibold text-slate-900">
                    {(Number(it.subtotal) || 0).toLocaleString("id-ID")}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="px-3 py-2 border border-rose-300 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100"
                    title="Hapus item"
                  >
                    ✕
                  </button>
                  {items[idx]?.stockError && (
                    <div className="text-xs text-rose-700 ml-auto">{items[idx]?.stockError}</div>
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-sm text-slate-500">Belum ada item. Klik "Tambah" untuk menambahkan.</div>
              )}
            </div>
          </div>
        </div>

            <div className="px-6 md:px-7 py-4 bg-slate-50/60 border-t border-cyan-100 flex items-center justify-between">
              <div className="text-sm text-slate-600">Grand Total</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">{total.toLocaleString("id-ID")}</span>
                <button type="button" onClick={() => router.push("/penjualan")} className="px-3 py-2 border rounded-md">Batal</button>
                <button
                  type="submit"
                  disabled={loading || !noFaktur || !customer || items.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"/></svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>Process Payment</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
