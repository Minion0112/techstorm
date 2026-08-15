"use client"
import { cn } from "@/lib/utils"

/**
 * PrizesSection
 * - Matches the provided layout and exact text content
 * - Omits decorative images per request ("leave the images")
 * - Uses a 2-column layout on md+ and stacked on mobile
 * - Color system (5 colors total):
 *   • Primary: purple (bg-purple-700 / bg-purple-700/90)
 *   • Neutrals: white (#fff), near-black (via black darkness)
 *   • Accent 1: white (text-white)
 *   • Accent 2: purple (text-purple-900/30)
 */
export function PrizesSection({ className }: { className?: string }) {
  return (
    <section className={cn("w-full  text-white", "py-12 md:py-16 h-full w-full flex items-center justify-center", className)} aria-labelledby="prizes-heading">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <header className="mb-8 md:mb-10">
          <h2
            id="prizes-heading"
            className="text-balance font-heading text-5xl md:text-7xl font-extrabold tracking-tight "
            style={{ textShadow: "2px 2px 0 #000000, 4px 4px 0 #9333ea" }}
          >
            <span className="cursor-target">PRIZES</span>
          </h2>
          <p className="mt-4 max-w-3xl text-pretty text-base md:text-lg leading-relaxed text-neutral-200">
            Get ready to launch your project! The top performers will receive awards, prizes, and recognition
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          {/* Left main prize */}
          <div className="md:col-span-3">
            <div className=" border border-purple-600 overflow-hidden h-full mr-2 cursor-target">
              {/* purple main panel */}
              <div className="relative bg-purple-700/90 p-6 md:p-10">
                {/* decorative numeral */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-4 text-8xl md:text-9xl font-black text-purple-900/30 select-none"
                >
                  01
                </span>

                <div className="space-y-3 md:space-y-4">
                  <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-white/90 uppercase">Winner</p>
                   
                  <p className="text-5xl md:text-7xl font-black text-white">Rs 12,000</p>
                  <p className="text-sm md:text-base font-semibold tracking-wide text-white/90 uppercase">
                    Cash prize
                  </p>
                </div>

                <p className="mt-6 md:mt-10 max-w-xl text-pretty text-sm md:text-base leading-relaxed text-neutral-100 hidden md:block">
                  Prepare for the project launch! Outstanding contributors will be rewarded with awards, prizes, and
                  acknowledgment.
                </p>
              </div>

              {/* black footer attached to big box */}
              {/* <div className="border-t border-red-600 bg-black p-4 text-center hidden md:block">
                <p className="font-heading text-sm md:text-base font-bold text-white">
                  All participants will receive a Certificate of Participation
                </p>
              </div> */}
            </div>
          </div>

          {/* Right side list */}
          <div className="md:col-span-2">
            <div className="h-full  border border-purple-600 overflow-hidden mr-2">
              {/* Item 1 */}
              <div className="relative p-5 md:p-12 flex items-center gap-4 md:gap-5 bg-purple-700/90 cursor-target">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 -top-4 text-7xl font-black text-purple-900/30 select-none"
                >
                  02
                </span>
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-extrabold leading-none text-white">Rs 8,000</p>
                  <p className="mt-1 text-base md:text-lg font-semibold">1st Runner Up • Cash prize</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-purple-800" />

              {/* Item 2 */}
              <div className="relative p-5 md:p-12 flex items-center gap-4 md:gap-5 bg-black cursor-target">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 -top-4 text-7xl font-black text-purple-900/30 select-none"
                >
                  03
                </span>
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-extrabold leading-none text-white">Rs 5,000</p>
                  <p className="mt-1 text-base md:text-lg font-semibold">2nd Runner Up • Cash prize</p>
                </div>
              </div>

             
   

              {/* Item 3 */}
              {/* <div className="relative p-5 md:p-6 flex items-center gap-4 md:gap-5 bg-purple-700/90 cursor-target">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 -top-4 text-7xl font-black text-purple-900/30 select-none"
                >
                  04
                </span>
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-extrabold leading-none text-white">Rs 7,500</p>
                  <p className="mt-1 text-base md:text-lg font-semibold">4th Prize • worth of prizes</p>
                </div>
              </div> */}



              {/* Item 4
              <div className="relative p-5 md:p-6 flex items-center gap-4 md:gap-5 bg-black cursor-target">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 -top-4 text-7xl font-black text-red-900/30 select-none"
                >
                  05
                </span>
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-extrabold leading-none text-white">Rs 5,000</p>
                  <p className="mt-1 text-base md:text-lg font-semibold">5th Prize • worth of prizes</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Hidden standalone certificate box */}
        <div className="mt-8 rounded-md border border-purple-600 bg-black p-4 text-center hidden">
          <p className="font-heading text-lg md:text-xl font-bold text-white">
            All participants will receive a Certificate of Participation
          </p>
        </div>
      </div>
    </section>
  )
}

// Provide default export to satisfy both default and named imports.
export default PrizesSection
