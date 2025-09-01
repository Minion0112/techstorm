
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
    <Button onClick={handleGoogleLogin} className="w-full cursor-target">
      Sign in with Google
    </Button>
  )
}
