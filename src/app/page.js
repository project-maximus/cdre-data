export default function Home() {
  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#93c5fd_0%,transparent_32%),radial-gradient(circle_at_80%_0%,#fcd34d_0%,transparent_34%),radial-gradient(circle_at_50%_90%,#99f6e4_0%,transparent_30%)]" />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-14 sm:px-10">
        <nav className="mb-12 flex items-center justify-between">
          <span className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-1 text-sm font-semibold tracking-wide text-slate-700 backdrop-blur">
            CDRE DATA
          </span>
          <span className="text-sm text-slate-600">Next.js + Neon + Vercel</span>
        </nav>

        <section className="grid flex-1 items-center gap-10 pb-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Collect, store, and organize links without the clutter.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              A simple data collection workspace powered by Next.js, ready for
              Neon Postgres, and easy to deploy on Vercel.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-slate-700"
              >
                Deploy to Vercel
              </a>
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 bg-white/80 px-6 py-3 text-center font-semibold text-slate-800 transition hover:border-slate-400"
              >
                Next.js Docs
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-900">Starter Checklist</h2>
            <ul className="mt-5 space-y-3 text-slate-700">
              <li className="rounded-lg bg-emerald-50 px-4 py-3">
                . Next.js app initialized with App Router
              </li>
              <li className="rounded-lg bg-emerald-50 px-4 py-3">
                . Tailwind CSS installed and configured
              </li>
              <li className="rounded-lg bg-emerald-50 px-4 py-3">
                . Neon DB client package installed
              </li>
              <li className="rounded-lg bg-amber-50 px-4 py-3">
                . Add your `NEON_DB` value in .env before connecting DB
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
