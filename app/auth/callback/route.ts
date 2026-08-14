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
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', user?.id)
        .single();

      if (profile && profile.handle) {
        return NextResponse.redirect(`${siteUrl}${next}`);
      }

      return NextResponse.redirect(`${siteUrl}/onboarding`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`);
}
