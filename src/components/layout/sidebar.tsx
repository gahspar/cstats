"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Crosshair } from "lucide-react";
import { useState } from "react";
import { navItems, productAreas } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("sticky top-0 hidden h-screen shrink-0 border-r border-slate-800 bg-[#090d13]/95 transition-[width] lg:block", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-400/25 bg-sky-400/10">
            <Crosshair className="h-4 w-4 text-sky-300" />
          </span>
          <span className={cn(collapsed && "hidden")}>
            <span className="block text-sm font-semibold text-slate-50">CS STATS</span>
            <span className="block text-[11px] text-slate-500">Counter-Strike analytics</span>
          </span>
        </Link>
        <Button
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          variant="ghost"
          className={cn("h-8 w-8 px-0", collapsed && "hidden")}
          onClick={() => setCollapsed((current) => !current)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <nav className="space-y-6 px-3 py-4">
        <div>
          <div className={cn("px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600", collapsed && "hidden")}>
            Navegacao
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-md px-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100",
                    collapsed && "justify-center",
                    active && "bg-sky-400/10 text-sky-100 ring-1 ring-sky-400/15",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span className={cn(collapsed && "hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={cn(collapsed && "hidden")}>
          <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Fontes
          </div>
          <div className="space-y-1">
            {productAreas.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex h-9 items-center gap-3 rounded-md px-2 text-sm text-slate-500"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
        {collapsed ? (
          <Button aria-label="Expandir sidebar" variant="ghost" className="h-9 w-full px-0" onClick={() => setCollapsed(false)}>
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        ) : null}
      </nav>
    </aside>
  );
}
