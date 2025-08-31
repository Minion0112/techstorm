"use client"

import * as React from "react"

export default function JoinBurst({ triggerKey }: { triggerKey: string }) {
  const [burst, setBurst] = React.useState(0)
  React.useEffect(() => {
    setBurst((b) => b + 1)
  }, [triggerKey])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div key={burst} className="absolute inset-0 animate-[burst_800ms_ease-out]" aria-hidden>
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/80 translate-x-[-0.5px]" />
        <div className="absolute inset-0 bg-white/5" />
      </div>
      <style jsx global>{`
        @keyframes burst {
          0% {
            opacity: 0.0;
          }
          12% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
