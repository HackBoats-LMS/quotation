"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteUser, revokeAccess, logoutAdmin } from "./actions";
import { 
  Plus, 
  Trash2, 
  LogOut, 
  Mail, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Loader2,
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import MidnightSky from "@/components/MidnightSky";

interface InvitedUser {
  id: string;
  email: string;
  created_at: string;
}

interface DashboardClientProps {
  initialUsers: InvitedUser[];
}

export default function DashboardClient({ initialUsers }: DashboardClientProps) {
  const [users, setUsers] = useState<InvitedUser[]>(initialUsers);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const router = useRouter();
  const [isPendingInvite, startInviteTransition] = useTransition();
  const [isPendingLogout, startLogoutTransition] = useTransition();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailInput) return;

    startInviteTransition(async () => {
      const result = await inviteUser(emailInput);
      if (result.success) {
        setSuccess(`Successfully invited ${emailInput}.`);
        setEmailInput("");
        // Optimistically reload list by refreshing page data or fetching
        router.refresh();
        // We will update local state by refetching or relying on refresh
        // To make it instant, let's also fetch updated data or update list manually
        // Since we refresh, Server Component will run again and pass new props. 
        // However, Next.js refresh might take a brief second, so we can also fetch/add
        // or just wait. Let's do a state insert if we can, or let router.refresh handle it.
        // Let's manually add a temporary/optimistic record to state for instant visual feedback:
        setUsers(prev => [
          { 
            id: Math.random().toString(), 
            email: emailInput.trim().toLowerCase(), 
            created_at: new Date().toISOString() 
          },
          ...prev
        ]);
        // Trigger page refresh to sync with DB
        setTimeout(() => router.refresh(), 300);
      } else {
        setError(result.error || "Failed to invite user.");
      }
    });
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;

    setError(null);
    setSuccess(null);
    setRevokingId(id);

    try {
      const result = await revokeAccess(id);
      if (result.success) {
        setSuccess(`Successfully revoked access for ${email}.`);
        setUsers(prev => prev.filter(u => u.id !== id));
        router.refresh();
      } else {
        setError(result.error || "Failed to revoke access.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAdmin();
      router.push("/admin/login");
      router.refresh();
    });
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-zinc-50 bg-zinc-950 selection:bg-indigo-500/30 overflow-x-hidden">
      <MidnightSky />
      <div className="relative z-10 flex flex-col min-h-screen">
      
      {/* Navigation Header */}
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="flex w-full max-w-5xl items-center justify-between sm:rounded-full sm:border sm:border-white/10 sm:bg-white/5 sm:px-4 sm:py-3 sm:backdrop-blur-xl sm:shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-3 px-2">
            <ShieldCheck className="h-6 w-6 text-white shrink-0" />
            <span className="text-base font-bold tracking-wide text-white hidden sm:block">
              Quotation Control Center
            </span>
            <span className="text-base font-bold tracking-wide text-white sm:hidden">
              Control Center
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isPendingLogout}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isPendingLogout ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-28 pb-32 sm:pt-32 sm:pb-16 flex-1">
        {/* Error/Success Banner */}
        <div className="space-y-3 mb-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-medium text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column: Invite Form */}
          <div className="space-y-6 lg:col-span-1 min-w-0">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <h2 className="text-lg font-bold text-white">
                Grant Access
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Authorize a new business owner by entering their email address.
              </p>

              <form onSubmit={handleInvite} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-widest text-zinc-400"
                  >
                    Business Owner Email
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@company.com"
                      className="block w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:bg-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      disabled={isPendingInvite}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPendingInvite || !emailInput}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:scale-100"
                >
                  {isPendingInvite ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Grant Access
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Metrics */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Active Access Grants
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: List of Invited Users */}
          <div className="lg:col-span-2 min-w-0">
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all h-full">
              <div className="px-6 sm:px-8 py-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">
                  Authorized Businesses
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  A list of business owners currently authorized to use the platform.
                </p>
              </div>

              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <Mail className="h-12 w-12 text-white/20" />
                  <p className="mt-4 text-sm font-bold text-white">
                    No active invitations
                  </p>
                  <p className="mt-2 text-xs text-zinc-400 max-w-xs">
                    Grant access on the left to authorize business owners to access the dashboard.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto scrollbar-hide sm:overflow-x-visible">
                  <table className="w-full border-collapse text-left text-sm text-zinc-400 whitespace-nowrap sm:whitespace-normal">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <th scope="col" className="px-6 sm:px-8 py-4">
                          Email Address
                        </th>
                        <th scope="col" className="px-6 sm:px-8 py-4">
                          Date Added
                        </th>
                        <th scope="col" className="px-6 sm:px-8 py-4 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-8 py-5 font-medium text-white">
                            <span className="flex items-center gap-3">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                              {user.email}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="flex items-center gap-2 text-xs text-zinc-400">
                              <Calendar className="h-4 w-4 text-zinc-500" />
                              {formatDate(user.created_at)}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleRevoke(user.id, user.email)}
                              disabled={revokingId === user.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                            >
                              {revokingId === user.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Revoke Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}
