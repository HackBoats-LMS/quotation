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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-md font-bold text-zinc-900 dark:text-zinc-50 sm:text-lg">
                Quotation Control Center
              </h1>
              <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
                Admin Console
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isPendingLogout}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 dark:hover:text-zinc-50"
          >
            {isPendingLogout ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error/Success Banner */}
        <div className="space-y-3 mb-6">
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

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column: Invite Form */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50">
              <h2 className="text-md font-bold text-zinc-900 dark:text-zinc-50">
                Grant Access
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Authorize a new business owner by entering their email address.
              </p>

              <form onSubmit={handleInvite} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                  >
                    Business Owner Email
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@company.com"
                      className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:bg-zinc-950 dark:focus:ring-zinc-50"
                      disabled={isPendingInvite}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPendingInvite || !emailInput}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 dark:focus:ring-offset-zinc-950 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
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
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Active Access Grants
                  </p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: List of Invited Users */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-md font-bold text-zinc-900 dark:text-zinc-50">
                  Authorized Businesses
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  A list of business owners currently authorized to use the platform.
                </p>
              </div>

              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Mail className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                  <p className="mt-4 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    No active invitations
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Grant access on the left to authorize business owners.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/20 dark:text-zinc-400">
                        <th scope="col" className="px-6 py-3.5">
                          Email Address
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Date Added
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-950/10"
                        >
                          <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                            <span className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              {user.email}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(user.created_at)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRevoke(user.id, user.email)}
                              disabled={revokingId === user.id}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/20"
                            >
                              {revokingId === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
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
  );
}
