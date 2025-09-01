'use client'

import NewForm from '@/components/transitions/form-new'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('handle')
          .eq('id', user.id)
          .single()

        if (profile && profile.handle) {
          router.replace('/dashboard')
        } else {
          setLoading(false)
        }
      } else {
        // if no user, redirect to login
        router.replace('/')
      }
    }
    checkProfile()
  }, [router])

  if (loading) {
    return <div>Loading...</div> // Or a spinner
  }

  return (
    <main className="h-dvh text-white relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        <div className="hidden md:flex items-center justify-center p-12">
          <h1 className="text-4xl font-bold">Complete your Profile</h1>
        </div>
        <div className="flex items-center justify-center p-6 md:p-12 bg-black">
          <NewForm />
        </div>
      </div>
    </main>
  )
}
