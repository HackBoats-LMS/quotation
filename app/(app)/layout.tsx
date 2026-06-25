import { ReactNode } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  FileBox,
  Package
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get business name
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, businesses(name)")
    .eq("id", user.id)
    .single();

  const businessName = (profile?.businesses as any)?.name || "My Business";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <FileBox size={20} />
            </div>
            Qotable
          </div>
        </div>
        
        <div className="px-6 py-4 flex flex-col items-start gap-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Workspace</span>
          <span className="text-sm font-semibold truncate w-full">{businessName}</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />}>Dashboard</NavLink>
          <NavLink href="/products" icon={<Package size={18} />}>Products</NavLink>
          <NavLink href="/templates" icon={<FileBox size={18} />}>Templates</NavLink>
          <NavLink href="/customers" icon={<Users size={18} />}>Customers</NavLink>
          <NavLink href="/quotations" icon={<FileText size={18} />}>Quotations</NavLink>
          <NavLink href="/settings/business" icon={<Settings size={18} />}>Settings</NavLink>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <form action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/auth/login");
          }}>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50" type="submit">
              <LogOut size={18} className="mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
