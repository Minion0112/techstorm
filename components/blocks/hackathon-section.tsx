import { cn } from "@/lib/utils"

export function HackathonSection({
  className,
}: {
  className?: string
}) {
  return (
    <section
      className={cn(
        "text-white py-12 px-6 md:py-16 md:px-8 lg:py-20 h-full w-full flex items-center justify-center",
        className
      )}
    >
      <div className="mx-auto max-w-6xl w-full">

        {/* Header */}
        <div className="mb-10 md:mb-12">
          <div className="mb-6">
            <div
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-none tracking-tight uppercase text-balance"
              style={{
                color: "#ffffff",
                textShadow:
                  "2px 2px 0 #000, 5px 7px 0 #8b2cff, 8px 12px 20px rgba(139,44,255,0.2)",
              }}
            >
              <span className="cursor-target">
                24 Hour HACKATHON
              </span>
            </div>
          </div>

          <p className="text-base md:text-lg leading-relaxed max-w-3xl text-neutral-300">
            Connect with designers worldwide, celebrating world-class content
            and forging connections across industries, verticals, and
            geographical boundaries.
          </p>
        </div>

        {/* Day Cards */}
        <div className="border border-white/15 overflow-hidden mr-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

            {/* Phase 1 */}
            <div className="relative bg-[#09090c] p-6 md:p-8 cursor-target overflow-hidden">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-white/[0.035] leading-none"
                aria-hidden="true"
              >
                01
              </span>

              <div className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">
                Phase 1
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{
                  textShadow: "2px 3px 0 rgba(139,44,255,0.8)",
                }}
              >
                PPT Submission
              </h2>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-500/40" />
            </div>

            {/* Phase 2 */}
            <div className="relative bg-[#09090c] p-6 md:p-8 border-t border-white/10 md:border-t-0 md:border-l border-white/10 cursor-target overflow-hidden">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-white/[0.035] leading-none"
                aria-hidden="true"
              >
                02
              </span>

              <div className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">
                Phase 2
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{
                  textShadow: "2px 3px 0 rgba(139,44,255,0.8)",
                }}
              >
                MVP Pitching
              </h2>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-500/40" />
            </div>

            {/* Phase 3 */}
            <div className="relative bg-[#09090c] p-6 md:p-8 border-t border-white/10 md:border-t-0 md:border-l border-white/10 cursor-target overflow-hidden">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-white/[0.035] leading-none"
                aria-hidden="true"
              >
                03
              </span>

              <div className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">
                Phase 3
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{
                  textShadow: "2px 3px 0 rgba(139,44,255,0.8)",
                }}
              >
                Prototype Pitching
              </h2>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-500/40" />
            </div>

            {/* Phase 4 — FULL WIDTH */}
            <div className="relative bg-[#060609] p-6 md:p-8 border-t border-white/10 col-span-1 md:col-span-3 cursor-target overflow-hidden">
              <span
                className="pointer-events-none select-none absolute -top-2 -right-2 text-7xl md:text-8xl font-extrabold text-white/[0.035] leading-none"
                aria-hidden="true"
              >
                04
              </span>

              <div className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">
                Phase 4
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug uppercase text-pretty"
                style={{
                  textShadow: "2px 3px 0 rgba(139,44,255,0.8)",
                }}
              >
                Closing Ceremony
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                and grande finale
              </h2>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-500/40" />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}