// app/barang/[slug]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

type Barang = {
  id?: number | string;
  kode_barang?: string;
  nama_barang?: string;
  deskripsi?: string;
  satuan?: string;
  harga_beli?: number;
  harga_jual?: number;
  created_at?: string;
  updated_at?: string;
};

const BASE = process.env.NEXT_PUBLIC_URL
function unwrap<T = any>(payload: any): T | null {
  if (!payload) return null;
  if (payload && typeof payload === "object" && "data" in payload) return payload.data ?? null;
  return payload as T;
}

async function getBarangById(id: string): Promise<Barang | null> {
  if (!id) return null;
  const url = `${BASE}/barang/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    // 404 -> not found
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("Get barang failed", res.status, text);
      return null;
    }
    const json = await res.json().catch(() => null);
    return unwrap<Barang>(json) as Barang | null;
  } catch (e) {
    console.error("Get barang error", e);
    return null;
  }
}

export default async function BarangDetailPage(props: { params: { slug: string } | Promise<{ slug: string }> }) {

  const resolved = await props.params;
  const slug = String(resolved?.slug ?? "");

  const barang = await getBarangById(slug);
  if (!barang) return notFound();

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="mt-4 mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Detail Barang</h1>
      </div>

      <div className="bg-white rounded-xl border border-cyan-100 shadow-sm">
        <div className="p-6 md:p-7">
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-cyan-100">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">{barang.nama_barang ?? '-'}</h2>
            <div className="flex items-center gap-2 shrink-0">
              {barang.kode_barang && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 bg-white">
                  {barang.kode_barang}
                </span>
              )}
              {barang.satuan && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-cyan-200 text-cyan-700 bg-cyan-50">
                  {barang.satuan}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 pt-5">
            <Field label="Kode" value={barang.kode_barang ?? "-"} />
            <Field label="Satuan" value={<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-cyan-200 text-cyan-700 bg-cyan-50">{barang.satuan ?? "-"}</span>} />
            <Field label="Harga Beli" value={barang.harga_beli != null ? formatCurrency(barang.harga_beli) : "-"} />
            <Field label="Harga Jual" value={barang.harga_jual != null ? formatCurrency(barang.harga_jual) : "-"} />
          </div>

          <div className="mt-6">
            <div className="text-xs font-medium tracking-wide uppercase text-slate-500">Deskripsi</div>
            <div className="mt-1 text-slate-900">{barang.deskripsi ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium tracking-wide uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900 font-semibold">{value}</div>
    </div>
  );
}

function formatCurrency(v?: number) {
  if (v == null) return "-";
  try {
    return v.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  } catch {
    return String(v);
  }
}
