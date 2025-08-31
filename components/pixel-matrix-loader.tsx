"use client"

import { useEffect, useState } from "react"

interface PixelMatrixLoaderProps {
  size?: number
  className?: string
  fullscreen?: boolean
  cellSize?: number
  gap?: number
}

export function PixelMatrixLoader({
  size = 20,
  className = "",
  fullscreen = false,
  cellSize = 14,
  gap = 2,
}: PixelMatrixLoaderProps) {
  const [pixels, setPixels] = useState<boolean[][]>([])

  useEffect(() => {
    const initGrid = () => {
      if (fullscreen && typeof window !== "undefined") {
        const cols = Math.ceil(window.innerWidth / (cellSize + gap))
        const rows = Math.ceil(window.innerHeight / (cellSize + gap))
        return Array(rows)
          .fill(null)
          .map(() => Array(cols).fill(false))
      }
      return Array(size)
        .fill(null)
        .map(() => Array(size).fill(false))
    }

    // initialize grid
    setPixels(initGrid())

    // recompute on resize for fullscreen
    const onResize = () => {
      if (!fullscreen) return
      setPixels(initGrid())
    }
    if (fullscreen) window.addEventListener("resize", onResize)

    // animation interval
    const interval = setInterval(() => {
      setPixels((prev) => {
        if (prev.length === 0) return prev
        const rows = prev.length
        const cols = prev[0].length
        const next = prev.map((row) => [...row])

        // Randomly flip a few pixels
        for (let i = 0; i < Math.max(3, Math.floor(rows * cols * 0.002)); i++) {
          const r = Math.floor(Math.random() * rows)
          const c = Math.floor(Math.random() * cols)
          next[r][c] = Math.random() > 0.7
        }

        // Wave pattern
        const time = Date.now() / 200
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const wave = Math.sin((i + j) * 0.3 + time) > 0.3
            if (wave && Math.random() > 0.8) {
              next[i][j] = true
            }
          }
        }
        return next
      })
    }, 100)

    return () => {
      clearInterval(interval)
      if (fullscreen) window.removeEventListener("resize", onResize)
    }
  }, [size, fullscreen, cellSize, gap])

  const cols = pixels[0]?.length ?? size

  return (
    <div className={`${fullscreen ? "w-screen h-screen" : "inline-block"} ${className}`}>
      <div
        className={`grid ${fullscreen ? "" : "p-4"}`}
        style={{
          gap: fullscreen ? `${gap}px` : "0.25rem",
          gridTemplateColumns: `repeat(${cols}, ${fullscreen ? `${cellSize}px` : "1fr"})`,
          ...(fullscreen ? { width: "100%", height: "100%" } : { aspectRatio: "1" }),
        }}
      >
        {pixels.map((row, i) =>
          row.map((isActive, j) => (
            <div
              key={`${i}-${j}`}
              className={`transition-opacity duration-100 ${isActive ? "bg-white opacity-100" : "bg-white/15 opacity-30"}`}
              style={{
                width: fullscreen ? `${cellSize}px` : "0.5rem",
                height: fullscreen ? `${cellSize}px` : "0.5rem",
                transitionDelay: `${(i + j) * 10}ms`,
              }}
            />
          )),
        )}
      </div>
      {!fullscreen && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300/80 animate-pulse">Generating pixels...</p>
        </div>
      )}
    </div>
  )
}
