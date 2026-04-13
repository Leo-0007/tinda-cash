"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Send,
  Clock,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useT();

  const NAV_ITEMS = [
    { href: "/dashboard", label: t("nav.home"), icon: Home },
    { href: "/send", label: t("nav.send"), icon: Send },
    { href: "/history", label: t("nav.history"), icon: Clock },
    { href: "/beneficiaries", label: t("nav.contacts"), icon: Users },
    { href: "/profile", label: t("nav.profile"), icon: User },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050A18] text-white flex">
      {/* SIDEBAR (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.06] bg-[#070C1A]">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Send size={14} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Tinda Cash</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all w-full">
            <LogOut size={18} />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#070C1A]/80 backdrop-blur-xl sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Send size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">Tinda Cash</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              className="relative w-72 bg-[#070C1A] border-r border-white/[0.06] flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Send size={12} className="text-white" />
                  </div>
                  <span className="font-bold text-sm">Tinda Cash</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/40">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                          : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#070C1A]/90 backdrop-blur-xl border-t border-white/[0.06] z-40">
          <div className="flex justify-around py-2">
            {NAV_ITEMS.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
                    isActive ? "text-cyan-400" : "text-white/30"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
