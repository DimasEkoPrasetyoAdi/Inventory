"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar"; 
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL;

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
};

type PembelianDetail = {
  id?: number;
  beli_header_id?: number;
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

export default function PembelianDetailPage() {
  const params = useParams();
  const { slug } = params; 
  const [pembelian, setPembelian] = useState<Pembelian | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchPembelianDetail(slug);
  }, [slug]);

  const fetchPembelianDetail = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      const res = await fetch(`${BASE}/pembelian/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Gagal mengambil data pembelian");

      setPembelian(data.data);
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-5">Detail Pembelian</h1>

          {loading ? (
            <div className="inline-flex items-center gap-2 text-slate-700">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"/></svg>
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">{error}</div>
          ) : !pembelian ? (
            <div className="text-slate-600">Tidak ada data</div>
          ) : (
            <div className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
              <div className="p-5 md:p-6 border-b border-cyan-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                    <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    {pembelian.no_faktur}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                    <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z" stroke="currentColor" strokeWidth="2"/></svg>
                    {pembelian.supplier}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-50 border border-cyan-200 text-slate-900 font-semibold">
                    Rp {pembelian.total?.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                    <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    {new Date(pembelian.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-5 md:p-6">
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
                    {(pembelian.details ?? []).map((d) => (
                      <tr key={d.barang_id} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                        <td className="p-3 align-middle font-medium text-slate-900">{d.barang?.kode_barang ?? "-"}</td>
                        <td className="p-3 align-middle text-slate-800">{d.barang?.nama_barang ?? "-"}</td>
                        <td className="p-3 align-middle text-right">{d.qty ?? 0}</td>
                        <td className="p-3 align-middle text-right">{d.harga?.toLocaleString() ?? "0"}</td>
                        <td className="p-3 align-middle text-right font-semibold text-slate-900">{d.subtotal?.toLocaleString() ?? "0"}</td>
                      </tr>
                    ))}
                    {(pembelian.details ?? []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">Tidak ada detail barang</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
