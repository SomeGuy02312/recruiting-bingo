function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Coming Soon
        </p>
        <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
          Recruiting Bingo
        </h1>
        <p className="text-lg text-slate-600 md:text-xl">
          This will become the landing page for the shared bingo card experience. We&apos;ll add the
          full real-time UI once the worker and shared packages are ready.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            In the meantime, we&apos;re aligning the architecture so the Cloudflare Worker, Durable
            Objects, and shared logic can plug in seamlessly.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
