"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL;

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
};

type Detail = {
  barang_id: number;
  qty: number;
  harga: number;
  subtotal: number;
  barang?: Barang;
};

type Penjualan = {
  id: number;
  no_faktur: string;
  customer: string;
  total: number;
  created_at: string;
  details?: Detail[];
};

export default function Page() {
  const [items, setItems] = useState<Penjualan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/penjualan`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data ?? []);
      setItems(arr);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal mengambil data penjualan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daftar Penjualan</h1>
            <Link href="/tambah-penjualan" className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md shadow-sm">+ Penjualan</Link>
          </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-slate-600">Tidak ada data penjualan</div>
        ) : (
          <div className="space-y-6">
            {items.map((p, idx) => (
              <div key={p.id} className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-cyan-100 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                      <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {idx + 1}. {p.no_faktur}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                      <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z" stroke="currentColor" strokeWidth="2"/></svg>
                      {p.customer}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-50 border border-cyan-200 text-slate-900 font-semibold">
                      Rp {p.total?.toLocaleString() ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                      <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/penjualan/${p.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-800 hover:bg-cyan-50">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    Detail
                  </Link>
                </div>
                <div className="p-4 md:p-5">
                  <table className="min-w-full text-slate-800 text-sm">
                    <thead className="bg-cyan-50/80">
                      <tr>
                        <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Kode Barang</th>
                        <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Nama Barang</th>
                        <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Qty</th>
                        <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Harga</th>
                        <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(p.details ?? []).map((d) => (
                        <tr key={d.barang_id} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                          <td className="p-3 align-middle font-medium text-slate-900">{d.barang?.kode_barang ?? '-'}</td>
                          <td className="p-3 align-middle text-slate-800">{d.barang?.nama_barang ?? '-'}</td>
                          <td className="p-3 align-middle text-right">{d.qty ?? 0}</td>
                          <td className="p-3 align-middle text-right">{d.harga?.toLocaleString() ?? '0'}</td>
                          <td className="p-3 align-middle text-right font-semibold text-slate-900">{d.subtotal?.toLocaleString() ?? '0'}</td>
                        </tr>
                      ))}
                      {(p.details ?? []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">Tidak ada detail barang</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
