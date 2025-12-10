"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../components/sidebar";

const BASE = process.env.NEXT_PUBLIC_URL;

type HistoryStok = {
  id: number;
  barang_id: number;
  stok_sebelum: number;
  stok_sesudah: number;
  keterangan: string;
  created_at: string;
};

export default function HistoryStokPage() {
  const params = useParams();
  const barangId = params.barang_id;

  const [history, setHistory] = useState<HistoryStok[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      const res = await fetch(`${BASE}/history-stok/${barangId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mengambil history stok");
      }

      setHistory(data.data ?? []);
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">History Stok Barang</h1>

          {error && <div className="mb-4 text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
              <table className="min-w-full text-slate-800 text-sm">
                <thead className="bg-cyan-50/80 border-b border-cyan-100">
                  <tr>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">No</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Stok Sebelum</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Stok Sesudah</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Perubahan</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Keterangan</th>
                    <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => {
                    const delta = (h.stok_sesudah ?? 0) - (h.stok_sebelum ?? 0);
                    const deltaColor = delta > 0 ? "text-green-700 bg-green-50 border-green-200" : delta < 0 ? "text-rose-700 bg-rose-50 border-rose-200" : "text-slate-600 bg-slate-50 border-slate-200";
                    const deltaSign = delta > 0 ? "+" : delta < 0 ? "-" : "";
                    return (
                      <tr key={h.id} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                        <td className="p-3 align-middle text-center">{idx + 1}</td>
                        <td className="p-3 align-middle text-center">{h.stok_sebelum}</td>
                        <td className="p-3 align-middle text-center font-semibold text-slate-900">{h.stok_sesudah}</td>
                        <td className="p-3 align-middle text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${deltaColor}`}>
                            {delta > 0 && (<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M12 5l6 6H6l6-6z" fill="currentColor"/></svg>)}
                            {delta < 0 && (<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M12 19l-6-6h12l-6 6z" fill="currentColor"/></svg>)}
                            {deltaSign}{Math.abs(delta)}
                          </span>
                        </td>
                        <td className="p-3 align-middle text-center text-slate-800">{h.keterangan}</td>
                        <td className="p-3 align-middle text-center text-slate-700">{new Date(h.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">Tidak ada history stok</td>
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
