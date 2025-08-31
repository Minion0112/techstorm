"use client"

import { GoogleSignInButton } from "@/components/auth/google-button"
import MatrixBackdrop from "@/components/matrix/matrix-backdrop"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"
import TargetCursor from "@/components/transitions/target-cursor"
import PixelBlast from "@/components/transitions/back"

export default function HomePage() {
  return (
    <>
      <main className="relative z-10 min-h-dvh text-white flex flex-col items-center justify-center">
        <TargetCursor
          spinDuration={1}
          hideDefaultCursor={true}
        />

        {/* <div className="scanline"></div> */}
        <div className="relative z-10 flex flex-col items-center">
          <FuzzyText fontSize="6rem" fontFamily="monospace">TECHSTORM 2.0</FuzzyText>
          <div className="mt-8">
            <div className=" p-8">
              <GoogleSignInButton />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
