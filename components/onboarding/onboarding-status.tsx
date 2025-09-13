'use client'

import { useOnboardingStatus } from '@/hooks/use-onboarding-status'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OnboardingStatusCardProps {
  showFullStatus?: boolean
  className?: string
}

export function OnboardingStatusCard({ showFullStatus = false, className = '' }: OnboardingStatusCardProps) {
  const { status, loading, error, isDayScholar, isHosteler, isComplete, missingFields } = useOnboardingStatus()

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Clock className="h-4 w-4 animate-spin mr-2" />
          <span>Checking onboarding status...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Unable to load profile status'}
        </AlertDescription>
      </Alert>
    )
  }

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const getStatusBadge = () => {
    if (isComplete) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
    }
    return <Badge variant="destructive">Incomplete</Badge>
  }

  const getStudentTypeBadge = () => {
    if (isDayScholar) {
      return <Badge variant="outline">Day Scholar</Badge>
    }
    if (isHosteler) {
      return <Badge variant="outline">Hosteler</Badge>
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  if (!showFullStatus) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm">{status.onboarding_status}</span>
        {getStatusBadge()}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Status
          </CardTitle>
          <div className="flex gap-2">
            {getStudentTypeBadge()}
            {getStatusBadge()}
          </div>
        </div>
        <CardDescription>
          {status.display_name && `Welcome, ${status.display_name}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{status.onboarding_status}</span>
        </div>

        {!isComplete && missingFields.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Missing Information:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {missingFields.map((field) => (
                    <li key={field} className="text-muted-foreground">
                      {getFieldDisplayName(field)}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isDayScholar && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Day Scholar Requirements:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {status.undertaking_url ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Student Undertaking</span>
              </div>
            </div>
          </div>
        )}

        {isHosteler && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Hosteler Requirements:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {status.parent_undertaking_url ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Parent Undertaking</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    display_name: 'Display Name',
    handle: 'Username/Handle',
    mobile: 'Mobile Number',
    registration_number: 'Registration Number',
    gender: 'Gender',
    undertaking_url: 'Student Undertaking File',
    parent_undertaking_url: 'Parent Undertaking File',
    hostel_name: 'Hostel Name',
    room_no: 'Room Number',
  }
  return fieldMap[field] || field
}

export function QuickOnboardingStatus({ className = '' }: { className?: string }) {
  return <OnboardingStatusCard showFullStatus={false} className={className} />
}

export function DetailedOnboardingStatus({ className = '' }: { className?: string }) {
  return <OnboardingStatusCard showFullStatus={true} className={className} />
}
