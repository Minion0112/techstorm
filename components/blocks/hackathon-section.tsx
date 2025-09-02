import { cn } from "@/lib/utils"

export function HackathonSection({
  className,
}: {
  className?: string
}) {
  return (
    <section className={cn(" text-white py-12 px-6 md:py-16 md:px-8 lg:py-20 h-full w-full flex items-center justify-center", className)}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <div className="mb-6">
            <div
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-none tracking-tight uppercase text-balance"
              style={{
                color: "#fff",
                textShadow: "2px 2px 0 #000, 6px 8px 0 #ef4444, 8px 12px 18px rgba(239,68,68,0.35)",
              }}
            >
              24 Hour HACKATHON
            </div>
          </div>

          <p className="text-base md:text-lg leading-relaxed max-w-3xl text-neutral-300">
            Connect with designers worldwide, celebrating world-class content and forging connections across industries,
            verticals, and geographical boundaries.
          </p>
        </div>

        {/* Day Cards */}
        <div className="border-2 border-red-700 overflow-hidden mr-2 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 ">
            {/* Day 1 — solid red with subtle watermark */}
            <div className="relative bg-red-600 p-6 md:p-8">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-black/15 leading-none md:block"
                aria-hidden="true"
              >
                01
              </span>
              <div className="bg-black text-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block mb-4">
                Phase 1
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{ textShadow: "2px 2px 0 #000, 4px 6px 0 #ef4444" }}
              >
                hacking phase 1
              </h2>
            </div>

            {/* Day 2 — outlined, black fill, red border; md divider to remove visual gap */}
            <div className="relative bg-black p-6 md:p-8 border-t-2 md:border-t-0 md:border-l-2 border-red-700">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-red-700/20 leading-none md:block"
                aria-hidden="true"
              >
                02
              </span>
              <div className="bg-red-600 text-black px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block mb-4">
                Phase 2
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{ color: "#fff", textShadow: "2px 2px 0 #000, 4px 6px 0 #ef4444" }}
              >
                elimination round
              </h2>
            </div>

            {/* Day 3 — deeper red, md divider, with watermark */}
            <div className="relative bg-red-700 p-6 md:p-8 border-t-2 md:border-t-0 md:border-l-2 border-red-700">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-black/15 leading-none md:block"
                aria-hidden="true"
              >
                03
              </span>
              <div className="bg-black text-red-500 border border-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block mb-4">
                Phase 3
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{ textShadow: "2px 2px 0 #000, 4px 6px 0 #ef4444" }}
              >
                hacking phase 2
              </h2>
            </div>

            {/* Day 4 — full-width row with black/red styling and top divider, no gaps */}
            <div className="relative bg-black p-6 md:p-8 border-t-2 border-red-700 col-span-1 md:col-span-3">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-red-700/20 leading-none md:block"
                aria-hidden="true"
              >
                04
              </span>
              <div className="bg-red-600 text-black px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block mb-4">
                Phase 4
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug text-pretty uppercase"
                style={{ color: "#fff", textShadow: "2px 2px 0 #000, 4px 6px 0 #ef4444" }}
              >
                Presentation
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                and grande finale
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
