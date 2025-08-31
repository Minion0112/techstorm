import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import RouteWave from "@/components/transitions/route-wave"
import { MatrixLoaderOverlay } from "@/components/transitions/matrix-loader-overlay"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className={`bg-black text-white font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <MatrixLoaderOverlay />
        <RouteWave trigger="from-onboarding" durationMs={900} />
        <Analytics />
      </body>
    </html>
  )
}
