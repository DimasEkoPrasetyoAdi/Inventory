"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL;

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
};

type PembelianDetail = {
  barang_id: number;
  qty: number;
  harga: number;
  subtotal: number;
  barang?: Barang; 
};

type Pembelian = {
  id: number;
  no_faktur: string;
  supplier: string;
  total: number;
  created_at: string;
  details?: PembelianDetail[]; 
};

export default function PembelianPage() {
  const [pembelianList, setPembelianList] = useState<Pembelian[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPembelian();
  }, []);

  const fetchPembelian = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      const res = await fetch(`${BASE}/pembelian`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Gagal mengambil data pembelian");

      setPembelianList(data.data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daftar Pembelian</h1>
            <Link href="/tambah-pembelian" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Pembelian
            </Link>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>
          ) : pembelianList.length === 0 ? (
            <div className="text-slate-600">Tidak ada data pembelian</div>
          ) : (
            <div className="space-y-6">
              {pembelianList.map((p, idx) => (
                <div key={p.id} className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                  <div className="px-4 md:px-5 py-3 bg-cyan-50/60 border-b border-cyan-100 flex justify-between items-center">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border border-slate-300 text-slate-700 bg-white">{idx + 1}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 bg-white">{p.no_faktur}</span>
                      <span className="text-slate-800">{p.supplier}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-cyan-300 text-cyan-800 bg-cyan-50">Total: {p.total?.toLocaleString() ?? 0}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 bg-white">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M3 9h18" stroke="currentColor" strokeWidth="1.6"/></svg>
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Link href={`/pembelian/${p.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-cyan-300 text-cyan-800 rounded-md hover:bg-cyan-50">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.2"/></svg>
                      Detail
                    </Link>
                  </div>

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
                        <tr key={`${p.id}-${d.barang_id}`} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                          <td className="p-3 align-middle font-medium text-slate-900">{d.barang?.kode_barang ?? "-"}</td>
                          <td className="p-3 align-middle text-slate-800">{d.barang?.nama_barang ?? "-"}</td>
                          <td className="p-3 align-middle text-right">{d.qty ?? 0}</td>
                          <td className="p-3 align-middle text-right">{d.harga?.toLocaleString() ?? "0"}</td>
                          <td className="p-3 align-middle text-right">{d.subtotal?.toLocaleString() ?? "0"}</td>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
