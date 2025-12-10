"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";

const BASE = process.env.NEXT_PUBLIC_URL

type StokRow = { barang_id: number; kode_barang: string; nama_barang: string; satuan: string; stok_akhir: number; nilai?: number };
type TxRow = { id: number; no_faktur: string; tanggal: string; partner?: string; total: number };

export default function LaporanPage() {
  const [tab, setTab] = useState<"stok" | "penjualan" | "pembelian">("stok");
  const [loading, setLoading] = useState(false);
  const [stokData, setStokData] = useState<StokRow[]>([]);
  const [txData, setTxData] = useState<TxRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [asOf, setAsOf] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [start, setStart] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10);
  });
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0,10));

  useEffect(() => {
    fetchCurrent();
  }, [tab]);

  async function fetchCurrent() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia");

      if (tab === "stok") {
        const res = await fetch(`${BASE}/laporan/stok`, { headers: { Authorization: `Bearer ${token}` }});
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "Failed");
        const rows: StokRow[] = (json.data ?? []).map((s: any) => ({
          barang_id: s.barang_id,
          kode_barang: s.barang?.kode_barang ?? "",
          nama_barang: s.barang?.nama_barang ?? "",
          satuan: s.barang?.satuan ?? "",
          stok_akhir: s.stok_akhir ?? 0,
          nilai: (s.barang?.harga_beli ?? 0) * (s.stok_akhir ?? 0),
        }));
        setStokData(rows);
        setSummary(json.meta ?? null);
      } else if (tab === "penjualan") {
        const res = await fetch(`${BASE}/laporan/penjualan?start_date=${start}&end_date=${end}`, { headers: { Authorization: `Bearer ${token}` }});
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "Failed");
        const rows: TxRow[] = (json.data ?? []).map((r: any) => ({
          id: r.id,
          no_faktur: r.no_faktur,
          tanggal: r.created_at,
          partner: r.customer ?? "-",
          total: r.total ?? 0,
        }));
        setTxData(rows);
        setSummary(json.meta ?? null);
      } else if (tab === "pembelian") {
        const res = await fetch(`${BASE}/laporan/pembelian?start_date=${start}&end_date=${end}`, { headers: { Authorization: `Bearer ${token}` }});
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "Failed");
        const rows: TxRow[] = (json.data ?? []).map((r: any) => ({
          id: r.id,
          no_faktur: r.no_faktur,
          tanggal: r.created_at,
          partner: r.supplier ?? "-",
          total: r.total ?? 0,
        }));
        setTxData(rows);
        setSummary(json.meta ?? null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV(filename: string, rows: any[]) {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(","),
      ...rows.map(r => keys.map(k => {
        const v = r[k];
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-white text-slate-900">
        <h1 className="text-2xl font-semibold mb-4">Laporan</h1>

        <div className="mb-4 flex gap-2">
          <button onClick={() => setTab("stok")} className={`px-3 py-1 rounded ${tab==='stok' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Stok</button>
          <button onClick={() => setTab("penjualan")} className={`px-3 py-1 rounded ${tab==='penjualan' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Penjualan</button>
          <button onClick={() => setTab("pembelian")} className={`px-3 py-1 rounded ${tab==='pembelian' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Pembelian</button>
        </div>

        <div className="mb-4">
          {tab === "stok" ? (
            <div className="flex items-center gap-2">
              <label className="text-sm">As of</label>
              <input type="date" value={asOf} onChange={(e)=>setAsOf(e.target.value)} className="border px-2 py-1 rounded"/>
              <button onClick={fetchCurrent} className="px-3 py-1 bg-sky-600 text-white rounded">Refresh</button>
              <button onClick={()=>exportCSV(`laporan-stok-${asOf}.csv`, stokData)} className="px-3 py-1 border rounded">Export CSV</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-sm">Start</label>
              <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} className="border px-2 py-1 rounded"/>
              <label className="text-sm">End</label>
              <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} className="border px-2 py-1 rounded"/>
              <button onClick={fetchCurrent} className="px-3 py-1 bg-sky-600 text-white rounded">Refresh</button>
              <button onClick={()=>exportCSV(`${tab}-${start}-${end}.csv`, txData)} className="px-3 py-1 border rounded">Export CSV</button>
            </div>
          )}
        </div>

        {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
          <>
            {summary && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(summary).map(([k,v])=>(
                  <div key={k} className="p-4 border rounded">
                    <div className="text-sm text-slate-500">{k.replace(/_/g,' ')}</div>
                    <div className="text-xl font-semibold">{typeof v === 'number' ? v.toLocaleString() : String(v)}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === "stok" ? (
              <table className="min-w-full border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">No</th>
                    <th className="p-2 text-left">Kode</th>
                    <th className="p-2 text-left">Nama</th>
                    <th className="p-2 text-left">Satuan</th>
                    <th className="p-2 text-right">Stok</th>
                    <th className="p-2 text-right">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {stokData.map((r, i)=>(
                    <tr key={r.barang_id} className="hover:bg-slate-50">
                      <td className="p-2">{i+1}</td>
                      <td className="p-2">{r.kode_barang}</td>
                      <td className="p-2">{r.nama_barang}</td>
                      <td className="p-2">{r.satuan}</td>
                      <td className="p-2 text-right">{r.stok_akhir}</td>
                      <td className="p-2 text-right">{(r.nilai ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full border">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">No</th>
                    <th className="p-2 text-left">No Faktur</th>
                    <th className="p-2 text-left">Tanggal</th>
                    <th className="p-2 text-left">Partner</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {txData.map((r, i)=>(
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-2">{i+1}</td>
                      <td className="p-2">{r.no_faktur}</td>
                      <td className="p-2">{new Date(r.tanggal).toLocaleDateString()}</td>
                      <td className="p-2">{r.partner ?? "-"}</td>
                      <td className="p-2 text-right">{(r.total ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>
    </div>
  );
}
