"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import ThemedHeader from "@/components/ui/themed-header"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"
import { toast } from "sonner"

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormData {
  id: string
  title: string
  description: string
  fields: FormField[]
  is_locked: boolean
  has_submission: boolean
  submission_id?: string
  submitted_at?: string
}

export default function FormSubmissionPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.formId as string
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [submissionData, setSubmissionData] = useState<Record<string, any>>({})
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/")
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profileData)

        // Get user's team
        const { data: teamsData } = await supabase
          .from("v_user_teams")
          .select("*")
        
        if (!teamsData || teamsData.length === 0) {
          router.push("/dashboard")
          toast.error("You must be part of a team to access forms")
          return
        }

        const userTeam = teamsData[0]
        setTeam(userTeam)

        // Check if user is the team owner
        if (user.id !== userTeam.owner_id) {
          router.push("/dashboard")
          toast.error("Access denied. Only team owners can access forms.")
          return
        }

        // Get form data and check if team can access it
        const { data: forms } = await supabase.rpc("get_available_forms", { 
          p_team_id: userTeam.id 
        })

        const form = forms?.find((f: any) => f.id === formId)
        if (!form) {
          router.push("/dashboard/owner")
          toast.error("Form not found or not accessible")
          return
        }

        // Ensure fields are parsed correctly
        const processedForm = {
          ...form,
          fields: Array.isArray(form.fields) ? form.fields : JSON.parse(form.fields || '[]')
        }

        console.log("Original form:", form)
        console.log("Processed form:", processedForm)
        console.log("Form fields type:", typeof processedForm.fields, "value:", processedForm.fields)

        setFormData(processedForm)

        // Get submission details for editing
        const { data: submissionDetails } = await supabase.rpc("get_form_submission_for_edit", {
          p_form_id: form.id,
          p_team_id: userTeam.id
        })

        console.log("Submission details:", submissionDetails)

        if (submissionDetails && submissionDetails.length > 0) {
          const submission = submissionDetails[0]
          console.log("Found existing submission:", submission)
          setExistingSubmission(submission)
          setCanEdit(submission.can_edit)

          // Ensure submitted_data is properly parsed
          let submissionData = {}
          if (submission.submitted_data) {
            if (typeof submission.submitted_data === 'string') {
              try {
                submissionData = JSON.parse(submission.submitted_data)
              } catch (e) {
                console.error("Error parsing submission data:", e)
                submissionData = {}
              }
            } else {
              submissionData = submission.submitted_data
            }
          }

          setSubmissionData(submissionData)
          console.log("Set submission data:", submissionData)
        } else {
          console.log("No existing submission found")
          setExistingSubmission(null)
          setCanEdit(false)
        }

      } catch (error) {
        console.error("Error initializing form:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      initializeForm()
    }
  }, [formId, router, supabase])

  const handleFieldChange = (fieldId: string, value: any) => {
    setSubmissionData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData || !team) return
    
    // Validate required fields
    const missingFields = formData.fields
      .filter(field => field.required && !submissionData[field.id])
      .map(field => field.label)

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(", ")}`)
      return
    }

    setSubmitting(true)

    try {
      let result;

      if (existingSubmission) {
        // Update existing submission
        result = await supabase.rpc("update_form_submission", {
          p_submission_id: existingSubmission.submission_id,
          p_submission_data: submissionData
        })
      } else {
        // Create new submission
        result = await supabase.rpc("submit_form", {
          p_form_id: formData.id,
          p_team_id: team.id,
          p_submission_data: submissionData
        })
      }

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(existingSubmission ? "Form updated successfully!" : "Form submitted successfully!")
        router.push("/dashboard/owner")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit form")
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = submissionData[field.id] || ""
    console.log(`Rendering field ${field.id}:`, { value, submissionData, isReadOnly, canEdit, existingSubmission: !!existingSubmission })

    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <Input
            key={field.id}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="bg-black text-white border-red-700/60 focus:border-red-500"
            readOnly={isReadOnly}
          />
        )

      case "textarea":
        return (
          <Textarea
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="bg-black text-white border-red-700/60 focus:border-red-500 min-h-[100px]"
            readOnly={isReadOnly}
          />
        )

      case "select":
        return (
          <select
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full p-2 bg-black text-white border border-red-700/60 focus:border-red-500 rounded"
            disabled={isReadOnly}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <Input
            key={field.id}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="bg-black text-white border-red-700/60 focus:border-red-500"
            readOnly={isReadOnly}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white flex items-center justify-center">
        <FuzzyText fontSize="1.5rem" fontFamily="monospace">
          LOADING FORM...
        </FuzzyText>
      </div>
    )
  }

  if (!formData) {
    return null // Will redirect
  }

  const isReadOnly = existingSubmission !== null && !canEdit

  return (
    <main className="min-h-dvh bg-black text-white relative">
      {/* Grid background */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent 0 23px, rgba(239,68,68,0.1) 24px),
            repeating-linear-gradient(90deg, transparent 0 23px, rgba(239,68,68,0.1) 24px)
          `
        }}
      />
      
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10 space-y-10">
        <ThemedHeader
          title={formData.title}
          subtitle={
            existingSubmission
              ? canEdit
                ? "Edit Submission"
                : "View Submission"
              : "Submit Form"
          }
          profile={profile}
          user={user}
        />

        {/* Navigation */}
        <Button
          onClick={() => router.push("/dashboard/owner")}
          className="bg-black text-white border border-white hover:bg-white hover:text-black font-mono"
        >
          ← BACK TO DASHBOARD
        </Button>

        {/* Form Content */}
        <ElectricBorder color="#ef4444">
          <div className="bg-black border border-red-700/60 p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <FuzzyText fontSize="1.8rem" fontFamily="monospace" enableHover={false}>
                  {formData.title}
                </FuzzyText>
              </div>
              {formData.description && (
                <p className="text-white/70">{formData.description}</p>
              )}
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-3 py-1 rounded-full border ${
                formData.is_locked 
                  ? 'border-red-500 text-red-400 bg-red-500/10' 
                  : 'border-green-500 text-green-400 bg-green-500/10'
              }`}>
                {formData.is_locked ? 'LOCKED' : 'UNLOCKED'}
              </span>
              
              {isReadOnly && (
                <span className="px-3 py-1 rounded-full border border-blue-500 text-blue-400 bg-blue-500/10">
                  SUBMITTED
                </span>
              )}
            </div>

            {existingSubmission && (
              <div className="p-4 border border-blue-700/60 bg-blue-900/20 rounded">
                <p className="text-blue-400 text-sm">
                  <strong>Submitted:</strong> {new Date(existingSubmission.submitted_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {console.log("Rendering form fields:", formData.fields)}
              {formData.fields && formData.fields.length > 0 ? (
                formData.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-white font-mono">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 py-8">
                  <p>No form fields found. The form may not be properly configured.</p>
                  {(() => { console.log("No form fields found in:", formData); return null; })()}
                </div>
              )}

              {/* Submit Button */}
              {!isReadOnly && !formData.is_locked && (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 text-white hover:bg-red-700 font-mono text-lg py-3"
                >
                  {submitting
                    ? (existingSubmission ? "UPDATING..." : "SUBMITTING...")
                    : (existingSubmission ? "UPDATE SUBMISSION" : "SUBMIT FORM")
                  }
                </Button>
              )}

              {/* Edit Permission Info */}
              {existingSubmission && !canEdit && (
                <div className="p-4 border border-yellow-700/60 bg-yellow-900/20 rounded text-center">
                  <p className="text-yellow-400">
                    You can view this submission but cannot edit it.
                    Only the original submitter or team owner can make changes.
                  </p>
                </div>
              )}

              {formData.is_locked && !isReadOnly && (
                <div className="p-4 border border-red-700/60 bg-red-900/20 rounded text-center">
                  <p className="text-red-400">This form is currently locked and cannot be submitted.</p>
                </div>
              )}
            </form>
          </div>
        </ElectricBorder>
      </div>
    </main>
  )
}
