import Link from "next/link";
import { 
  FileUp, 
  Map, 
  Zap, 
  FileText, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowRight,
  LayoutDashboard,
  Coins,
  Shield,
  Layers
} from "lucide-react";

export const metadata = {
  title: "Q-Tool | Enterprise Quotation Automation",
  description: "Automate quotation generation while maintaining your exact brand design and PDF layout.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-900/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Q-Tool
            </span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-900/20"></div>
        <div className="absolute bottom-0 right-1/4 -z-10 h-80 w-80 rounded-full bg-zinc-300/30 blur-3xl dark:bg-zinc-800/10"></div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Enterprise Quotation Platform
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            Automate Quotation Generation.{" "}
            <span className="bg-gradient-to-r from-zinc-600 via-zinc-800 to-zinc-950 bg-clip-text text-transparent dark:from-zinc-400 dark:via-zinc-200 dark:to-zinc-50">
              Keep Your Exact Design.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Ditch manual template adjustments. Upload your existing business quotation PDFs, visually map your fields, and automate quote generation with zero design trade-offs.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Access Platform
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-zinc-200/30 bg-zinc-100/50 py-20 dark:border-zinc-900/50 dark:bg-zinc-950/20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Three Steps to Automation
            </h2>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              How businesses configure and scale their quotation workflows.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute top-6 right-8 text-4xl font-extrabold text-zinc-100 dark:text-zinc-800">
                01
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                <FileUp className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Upload Your Template
          </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Import your standard PDF invoice or quotation template exactly as you send it to clients today.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute top-6 right-8 text-4xl font-extrabold text-zinc-100 dark:text-zinc-800">
                02
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Map Quotation Fields
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Overlay interactive variables—like date, total, and tables—on the visual coordinate canvas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="absolute top-6 right-8 text-4xl font-extrabold text-zinc-100 dark:text-zinc-800">
                03
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Generate Instantly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Fill out quote information via dynamic forms and export custom-branded PDFs in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Platform Features
            </h2>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Engineered with focus, speed, and business logic in mind.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                Preserve Existing Layouts
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Keep the precise look, logo positioning, and styling details of your current client documents.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-880/80 dark:bg-zinc-900/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                Customer Management
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Maintain client details and default address presets for lightning-fast quotation inputs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-880/80 dark:bg-zinc-900/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                Quotation Archiving
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Store, filter, and track status records for all generated quotes inside an organized dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-880/80 dark:bg-zinc-900/40 font-sans">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                Professional PDF Engine
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Generate high-quality vector printouts dynamically using server-side overlays.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-880/80 dark:bg-zinc-900/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                Rapid Creation
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Standardize table entry and automatic subtotal math for rapid multi-item creations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-zinc-200/50 bg-zinc-100/50 py-20 dark:border-zinc-900/50 dark:bg-zinc-950/20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                Immediate Business Benefits
              </h2>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                How streamlining quotation workflows directly impacts business operations.
              </p>

              <div className="mt-8 space-y-4">
                {/* Benefit 1 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                    <span className="text-[10px] font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Save Time</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Reduce manual field typing and spacing corrections to under 30 seconds per quote.</p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                    <span className="text-[10px] font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Reduce Manual Work</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Eliminate manual calculations, duplicate inputs, and human arithmetic errors.</p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                    <span className="text-[10px] font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Maintain Existing Designs</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Maintain continuity with established client interactions by protecting legacy formats.</p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
                    <span className="text-[10px] font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Unified Archive</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Keep all historical customer receipts, prices, and line items stored securely in a central hub.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Callout block */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Average generation time savings</p>
                  <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">92% faster</p>
                </div>
              </div>
              <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
                  "Mapping our exact layouts took 5 minutes, and now our operations team creates clean branded quotes on demand."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900/30">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Access Your Quotation Portal
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to start creating professional, automated client quotes mapped to your company's templates.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Login to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-10 dark:border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-zinc-500 dark:text-zinc-500 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Q-Tool. All rights reserved.</p>
          <p className="mt-1">
            Private Enterprise Platform. Invitation Only Access.{" "}
            <Link href="/admin" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
              Admin Console
            </Link>
          </p>
        </div>
      </footer>

    </div>
  );
}
