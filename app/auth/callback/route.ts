import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
      }

      // Check whether this user is already registered
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, handle')
        .eq('id', user.id)
        .maybeSingle()

      const registrationOpen =
        process.env.REGISTRATION_OPEN !== 'FALSE'

      // Registration is closed AND this is a new user
      if (!registrationOpen && !profile) {
        // Remove the newly-created OAuth session
        await supabase.auth.signOut()

        return NextResponse.redirect(`${siteUrl}/registration-closed`)
      }

      // Existing registered user
      if (profile) {
        return NextResponse.redirect(`${siteUrl}${next}`)
      }

      // Registration is open and this is a new user
      return NextResponse.redirect(`${siteUrl}/onboarding`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
}