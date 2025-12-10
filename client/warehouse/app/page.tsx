"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_URL;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = (data as any)?.message || "Login failed";
        throw new Error(message);
      }

      const token = (data as any)?.data?.token as string | undefined;
      if (!token) {
        throw new Error("Token tidak tersedia");
      }

      try {
        (remember ? localStorage : sessionStorage).setItem("token", token);
      } catch {
      }

      window.location.href = "/dashboard";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyan-50">
      {/* MAIN */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-5">
        {/* IMAGE DESKTOP (kiri) */}
        <section className="relative hidden md:block md:col-span-3">
          <Image
            src="/cover.jpg"
            alt="cover"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 60vw, 100vw"
          />
        </section>
        {/* LOGIN SECTION */}
        <section className="flex items-center justify-center p-6 md:p-12 md:col-span-2">
          <div className="w-full max-w-md">
            {/* Brand + heading */}
            <div className="mb-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-2">
                <h1>
                  <span className="text-3xl font-bold text-slate-800">Inventory Management</span>
                </h1>
              </div>
              <p className="text-slate-600">Find and manage your inventory with easy</p>
            </div>
            <div className="p-2">
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full rounded-md border border-slate-300 pl-10 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-black placeholder-slate-400"
                      required
                      autoFocus
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400" aria-hidden>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" fill="currentColor"/></svg>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full rounded-md border border-slate-300 pl-10 pr-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-black placeholder-slate-400"
                      required
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400" aria-hidden>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" fill="currentColor"/></svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1.5 px-2 py-1 text-xs rounded border text-slate-600 hover:bg-slate-50"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                </div>

                {error && (
                  <p className="text-red-600 text-sm" role="alert">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-600 text-white font-semibold rounded-md px-4 py-3 hover:bg-cyan-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" opacity="0.3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="4" fill="none"/></svg>
                  )}
                  <span>{loading ? "Signing in..." : "Login"}</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="h-12 md:h-14 bg-cyan-800 text-white flex items-center justify-between px-4 md:px-8 text-xs md:text-sm">
        <span>© 2025 Inventory Management All Rights Reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">
            Terms &amp; Condition
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}
