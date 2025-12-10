"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function DashboardImageIcon() {
  return (
    <Image src="/dashboard.png" alt="Dashboard" width={20} height={20} className="w-5 h-5 object-contain" priority />
  );
}

function BoxIcon() {
  return (
     <Image src="/barang.png" alt="Dashboard" width={20} height={20} className="w-5 h-5 object-contain" priority />
  );
}

function StackIcon() {
  return (
    <Image src="/stok.png" alt="Dashboard" width={20} height={20} className="w-5 h-5 object-contain" priority />
  );
}

function PurchaseIcon() {
  return (
     <Image src="/pembelian.png" alt="Dashboard" width={20} height={20} className="w-5 h-5 object-contain" priority />
  );
}

function SaleIcon() {
  return (
     <Image src="/penjualan.png" alt="Dashboard" width={20} height={20} className="w-5 h-5 object-contain" priority />
  );
}

function ReportIcon() {
  return (
    <Image src="/laporan.png" alt="Dashboard" width={20} height={20} className="w-5 h-5 object-contain" priority />
  );
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardImageIcon() },
  { label: "Barang", href: "/barang", icon: BoxIcon() },
  { label: "Stok", href: "/stok", icon: StackIcon() },
  { label: "Pembelian", href: "/pembelian", icon: PurchaseIcon() },
  { label: "Penjualan", href: "/penjualan", icon: SaleIcon() },
  { label: "Laporan", href: "/laporan", icon: ReportIcon() },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  function handleLogout() {
    try {
      if (typeof window !== "undefined") localStorage.removeItem("token");
    } catch {}
    router.push("/");
  }

  return (
    <aside className={`sticky top-0 flex flex-col h-screen bg-cyan-50/80 border-r border-cyan-100 transition-all duration-200 ${collapsed ? "w-20" : "w-64"}`} aria-label="Sidebar">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-700 to-cyan-600 text-white shadow-sm">
          <div className="shrink-0">
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">Inventory apps</h1>
            </div>
          )}
       

        <button aria-pressed={collapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((s) => !s)} className="p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60">
          <svg className={`w-5 h-5 transform transition-transform ${collapsed ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-1 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md mx-2 transition-colors ${active ? "bg-white text-cyan-800 ring-1 ring-cyan-300 shadow-sm" : "text-slate-800 hover:bg-cyan-100"}`}
                >
                  <span className={`flex items-center justify-center shrink-0 w-7 h-7 ${active ? "text-cyan-700" : "text-cyan-600 group-hover:text-cyan-700"}`} aria-hidden>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="text-sm font-semibold tracking-wide">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 py-3 mt-auto pb-6">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2 rounded-md mx-2 transition-colors text-slate-800 hover:bg-cyan-100 focus:outline-none"
          title="Logout"
        >
          <span className="flex items-center justify-center shrink-0 w-7 h-7 text-rose-600" aria-hidden>
            <Image src="/power.png" alt="Logout" width={20} height={20} className="w-5 h-5 object-contain" priority />
          </span>
          {!collapsed && <span className="text-sm font-semibold tracking-wide">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
