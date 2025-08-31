"use client"

import { GoogleSignInButton } from "@/components/auth/google-button"
import MatrixBackdrop from "@/components/matrix/matrix-backdrop"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-black text-white flex flex-col items-center justify-center">
      <MatrixBackdrop />
      <div className="scanline"></div>
      <div className="relative z-10 flex flex-col items-center">
        <FuzzyText fontSize="6rem" fontFamily="monospace">TECHSTORM 2.0</FuzzyText>
        <div className="mt-8">
          <ElectricBorder
            color="#7df9ff"
            speed={1}
            chaos={0.5}
            thickness={2}
            style={{ borderRadius: 16 }}>
            <div className=" p-8">
              <GoogleSignInButton />
            </div>
          </ElectricBorder>
        </div>
      </div>
    </main>
  )
}
