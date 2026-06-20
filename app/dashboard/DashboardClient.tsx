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
  AlertTriangle,
  FileSpreadsheet
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-550">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-md font-bold tracking-tight text-zinc-900 dark:text-zinc-550">
                Q-Tool
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex gap-4 text-xs font-semibold">
              <Link 
                href="/dashboard" 
                className="text-zinc-950 dark:text-zinc-50 border-b border-zinc-900 dark:border-zinc-50 pb-0.5"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/templates" 
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Templates
              </Link>
            </nav>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome, {business.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Logged in as <span className="font-medium text-zinc-700 dark:text-zinc-300">{ownerEmail}</span>
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          
          {/* Card: Total Templates */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Templates</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{templateCount}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Total Templates Uploaded</p>
            </div>
          </div>

          {/* Card: Total Quotations */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Quotations</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{quotationCount}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Total Quotations Generated</p>
            </div>
          </div>

        </div>

        {/* Dynamic Display Area */}
        <div className="mt-8">
          
          {templateCount === 0 ? (
            
            /* Empty State: No template exists */
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                Quotation Template Required
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                You must upload a quotation template before you can start generating quotations.
              </p>
              <div className="mt-6 flex justify-center">
                <Link 
                  href="/dashboard/templates"
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  <Upload className="h-4 w-4" />
                  Upload Quotation Template
                </Link>
              </div>
            </div>

          ) : (

            /* Normal State: List of templates/quotations can be rendered here later */
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Active Workspace</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Template initialized and ready</p>
                </div>
                <Link 
                  href="/dashboard/templates"
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Template
                </Link>
              </div>
              <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your business profile is fully configured. Start mapping quotation variables or configure custom fields.
                </p>
              </div>
            </div>

          )}

        </div>

      </main>
    </div>
  );
}
