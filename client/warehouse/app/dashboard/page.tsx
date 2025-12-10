"use client";

import React, { useEffect, useState } from "react";
import DashBoardCard from "../components/dashBoardCard";
import RecentActivity, { Activity } from "../components/recentActivity";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL;

export default function InventoriesDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalBarang, setTotalBarang] = useState(0);
  const [totalStok, setTotalStok] = useState(0);
  const [penjualanToday, setPenjualanToday] = useState(0);
  const [pembelianToday, setPembelianToday] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` } as HeadersInit;
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10);

    async function fetchJSON<T>(url: string): Promise<any> {
      const res = await fetch(url, { headers, cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || `HTTP ${res.status}`);
      return json;
    }

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [barangRes, stokRes, jualRes, beliRes, histRes] = await Promise.all([
          fetch(`${BASE}/barang`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
          fetchJSON(`${BASE}/stok`),
          fetchJSON(`${BASE}/penjualan?start_date=${ymd}&end_date=${ymd}`),
          fetchJSON(`${BASE}/pembelian?start_date=${ymd}&end_date=${ymd}`),
          fetchJSON(`${BASE}/history-stok`),
        ]);

        const barangArr = Array.isArray(barangRes) ? barangRes : (barangRes?.data ?? []);
        setTotalBarang(barangArr.length || 0);

        const stokArr = stokRes?.data ?? [];
        const totalStokCalc = (stokArr as any[]).reduce((sum, it) => sum + Number(it.stok_akhir ?? 0), 0);
        setTotalStok(totalStokCalc);

        const jualArr = jualRes?.data ?? [];
        setPenjualanToday(jualArr.length || 0);

        const beliArr = beliRes?.data ?? [];
        setPembelianToday(beliArr.length || 0);

        const histArr = histRes?.data ?? [];
        const acts: Activity[] = (histArr as any[]).slice(0, 8).map((h) => ({
          id: h.id,
          barang_nama: h.barang?.nama_barang ?? String(h.barang_id ?? ""),
          kode_barang: h.barang?.kode_barang ?? "",
          qty: h.jumlah ?? 0,
          tipe: (h.jenis_transaksi || "").toLowerCase() === "masuk" ? "IN" : "OUT",
          tanggal: h.created_at,
          note: h.keterangan,
          user_name: h.user?.full_name ?? h.user?.username ?? "",
          stok_sebelum: h.stok_sebelum,
          stok_sesudah: h.stok_sesudah,
        }));
        setActivities(acts);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Dashboard</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <DashBoardCard title="Total Barang" value={totalBarang} subtitle="Produk terdaftar" icon={<BoxIcon/>} />
            <DashBoardCard title="Total Stok" value={totalStok} subtitle="Kuantitas keseluruhan" icon={<StackIcon/>} />
            <DashBoardCard title="Penjualan Hari Ini" value={penjualanToday} subtitle="Transaksi keluar hari ini" icon={<SaleIcon/>} />
            <DashBoardCard title="Pembelian Hari Ini" value={pembelianToday} subtitle="Transaksi masuk hari ini" icon={<PurchaseIcon/>} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-cyan-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Aktivitas Terbaru</h2>
          <p className="text-sm text-slate-600 mb-4">Perubahan stok dari transaksi/pembelian/penyesuaian.</p>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 bg-slate-100 rounded"/>
              <div className="h-8 bg-slate-100 rounded"/>
              <div className="h-8 bg-slate-100 rounded"/>
            </div>
          ) : (
            <RecentActivity activities={activities} />
          )}
        </div>
      </div>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 16V8l-9-5-9 5v8l9 5 9-5zM12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StackIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PurchaseIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M7 6l1 14h8l1-14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SaleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 10V7a2 2 0 0 0-2-2h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 14l9 7 9-7V7L12 0 3 7v7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 border border-cyan-100 shadow-sm">
      <div className="flex items-start gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-md bg-slate-100"/>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-slate-100 rounded"/>
          <div className="h-6 w-16 bg-slate-100 rounded"/>
          <div className="h-3 w-32 bg-slate-100 rounded"/>
        </div>
      </div>
    </div>
  );
}
