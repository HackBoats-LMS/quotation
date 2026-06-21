"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MidnightSky from "@/components/MidnightSky";
import { logoutOwner } from "@/app/auth/actions";
import { uploadTemplate, deleteTemplate } from "./actions";
import { 
  Plus, 
  Trash2, 
  LogOut, 
  FileText, 
  Layers, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  Edit3,
  Upload,
  ArrowRight,
  FolderOpen,
  Atom,
  LayoutDashboard
} from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  pdf_path: string;
  created_at: string;
}

interface TemplatesClientProps {
  initialTemplates: TemplateItem[];
  businessName: string;
  ownerEmail: string;
}

export default function TemplatesClient({ 
  initialTemplates, 
  businessName, 
  ownerEmail 
}: TemplatesClientProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [nameInput, setNameInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const router = useRouter();
  const [isPendingUpload, startUploadTransition] = useTransition();
  const [isPendingLogout, startLogoutTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nameInput.trim()) {
      setError("Please enter a template name.");
      return;
    }
    if (!fileInput) {
      setError("Please select a PDF file.");
      return;
    }
    if (fileInput.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("name", nameInput.trim());
    formData.append("file", fileInput);

    startUploadTransition(async () => {
      const result = await uploadTemplate(formData);
      if (result.success) {
        setSuccess(`Successfully uploaded template "${nameInput}".`);
        setNameInput("");
        setFileInput(null);
        setShowUploadForm(false);
        // Clear input element manually
        const fileEl = document.getElementById("file-input") as HTMLInputElement;
        if (fileEl) fileEl.value = "";
        
        router.refresh();
        // Optimistic state sync
        setTimeout(async () => {
          // Re-fetch templates or refresh list
          router.refresh();
        }, 500);
      } else {
        setError(result.error || "Failed to upload template.");
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;

    setError(null);
    setSuccess(null);
    setDeletingId(id);

    try {
      const result = await deleteTemplate(id);
      if (result.success) {
        setSuccess(`Successfully deleted template "${name}".`);
        setTemplates(prev => prev.filter(t => t.id !== id));
        router.refresh();
      } else {
        setError(result.error || "Failed to delete template.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
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
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Dash</span>
        </Link>
        <Link href="/dashboard/templates" className="flex flex-col items-center gap-1.5 text-white">
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
                  className="text-zinc-400 hover:text-white transition-colors border-b-2 border-transparent pb-1"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/templates" 
                  className="text-white drop-shadow-sm border-b-2 border-indigo-500 pb-1"
                >
                  Templates
                </Link>
              </nav>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isPendingLogout}
              className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Templates Content */}
        <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-28 sm:pt-32 pb-32 sm:pb-16 flex-1">
        
        {/* Banner header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 drop-shadow-sm">
              Quotation Templates
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Manage your company quotation layout formats for {businessName}.
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            <Plus className="h-4 w-4" />
            Upload PDF Template
          </button>
        </div>

        {/* Feedback Banners */}
        <div className="mt-6 space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Conditional Upload Drawer */}
        {showUploadForm && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl transition-all">
            <h3 className="text-lg font-bold text-white drop-shadow-sm">
              Upload New Template
            </h3>
            <form onSubmit={handleUploadSubmit} className="mt-6 space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Standard Service Invoice, Product Quotation v2"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-black/40 mt-3 py-3 px-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:bg-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isPendingUpload}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Quotation PDF File
                </label>
                <div className="mt-3 flex items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-black/20 px-6 py-8 transition-colors hover:border-white/20 hover:bg-black/40">
                  <div className="space-y-2 text-center">
                    <Upload className="mx-auto h-8 w-8 text-indigo-400/80 drop-shadow-lg" />
                    <div className="flex text-sm text-zinc-400 justify-center">
                      <label className="relative cursor-pointer rounded-md font-bold text-white hover:text-indigo-300 transition-colors">
                        <span>Click to upload a PDF</span>
                        <input
                          id="file-input"
                          type="file"
                          accept=".pdf"
                          required
                          onChange={handleFileChange}
                          className="sr-only"
                          disabled={isPendingUpload}
                        />
                      </label>
                    </div>
                    {fileInput ? (
                      <p className="text-sm text-indigo-400 font-medium">
                        Selected: {fileInput.name} ({(fileInput.size / 1024).toFixed(1)} KB)
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500">PDF documents only (Max 5MB)</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isPendingUpload}
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:scale-100"
                >
                  {isPendingUpload ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading PDF...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Save Template
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setError(null);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Templates Grid Area */}
        <div className="mt-12">
          {templates.length === 0 ? (
            /* Empty state */
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/20 bg-black/40 backdrop-blur-xl p-16 text-center transition-all hover:border-white/30">
              <FolderOpen className="mx-auto h-12 w-12 text-zinc-500 drop-shadow-lg" />
              <h3 className="mt-6 text-xl font-bold text-white drop-shadow-sm">No Templates Available</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                You haven't uploaded any quotation PDF layouts yet. Click upload to get started.
              </p>
            </div>
          ) : (
            /* List / Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="group relative overflow-hidden rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 shadow-2xl transition-all hover:bg-white/[0.04] hover:border-white/20 flex flex-col justify-between"
                >
                  {/* Glass Edge Highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Animated Glow */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-indigo-400 shadow-inner border border-white/5">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight line-clamp-1 drop-shadow-sm">
                      {template.name}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-400 font-medium">
                      Uploaded on {new Date(template.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="relative z-10 mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-col gap-2 sm:gap-3">
                    <div className="flex gap-2 sm:gap-3 justify-between">
                      {/* View PDF */}
                      <a
                        href={template.pdf_path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <ExternalLink className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        View PDF
                      </a>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        disabled={deletingId === template.id}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                      >
                        {deletingId === template.id ? (
                          <Loader2 className="h-3 sm:h-3.5 w-3 sm:w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>

                    {/* Open Editor Button */}
                    <Link
                      href={`/dashboard/templates/editor/${template.id}`}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black transition-all hover:bg-zinc-200 hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    >
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Open Editor
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      </div>

    </div>
  );
}
