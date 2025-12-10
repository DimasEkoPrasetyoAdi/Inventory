"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL;


export default function UpdateBarangPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama_barang: "",
    kode_barang: "",
    deskripsi: "",
    satuan: "",
    harga_beli: "",
    harga_jual: "",
  });

  useEffect(() => {
    if (!id) {
      setError("ID barang tidak tersedia");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchBarang = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/barang/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Gagal mengambil data barang");
        }

        const b = data.data;
        setForm({
          nama_barang: b.nama_barang || "",
          kode_barang: b.kode_barang || "",
          deskripsi: b.deskripsi || "",
          satuan: b.satuan || "",
          harga_beli: b.harga_beli?.toString() || "",
          harga_jual: b.harga_jual?.toString() || "",
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchBarang();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak tersedia. Silahkan login.");

      const res = await fetch(`${BASE}/barang/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama_barang: form.nama_barang,
          kode_barang: form.kode_barang,
          deskripsi: form.deskripsi,
          satuan: form.satuan,
          harga_beli: Number(form.harga_beli),
          harga_jual: Number(form.harga_jual),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memperbarui barang");
      }

      router.push("/barang");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat update barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-5">Update Barang</h1>

      {error && <div className="mb-4 text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
      {loading && !form.nama_barang && <div className="text-slate-600">Memuat data barang...</div>}

      {!loading && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-7 space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Nama Barang</label>
                <input
                  name="nama_barang"
                  value={form.nama_barang}
                  onChange={handleChange}
                  className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Kode Barang</label>
                  <input
                    name="kode_barang"
                    value={form.kode_barang}
                    onChange={handleChange}
                    className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Satuan</label>
                  <input
                    name="satuan"
                    value={form.satuan}
                    onChange={handleChange}
                    className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Harga Beli</label>
                  <input
                    type="number"
                    name="harga_beli"
                    value={form.harga_beli}
                    onChange={handleChange}
                    className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium tracking-wide uppercase text-slate-500 mb-1">Harga Jual</label>
                  <input
                    type="number"
                    name="harga_jual"
                    value={form.harga_jual}
                    onChange={handleChange}
                    className="w-full border border-cyan-200 px-3 py-2 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-7 py-4 bg-slate-50/60 border-t border-cyan-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"/></svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Update
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
