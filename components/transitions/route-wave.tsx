"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

type RouteWaveProps = {
  // Only animate when leaving /onboarding (profile) if "from-onboarding", else on every route change
  trigger?: "all" | "from-onboarding"
  // Duration in ms; must match CSS var usage (we also set an inline var)
  durationMs?: number
}

export default function RouteWave({ trigger = "from-onboarding", durationMs = 900 }: RouteWaveProps) {
  const pathname = usePathname()
  const prevPath = useRef<string | null>(null)
  const [show, setShow] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname
      return
    }

    const isRouteChange = prevPath.current !== pathname
    const leavingOnboarding = prevPath.current?.startsWith("/onboarding") && isRouteChange

    const shouldAnimate = trigger === "all" ? isRouteChange : leavingOnboarding

    if (!shouldAnimate) {
      prevPath.current = pathname
      return
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion) {
      prevPath.current = pathname
      return
    }

    setShow(true)
    setKey((k) => k + 1)

    const total = Math.max(300, durationMs)
    const t = setTimeout(() => setShow(false), total)
    prevPath.current = pathname

    return () => clearTimeout(t)
  }, [pathname, trigger, durationMs])

  if (!show) return null

  return (
    <div
      key={key}
      className="route-wave"
      aria-hidden="true"
      style={
        {
          // Inline var controls timing; CSS provides the animation
          ["--route-wave-dur" as any]: `${durationMs}ms`,
        } as React.CSSProperties
      }
    >
      <div className="route-wave__layer route-wave__layer--white">
        <div className="route-wave__cap" />
      </div>
    </div>
  )
}
