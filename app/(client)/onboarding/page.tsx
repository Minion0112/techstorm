'use client'

import NewForm from '@/components/transitions/form-new'
import { DetailedOnboardingStatus } from '@/components/onboarding/onboarding-status'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStatus } from '@/hooks/use-onboarding-status'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isComplete, loading: statusLoading } = useOnboardingStatus()

  useEffect(() => {
    const checkProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // We'll let the hook handle the comprehensive check
        setLoading(false)
      } else {
        // if no user, redirect to login
        router.replace('/')
      }
    }
    checkProfile()
  }, [router])

  // Redirect to dashboard if profile is complete
  useEffect(() => {
    if (!statusLoading && isComplete) {
      router.replace('/dashboard')
    }
  }, [isComplete, statusLoading, router])

  if (loading || statusLoading) {
    return (
      <div className="h-dvh flex items-center justify-center text-white">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="h-dvh text-white relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        <div className="hidden lg:flex flex-col items-center justify-center p-12 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Complete your Profile</h1>
            <p className="text-white/80 max-w-md">
              Complete all required information to access your dashboard and join teams.
            </p>
          </div>
          <div className="w-full max-w-md">
            <DetailedOnboardingStatus />
          </div>
        </div>
        <div className="flex flex-col p-6 md:p-12 bg-black">
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold mb-4">Complete your Profile</h1>
            <DetailedOnboardingStatus className="mb-4" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <NewForm />
          </div>
        </div>
      </div>
    </main>
  )
}
