"use client"

import { useEffect, useRef } from "react"

export default function MatrixBurst({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.font = "16px monospace"
    }
    resize()
    window.addEventListener("resize", resize)

    let t = 0
    const chars = "1010010011001100##--==++".split("")
    const draw = () => {
      if (!visible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      for (let i = 0; i < canvas.width; i += 12) {
        const y = (i * 7 + t * 12) % canvas.height
        const ch = chars[(i + t) % chars.length]
        ctx.fillText(ch, i, y)
      }
      t++
      rafRef.current = requestAnimationFrame(draw)
    }
    if (visible) draw()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [visible])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      aria-hidden="true"
    />
  )
}
