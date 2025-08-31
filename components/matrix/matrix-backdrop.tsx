"use client"

import { useEffect, useRef } from "react"

export default function MatrixBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const columnsRef = useRef<number>(0)
  const dropsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const fontSize = 14
      columnsRef.current = Math.floor(canvas.width / fontSize)
      dropsRef.current = Array(columnsRef.current).fill(1)
      ctx.font = `${fontSize}px monospace`
    }
    resize()
    window.addEventListener("resize", resize)

    const chars = "01#@$%&*+=-".split("")
    const draw = () => {
      if (!ctx) return
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      for (let i = 0; i < columnsRef.current; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const x = i * 14
        const y = dropsRef.current[i] * 14
        ctx.fillText(text, x, y)
        if (y > canvas.height && Math.random() > 0.975) dropsRef.current[i] = 0
        dropsRef.current[i]++
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" aria-hidden="true" />
}
