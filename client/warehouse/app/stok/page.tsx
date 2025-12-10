"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Link from "next/link"

const BASE = process.env.NEXT_PUBLIC_URL;

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
};

type Stok = {
  id: number;
  barang_id: number;
  stok_akhir: number;
  barang: Barang;
};

export default function StokPage() {
  const [stokList, setStokList] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchStok();
  }, []);

  const fetchStok = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      const res = await fetch(`${BASE}/stok`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil data stok");
      }

      setStokList(data.data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const filtered = stokList.filter(
    (s) => !q || (s.barang?.nama_barang || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Daftar Stok Barang</h1>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative w-full md:w-[420px]">
              <span className="absolute left-3 top-2.5 text-slate-400" aria-hidden>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M21 21l-5-5m-3 1a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" stroke="currentColor" strokeWidth="1.6"/></svg>
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama barang..."
                className="w-full border border-cyan-200 pl-9 pr-3 py-2 rounded-md bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {error && <div className="mb-4 text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
              <table className="min-w-full text-slate-800 text-sm">
                <thead className="bg-cyan-50/80 border-b border-cyan-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">No</th>
                    <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Kode</th>
                    <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Nama Barang</th>
                    <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Satuan</th>
                    <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Stok Akhir</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                      <td className="p-3 align-middle">{idx + 1}</td>
                      <td className="p-3 align-middle font-medium text-slate-900">{s.barang?.kode_barang}</td>
                      <td className="p-3 align-middle text-slate-800">{s.barang?.nama_barang}</td>
                      <td className="p-3 align-middle">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs">
                          {s.barang?.satuan}
                        </span>
                      </td>
                      <td className="p-3 align-middle text-right font-semibold text-slate-900">{s.stok_akhir}</td>
                      <td className="p-3 align-middle text-center">
                        <Link href={`/history-stok/${s.barang_id}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-cyan-300 text-cyan-800 rounded-md hover:bg-cyan-50">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/></svg>
                          History
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">Tidak ada data stok</td>
                    </tr>
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
