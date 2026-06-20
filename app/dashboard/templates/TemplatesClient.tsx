"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  FolderOpen
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-550">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          
          {/* Brand & Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-md font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Q-Tool
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex gap-4 text-xs font-semibold">
              <Link 
                href="/dashboard" 
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/templates" 
                className="text-zinc-950 dark:text-zinc-50 border-b border-zinc-900 dark:border-zinc-50 pb-0.5"
              >
                Templates
              </Link>
            </nav>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isPendingLogout}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Banner header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Quotation Templates
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage your company quotation layout formats for {businessName}.
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
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
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/40">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Upload New Template
            </h3>
            <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Standard Service Invoice, Product Quotation v2"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 mt-2 py-2.5 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-50 dark:focus:bg-zinc-950 dark:focus:ring-zinc-50"
                  disabled={isPendingUpload}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Quotation PDF File
                </label>
                <div className="mt-2 flex items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950/30">
                  <div className="space-y-1.5 text-center">
                    <Upload className="mx-auto h-7 w-7 text-zinc-400" />
                    <div className="flex text-xs text-zinc-600 dark:text-zinc-400 justify-center">
                      <label className="relative cursor-pointer rounded-md font-semibold text-zinc-950 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300">
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
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Selected: {fileInput.name} ({(fileInput.size / 1024).toFixed(1)} KB)
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-400">PDF documents only</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPendingUpload}
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
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
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Templates Grid Area */}
        <div className="mt-8">
          {templates.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-zinc-900/10">
              <FolderOpen className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">No Templates Available</h3>
              <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
                You haven't uploaded any quotation PDF layouts yet. Click upload to get started.
              </p>
            </div>
          ) : (
            /* List / Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-900 dark:bg-zinc-900/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-bold text-zinc-950 dark:text-zinc-50 line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-[10px] text-zinc-400">
                      Uploaded on {new Date(template.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                    <div className="flex gap-2 justify-between">
                      {/* View PDF */}
                      <a
                        href={template.pdf_path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-200 py-2 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View PDF
                      </a>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        disabled={deletingId === template.id}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-200 py-2 text-[11px] font-semibold text-red-650 hover:bg-red-50 dark:border-zinc-800 dark:text-red-400 dark:hover:bg-red-950/10"
                      >
                        {deletingId === template.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </button>
                    </div>

                    {/* Open Editor Button */}
                    <Link
                      href={`/dashboard/templates/editor/${template.id}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      <Edit3 className="h-3 w-3" />
                      Open Editor
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
