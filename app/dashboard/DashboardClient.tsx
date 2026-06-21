"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutOwner } from "../auth/actions";
import { 
  Building2, 
  LogOut, 
  FileText, 
  Clock, 
  Upload, 
  Layers, 
  Briefcase,
  FileSpreadsheet,
  Atom,
  LayoutDashboard,
  AlertTriangle
} from "lucide-react";

interface BusinessProfile {
  id: string;
  name: string;
  owner_name: string;
  address: string;
  phone: string;
  email: string;
}

interface DashboardClientProps {
  business: BusinessProfile;
  ownerEmail: string;
  templateCount: number;
  quotationCount: number;
}

import MidnightSky from "@/components/MidnightSky";

export default function DashboardClient({ 
  business, 
  ownerEmail, 
  templateCount, 
  quotationCount 
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutOwner();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen relative font-sans text-zinc-50 bg-zinc-950 selection:bg-indigo-500/30">
      <MidnightSky />
      
      {/* Mobile Bottom Navigation Dock */}
      <nav className="sm:hidden fixed bottom-6 inset-x-6 z-50 flex items-center justify-between rounded-full border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl px-8 py-4">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-white">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Dash</span>
        </Link>
        <Link href="/dashboard/templates" className="flex flex-col items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
          <FileText className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Templates</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-red-400">
          <LogOut className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Exit</span>
        </button>
      </nav>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Premium Floating Navbar */}
        <header className="absolute sm:sticky top-6 z-30 mx-4 sm:mx-8 lg:mx-auto lg:w-full lg:max-w-5xl sm:rounded-full sm:border sm:border-white/10 sm:bg-black/40 sm:backdrop-blur-2xl sm:shadow-2xl">
          <div className="flex items-center justify-between sm:px-8 sm:py-3 pt-2">
            
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2.5">
                <Atom className="h-6 w-6 text-white" />
                <span className="text-base font-medium tracking-wide text-white drop-shadow-sm">
                  Quotation Tool
                </span>
              </div>

              {/* Navigation links */}
              <nav className="hidden sm:flex items-center gap-6 text-sm font-medium mt-1">
                <Link 
                  href="/dashboard" 
                  className="text-white drop-shadow-sm border-b-2 border-indigo-500 pb-1"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/templates" 
                  className="text-zinc-400 hover:text-white transition-colors border-b-2 border-transparent pb-1"
                >
                  Templates
                </Link>
              </nav>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-28 sm:pt-32 pb-32 sm:pb-16 flex-1">
          
          {/* Welcome Section */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 drop-shadow-sm">
                Welcome, {business.name}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Logged in as <span className="font-medium text-zinc-300">{ownerEmail}</span>
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Card: Total Templates */}
            <div className="group relative overflow-hidden rounded-[2rem] sm:rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 shadow-2xl transition-all hover:bg-white/[0.04] hover:border-white/20">
              {/* Glass Edge Highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20 animate-pulse" style={{ animationDuration: '4s' }}></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-indigo-400 shadow-inner border border-white/5">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-zinc-500 uppercase">Templates</span>
              </div>
              <div className="relative z-10 mt-6 sm:mt-8">
                <p className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-sm">{templateCount}</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-400">Total Templates Uploaded</p>
              </div>
            </div>

            {/* Card: Total Quotations */}
            <div className="group relative overflow-hidden rounded-[2rem] sm:rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 shadow-2xl transition-all hover:bg-white/[0.04] hover:border-white/20">
              {/* Glass Edge Highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20 animate-pulse" style={{ animationDuration: '5s' }}></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-purple-400 shadow-inner border border-white/5">
                  <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-zinc-500 uppercase">Quotations</span>
              </div>
              <div className="relative z-10 mt-6 sm:mt-8">
                <p className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-sm">{quotationCount}</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-400">Total Quotations Generated</p>
              </div>
            </div>

          </div>

          {/* Dynamic Display Area */}
          <div className="mt-8">
            
            {templateCount === 0 ? (
              
              /* Empty State */
              <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/20 bg-black/40 backdrop-blur-xl p-16 text-center transition-all hover:border-white/30">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent"></div>
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="relative z-10 mt-6 text-xl font-bold text-white drop-shadow-sm">
                  Quotation Template Required
                </h3>
                <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
                  Your workspace is ready, but you need to upload a base PDF template before you can start automating quotations.
                </p>
                <div className="relative z-10 mt-8 flex justify-center">
                  <Link 
                    href="/dashboard/templates"
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                  >
                    <Upload className="h-4 w-4" />
                    Upload PDF Template
                  </Link>
                </div>
              </div>

            ) : (

              /* Normal State */
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">Active Workspace</h3>
                    <p className="text-sm text-zinc-400 mt-1">Your system is initialized and ready</p>
                  </div>
                  <Link 
                    href="/dashboard/templates"
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Template
                  </Link>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Your business profile is fully configured. Navigate to Templates to map variables, configure custom fields, and generate automated quotes.
                  </p>
                </div>
              </div>

            )}

          </div>

        </main>
      </div>
    </div>
  );
}
