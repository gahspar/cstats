import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 pb-16 lg:pb-0">
          <Header />
          <main className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-5 lg:px-6">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
