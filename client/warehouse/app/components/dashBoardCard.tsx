import React from "react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
};

export default function DashboardCard({ title, value, subtitle, icon }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-cyan-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-md bg-cyan-50 text-cyan-600">
          {icon ?? null}
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-700 tracking-wide">{title}</div>
          <div className="mt-1 text-3xl md:text-4xl font-semibold text-slate-900 leading-none">
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          </div>
          {subtitle && <div className="text-sm text-slate-600 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
