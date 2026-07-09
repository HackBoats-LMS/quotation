import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session?.user?.email) redirect("/auth/login");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
      <p className="text-slate-500">Feature disabled during schema migration.</p>
    </div>
  );
}
