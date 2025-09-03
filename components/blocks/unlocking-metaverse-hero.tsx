"use client"

import { cn } from "@/lib/utils"

type Props = {
  className?: string
  learnMoreHref?: string
  onLearnMore?: () => void
}

/**
 * UnlockingMetaverseHero
 * - Exact text preserved:
 *   "10 FEB - 12 FEB 2023"
 *   "UNLOCKING THE METAVERSE"
 *   "LEARN MORE"
 * - Visual style approximates the provided design while omitting side images.
 */
export function UnlockingMetaverseHero({ className, learnMoreHref = "#", onLearnMore }: Props) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-xl h-full flex items-center justify-center",
        // Black background, high contrast text
        "text-white",
        "px-6 py-16 md:px-10 md:py-24",
        className,
      )}
      aria-labelledby="unlocking-metaverse-heading"
    >
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute left-1/2 top-10 -translate-x-[60%] h-64 w-64 rounded-full bg-red-600/30 blur-2xl" />
        <span className="absolute left-1/2 top-32 -translate-x-[10%] h-56 w-56 rounded-full bg-red-500/30 blur-2xl" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[40rem] rounded-full ring-1 ring-red-500/25 opacity-30" />
      </div> */}

      <div className="mx-auto max-w-5xl text-center">
        {/* Date line accent color to red */}
        <p className="font-extrabold tracking-[0.2em] text-red-500 text-lg md:text-2xl uppercase">
           <span className="cursor-target px-4">4 SEPT - 7 SEPT 2025</span>
        </p>

        <h1
          id="unlocking-metaverse-heading"
          className="mt-6 text-balance font-black uppercase leading-tight text-[clamp(1rem,4vw,2.5rem)] sm:text-[clamp(1.25rem,4.5vw,3rem)] md:text-[clamp(1.75rem,5vw,4rem)] lg:text-[clamp(2rem,5.5vw,4.5rem)]"
        >
          {/* Line 1 */}
          <span className="relative block cursor-target">
            {/* Magenta offset layer to red */}
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-y-[0.12em] text-red-600 blur-[0.5px] md:blur-[1px]"
            >
              KICKSTART YOUR JOURNEY IN TECH WHERE ONE BATCH LEADS ANOTHER
            </span>
            <span className="relative block drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]">
              KICKSTART YOUR JOURNEY IN TECH WHERE ONE BATCH LEADS ANOTHER
            </span>
          </span>
        </h1>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          {onLearnMore ? (
            <button type="button" onClick={onLearnMore} className={buttonClasses()}>
              LEARN MORE
            </button>
          ) : (
            <a href={learnMoreHref} className={buttonClasses()}>
              LEARN MORE
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function buttonClasses() {
  return cn(
    
    // White pill-like button with strong letterspacing
    "inline-flex items-center justify-center rounded-md border border-white/80 bg-white px-8 py-4 cursor-target",
    "font-extrabold tracking-[0.35em] text-sm text-black ",
    // Simple motion and a faux depth shadow
    "shadow-[0_12px_0_#000] hover:-translate-y-px active:translate-y-[2px] transition",
    // Accessible focus
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-black",
  )
}
