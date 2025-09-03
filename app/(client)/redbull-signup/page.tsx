'use client'

import RedbullSignupForm from '@/components/forms/redbull-signup-form'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function RedbullSignupPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_signed_up_for_red_bull')
          .eq('id', user.id)
          .single()

        if (profile && profile.is_signed_up_for_red_bull) {
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
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Please Complete This Form to Participate in the Event</h1>
            <Button
              onClick={() => {
                window.open("https://forms.gle/esfVGsqYuuaWx6Bo7", "_blank")
              }}
            >
              Complete Google Form
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:p-12 bg-black">
          <RedbullSignupForm />
        </div>
      </div>
    </main>
  )
}
