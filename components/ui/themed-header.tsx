"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface ThemedHeaderProps {
  title?: string
  subtitle?: string
  user?: any
  profile?: any
  showSignOut?: boolean
  className?: string
}

export default function ThemedHeader({ 
  title = "TECHSTORM", 
  subtitle,
  user,
  profile,
  showSignOut = true,
  className = ""
}: ThemedHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <ElectricBorder 
      color="#ef4444" 
      className={`mb-8 ${className}`}
      speed={0.5}
      chaos={0.8}
    >
      <header className="bg-black border border-red-700/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
              {title}
            {subtitle && (
              <p className="text-red-400 text-lg font-mono tracking-wider">
                {subtitle}
              </p>
            )}
            {profile && (
              <div className="text-white/60 text-sm font-mono">
                <span>Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}</span>
                {profile?.handle && (
                  <span className="block mt-1 text-red-400">@{profile.handle}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {showSignOut && (
              <Button
                className="bg-black text-white border border-red-500 hover:bg-red-500 hover:text-white cursor-target font-mono transition-all duration-300"
                onClick={handleSignOut}
              >
                SIGN OUT
              </Button>
            )}
          </div>
        </div>
        
        {/* Tech grid pattern overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent 0 23px, rgba(239,68,68,0.3) 24px),
              repeating-linear-gradient(90deg, transparent 0 23px, rgba(239,68,68,0.3) 24px)
            `
          }}
        />
      </header>
    </ElectricBorder>
  )
}
