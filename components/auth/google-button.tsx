
"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function GoogleSignInButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/onboarding")
  }

  return (
    <Button onClick={handleClick} className="w-full cursor-target">
      Sign in with Google
    </Button>
  )
}
