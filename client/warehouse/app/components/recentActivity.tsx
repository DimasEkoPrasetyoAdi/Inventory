
"use client";

import React, { useMemo, useState } from "react";

export type Activity = {
  id?: number | string;
  barang_nama?: string;
  kode_barang?: string;
  qty?: number;
  tipe?: "IN" | "OUT" | string;
  tanggal?: string;
  note?: string;
  user_name?: string;
  stok_sebelum?: number;
  stok_sesudah?: number;
};

export default function RecentActivity({ activities }: { activities: Activity[] }) {
  const [filter, setFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  if (!activities || activities.length === 0) {
    return <div className="text-sm text-slate-600">Belum ada aktivitas.</div>;
  }

  const filtered = useMemo(() => {
    const arr = [...activities].sort((a, b) => {
      const ta = a.tanggal ? new Date(a.tanggal).getTime() : 0;
      const tb = b.tanggal ? new Date(b.tanggal).getTime() : 0;
      return tb - ta;
    });
    if (filter === "ALL") return arr;
    return arr.filter((a) => (a.tipe || "").toUpperCase() === filter);
  }, [activities, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of filtered) {
      const key = a.tanggal ? new Date(a.tanggal).toISOString().slice(0, 10) : "";
      const list = map.get(key) || [];
      list.push(a);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">Filter:</span>
        <div className="inline-flex rounded-md border border-cyan-200 bg-white overflow-hidden">
          {(["ALL", "IN", "OUT"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1 text-sm transition-colors ${
                filter === k
                  ? k === "IN"
                    ? "bg-green-600 text-white"
                    : k === "OUT"
                    ? "bg-rose-600 text-white"
                    : "bg-cyan-600 text-white"
                  : "bg-white text-slate-700 hover:bg-cyan-50"
              }`}
            >
              {k === "ALL" ? "Semua" : k === "IN" ? "Masuk" : "Keluar"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {groups.map(([dateKey, rows]) => {
          const dateLabel = dateKey
            ? new Date(dateKey).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Tanggal tidak diketahui";

          return (
            <div key={dateKey}>
              <div className="text-sm font-medium text-slate-700 mb-2">{dateLabel}</div>
              <div className="divide-y rounded-xl border border-cyan-100 bg-white">
                {rows.map((a) => {
                  const isIn = (a.tipe || "").toUpperCase() === "IN";
                  const qtyText = typeof a.qty === "number" ? Math.abs(a.qty).toLocaleString("id-ID") : "-";
                  const time = a.tanggal
                    ? new Date(a.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                    : "";
                  return (
                    <div key={a.id ?? `${a.tanggal}-${a.barang_nama}`}
                         className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-2 hover:bg-cyan-50/50">
                      <div className="md:col-span-2 flex items-center gap-2 text-slate-600">
                        <span className="text-xs w-12">{time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isIn ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"}`}>
                          {isIn ? "Masuk" : "Keluar"}
                        </span>
                      </div>
                      <div className="md:col-span-6 min-w-0">
                        <div className="font-medium truncate text-slate-800">{a.barang_nama ?? "Barang"}</div>
                      </div>
                      <div className="md:col-span-2 text-right font-semibold">
                        <span className={isIn ? "text-green-700" : "text-rose-700"}>{qtyText}</span>
                      </div>
                      <div className="md:col-span-2 text-center text-sm text-slate-600">
                        {typeof a.stok_sesudah === "number" ? `Stok ${a.stok_sesudah}` : "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
