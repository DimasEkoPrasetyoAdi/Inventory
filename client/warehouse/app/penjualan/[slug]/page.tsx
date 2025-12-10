"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../components/sidebar";

const BASE = process.env.NEXT_PUBLIC_URL;

type Barang = {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan?: string;
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

export default function PenjualanDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const id = String(params?.slug ?? "");

  const [data, setData] = useState<Penjualan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchDetail() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silakan login.");

      const res = await fetch(`${BASE}/penjualan/${encodeURIComponent(id)}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Gagal mengambil detail penjualan (${res.status})`);
      }
      const payload: Penjualan = json?.data ?? json; 
      setData(payload);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat mengambil detail penjualan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto">
          
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-5">Detail Penjualan</h1>

          {loading ? (
            <div className="inline-flex items-center gap-2 text-slate-700">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"/></svg>
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">{error}</div>
          ) : !data ? (
            <div className="text-slate-600">Data tidak ditemukan</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-cyan-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                      <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {data.no_faktur}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                      <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z" stroke="currentColor" strokeWidth="2"/></svg>
                      {data.customer}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-50 border border-cyan-200 text-slate-900 font-semibold">
                      Rp {Number(data.total).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-200 text-slate-800">
                      <svg className="w-4 h-4 text-cyan-700" viewBox="0 0 24 24" fill="none"><path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {new Date(data.created_at).toLocaleDateString()}
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
                      {(data.details ?? []).map((d) => (
                        <tr key={d.barang_id} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                          <td className="p-3 align-middle font-medium text-slate-900">{d.barang?.kode_barang ?? '-'}</td>
                          <td className="p-3 align-middle text-slate-800">{d.barang?.nama_barang ?? '-'}</td>
                          <td className="p-3 align-middle text-right">{d.qty}</td>
                          <td className="p-3 align-middle text-right">{Number(d.harga).toLocaleString()}</td>
                          <td className="p-3 align-middle text-right font-semibold text-slate-900">{Number(d.subtotal).toLocaleString()}</td>
                        </tr>
                      ))}
                      {(data.details ?? []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">Tidak ada detail</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-slate-900">{value}</div>
    </div>
  );
}
