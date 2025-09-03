
'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export function GoogleSignInButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams:{
          hd: 'bmu.edu.in'
        },
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        id="prizes-heading"
        className="text-balance font-heading text-5xl md:text-7xl  tracking-tight hover:scale-[1.05] transition duration-300 ease-in-out cursor-pointer cursor-target"
        style={{ textShadow: "2px 2px 0 #000000, 4px 4px 0 #dc2626" }}
      >
        Register Now / Login
      </button>
    </div>
  )
}
