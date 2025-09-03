import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"

import Html from "../ui/hero-animation"    
import { UnlockingMetaverseHero } from "@/components/blocks/unlocking-metaverse-hero"
import { HackathonSection } from "@/components/blocks/hackathon-section"
import { PrizesSection } from "@/components/blocks/prizes-section"
import { GetStartedButton } from "@/components/blocks/get-started-button"
import { GoogleSignInButton } from "@/components/auth/google-button"

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
      <GoogleSignInButton />
    )
  }
]
