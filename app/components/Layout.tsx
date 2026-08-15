import type { ReactNode } from "react"
import { Squares } from "./ui/squares-background"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-[rgb(var(--background-start-rgb))] relative">
      <div className="absolute inset-0 z-10">
        <Squares
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="rgba(168, 85, 247, 0.25)" // rose accent @ 25%
          hoverFillColor="#0a0a0a"
        />
      </div>
      <div className="relative z-20 h-full">{children}</div>
    </div>
  )
}
