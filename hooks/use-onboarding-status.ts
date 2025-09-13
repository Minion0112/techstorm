'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface OnboardingStatus {
  user_id: string
  display_name: string | null
  is_hosteler: boolean | null
  undertaking_url: string | null
  parent_undertaking_url: string | null
  onboarding_status: string
  is_complete: boolean
  missing_fields: string[]
}

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No authenticated user')
        return
      }

      // Call our custom function
      const { data, error: functionError } = await supabase
        .rpc('get_user_onboarding_status', { user_uuid: user.id })

      if (functionError) {
        console.error('Error checking onboarding status:', functionError)
        setError(functionError.message)
        return
      }

      if (data && data.length > 0) {
        setStatus(data[0])
      } else {
        setError('No profile found')
      }
    } catch (err) {
      console.error('Error in useOnboardingStatus:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const checkDayScholarComplete = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .rpc('is_day_scholar_onboarding_complete', { user_uuid: user.id })

      if (error) {
        console.error('Error checking day scholar status:', error)
        return false
      }

      return data === true
    } catch (err) {
      console.error('Error in checkDayScholarComplete:', err)
      return false
    }
  }

  const refreshStatus = () => {
    checkOnboardingStatus()
  }

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  return {
    status,
    loading,
    error,
    refreshStatus,
    checkDayScholarComplete,
    isDayScholar: status?.is_hosteler === false || status?.is_hosteler === null,
    isHosteler: status?.is_hosteler === true,
    isComplete: status?.is_complete || false,
    missingFields: status?.missing_fields || [],
  }
}
