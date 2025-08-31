"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { PixelMatrixLoader } from "@/components/pixel-matrix-loader"

type TriggerDetail = { durationMs?: number }

export function MatrixLoaderOverlay() {
  const pathname = usePathname()
  const prevPath = useRef<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [duration, setDuration] = useState(1200)
  const hideTimer = useRef<number | null>(null)

  const loaderRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // Lock scroll when visible
  useEffect(() => {
    if (typeof document === "undefined") return
    const html = document.documentElement
    if (visible) {
      html.style.overflow = "hidden"
    } else {
      html.style.overflow = ""
    }
    return () => {
      html.style.overflow = ""
    }
  }, [visible])

  const showFor = (ms: number) => {
    const effective = prefersReducedMotion ? Math.min(ms, 300) : ms
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    setDuration(effective)
    setVisible(true)
    hideTimer.current = window.setTimeout(() => {
      setVisible(false)
      hideTimer.current = null
    }, effective)
  }

  // Trigger when leaving onboarding (form completion → navigate away)
  useEffect(() => {
    if (prevPath.current && prevPath.current.startsWith("/onboarding") && pathname !== prevPath.current) {
      showFor(1100)
    }
    prevPath.current = pathname
  }, [pathname])

  // Listen for imperative triggers
  useEffect(() => {
    const onMatrixShow = (e: Event) => {
      const detail = (e as CustomEvent<TriggerDetail>).detail
      showFor(detail?.durationMs ?? 1200)
    }
    const onTeamJoined = (e: Event) => {
      const detail = (e as CustomEvent<TriggerDetail>).detail
      showFor(detail?.durationMs ?? 1400)
    }
    window.addEventListener("matrix:show", onMatrixShow as EventListener)
    window.addEventListener("team:joined", onTeamJoined as EventListener)
    return () => {
      window.removeEventListener("matrix:show", onMatrixShow as EventListener)
      window.removeEventListener("team:joined", onTeamJoined as EventListener)
    }
  }, [])

  // Show overlay on first load if a pending flag exists (handles OAuth/full reload flows)
  useEffect(() => {
    try {
      const pending = localStorage.getItem("matrix_loader_pending")
      if (pending === "1") {
        localStorage.removeItem("matrix_loader_pending")
        showFor(1200)
      }
    } catch (e) {
      // ignore SSR/storage errors
    }
  }, [])

  useEffect(() => {
    if (!visible || prefersReducedMotion) return

    const recompute = () => {
      if (!loaderRef.current) return
      const rect = loaderRef.current.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      // scale to cover, add a slight buffer so edges aren't visible
      const s = Math.max(vw / rect.width, vh / rect.height) * 1.08
      setScale(s)
    }

    // measure after paint to get the loader's natural size
    const raf = requestAnimationFrame(() => {
      recompute()
      // also re-measure shortly after in case fonts/layout shift
      setTimeout(recompute, 0)
    })
    window.addEventListener("resize", recompute)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", recompute)
    }
  }, [visible, prefersReducedMotion])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center transition-opacity duration-300 opacity-100"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={loaderRef}
          style={{
            transform: prefersReducedMotion ? undefined : `scale(${scale})`,
            transformOrigin: "center",
            willChange: "transform",
          }}
          className="select-none"
        >
          {/* Render WITHOUT fullscreen to preserve the original animation behavior */}
          <PixelMatrixLoader cellSize={16} />
        </div>
      </div>
    </div>
  )
}
