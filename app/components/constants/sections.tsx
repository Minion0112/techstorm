import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"

import Html from "../ui/hero-animation"    
import { UnlockingMetaverseHero } from "@/components/blocks/unlocking-metaverse-hero"
import { HackathonSection } from "@/components/blocks/hackathon-section"
import { PrizesSection } from "@/components/blocks/prizes-section"
import { GetStartedButton } from "@/components/blocks/get-started-button"

export const sections = [
  {
    id: "hero",
    customContent: (
      <Html />
    )
  },
  {
    id: "about",
    customContent: (
      <UnlockingMetaverseHero />
    )
  },
  {
    id: "features",
    customContent: (
      <HackathonSection />
    )
  },
  {
    id: "testimonials",
    customContent: (
      <PrizesSection />
    )
  },
  {
    id: "join",
    customContent: (
      <div className="w-full h-full flex items-center justify-center">
        <div
          id="prizes-heading"
          className="text-balance font-heading text-5xl md:text-7xl  tracking-tight hover:scale-[1.05] transition duration-300 ease-in-out cursor-pointer"
          style={{ textShadow: "2px 2px 0 #000000, 4px 4px 0 #dc2626" }}
        >
          Register Now
        </div>
      </div>
    )
  }
]
