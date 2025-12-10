"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";


const BASE = (process.env.NEXT_PUBLIC_URL);

export default function BarangClientPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/barang`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data ?? []);
      setItems(arr);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter(i => !q || (i.nama_barang || "").toLowerCase().includes(q.toLowerCase()));

  function formatRupiah(n: number) {
    if (isNaN(n)) return "-";
    return `Rp ${n.toLocaleString('id-ID')}`;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daftar Barang</h1>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full md:w-[420px]">
          <span className="absolute left-3 top-2.5 text-slate-400" aria-hidden>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M21 21l-5-5m-3 1a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" stroke="currentColor" strokeWidth="1.6"/></svg>
          </span>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Cari nama..."
            className="w-full border border-cyan-200 pl-9 pr-3 py-2 rounded-md bg-white text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <Link
          href="/tambah-barang"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-800 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="font-semibold">Tambah</span>
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-slate-800 text-sm">
            <thead className="bg-cyan-50/80 border-b border-cyan-100">
              <tr>
                <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">No</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Kode</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Nama</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wide uppercase text-slate-600">Satuan</th>
                <th className="p-3 text-right text-xs font-semibold tracking-wide uppercase text-slate-600">Harga Jual</th>
                <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Aksi</th>
                <th className="p-3 text-center text-xs font-semibold tracking-wide uppercase text-slate-600">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => (
                <tr key={b.id} className="hover:bg-cyan-50/60 odd:bg-white even:bg-cyan-50/30">
                  <td className="p-3 align-middle">{idx+1}</td>
                  <td className="p-3 align-middle font-medium text-slate-900">{b.kode_barang}</td>
                  <td className="p-3 align-middle text-slate-800">{b.nama_barang}</td>
                  <td className="p-3 align-middle">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs">
                      {b.satuan}
                    </span>
                  </td>
                  <td className="p-3 align-middle text-right font-semibold text-slate-900">{formatRupiah(Number(b.harga_jual))}</td>
                  <td className="p-3 align-middle text-center">
                    <Link href={`/barang/${b.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-cyan-300 text-cyan-800 rounded-md hover:bg-cyan-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.2"/></svg>
                      Lihat
                    </Link>
                  </td>
                  <td className="p-3 align-middle text-center">
                    <Link href={`/update-barang?id=${encodeURIComponent(b.id)}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-cyan-300">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.2"/></svg>
                      Update
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">Tidak ada barang</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    
  );
}
