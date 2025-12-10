"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";

const BASE = process.env.NEXT_PUBLIC_URL;

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
  harga_beli: number;
};

type DetailInput = {
  barang_id: number;
  qty: number;
  harga: number;
};

export default function TambahPembelianPage() {
  const [noFaktur, setNoFaktur] = useState("");
  const [supplier, setSupplier] = useState("");
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [details, setDetails] = useState<DetailInput[]>([]);
  // single-row input similar to POS add section
  const [rowBarangId, setRowBarangId] = useState<number>(0);
  const [rowQty, setRowQty] = useState<number>(1);
  const [rowHarga, setRowHarga] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBarang();
  }, []);

  const fetchBarang = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/barang`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBarangList(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRow = () => {
    if (!rowBarangId || rowQty <= 0 || rowHarga < 0) return;
    setDetails([...details, { barang_id: rowBarangId, qty: rowQty, harga: rowHarga }]);
    setRowBarangId(0);
    setRowQty(1);
    setRowHarga(0);
  };

  const handleChangeDetail = (index: number, key: keyof DetailInput, value: any) => {
    const newDetails = [...details];
    newDetails[index][key] = key === "qty" || key === "harga" ? Number(value) : value;
    setDetails(newDetails);
  };

  const handleRemoveDetail = (index: number) => {
    const next = [...details];
    next.splice(index, 1);
    setDetails(next);
  };

  const grandTotal = details.reduce((sum, d) => sum + d.qty * d.harga, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      // decode JWT payload to get user_id
      function parseJwt(t: string): any | null {
        try {
          const parts = t.split(".");
          if (parts.length < 2) return null;
          const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const json = JSON.parse(atob(payload));
          return json;
        } catch {
          return null;
        }
      }
      const payload = parseJwt(token);
      const userId = payload?.user_id ?? payload?.UserID ?? null;
      if (!userId) throw new Error("User ID tidak ditemukan di token.");

      const res = await fetch(`${BASE}/pembelian`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          no_faktur: noFaktur,
          supplier,
          user_id: Number(userId),
          items: details.map(d => ({ barang_id: d.barang_id, qty: d.qty, harga: d.harga })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Gagal menambah pembelian");

      setSuccess("Pembelian berhasil ditambahkan!");
      setNoFaktur("");
      setSupplier("");
      setDetails([]);
      // Redirect ke daftar pembelian
      window.location.href = "/pembelian";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-5">Tambah Pembelian</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-7 space-y-5">
            {/* Header fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">No Faktur</label>
                <input
                  type="text"
                  value={noFaktur}
                  onChange={(e) => setNoFaktur(e.target.value)}
                  className="border border-cyan-200 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="border border-cyan-200 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>
            </div>

            {/* POS-style add row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Barang</label>
                <select
                  value={rowBarangId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setRowBarangId(id);
                    const selected = barangList.find(b => b.id === id);
                    if (selected && !rowHarga) setRowHarga(Number(selected.harga_beli) || 0);
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
                  className="border border-cyan-200 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Harga</label>
                <input
                  type="number"
                  min={0}
                  value={rowHarga}
                  onChange={(e) => setRowHarga(Number(e.target.value))}
                  className="border border-cyan-200 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div className="md:col-span-4">
                <button type="button" onClick={handleAddRow} className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Tambah
                </button>
              </div>
            </div>

            {/* Items table */}
            <div className="mt-4">
              <table className="min-w-full text-slate-800 text-sm">
                <thead className="bg-cyan-50/80">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Kode Barang</th>
                    <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Nama Barang</th>
                    <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Qty</th>
                    <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Harga</th>
                    <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Subtotal</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((d, idx) => {
                    const b = barangList.find(x => x.id === d.barang_id);
                    const subtotal = d.qty * d.harga;
                    return (
                      <tr key={`${d.barang_id}-${idx}`} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                        <td className="p-3 align-middle font-medium text-slate-900">{b?.kode_barang ?? '-'}</td>
                        <td className="p-3 align-middle text-slate-800">{b?.nama_barang ?? '-'}</td>
                        <td className="p-3 align-middle text-right">
                          <input
                            type="number"
                            min={1}
                            value={d.qty}
                            onChange={(e) => handleChangeDetail(idx, 'qty', e.target.value)}
                            className="border border-cyan-200 px-2 py-1 rounded-md w-20 text-right focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </td>
                        <td className="p-3 align-middle text-right">
                          <input
                            type="number"
                            min={0}
                            value={d.harga}
                            onChange={(e) => handleChangeDetail(idx, 'harga', e.target.value)}
                            className="border border-cyan-200 px-2 py-1 rounded-md w-28 text-right focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </td>
                        <td className="p-3 align-middle text-right font-semibold text-slate-900">{subtotal.toLocaleString()}</td>
                        <td className="p-3 align-middle text-center">
                          <button type="button" onClick={() => handleRemoveDetail(idx)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-300 text-rose-700 rounded-md hover:bg-rose-50">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {details.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">Tidak ada item</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals and actions */}
            <div className="px-6 md:px-7 py-4 bg-slate-50/60 border-t border-cyan-100 flex items-center justify-between">
              <div className="text-sm text-slate-600">Grand Total</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">{grandTotal.toLocaleString()}</span>
                <button type="button" className="px-3 py-2 border rounded-md">Cancel</button>
                <button
                  type="submit"
                  disabled={loading || !noFaktur || !supplier || details.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-400 hover:bg-cyan-800 text-white shadow-sm disabled:opacity-60"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
