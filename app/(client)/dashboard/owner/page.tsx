"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import ThemedHeader from "@/components/ui/themed-header"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"
import { toast } from "sonner"

export default function OwnerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [availableForms, setAvailableForms] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/")
          return
        }
        
        setUser(user)

        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profileData)

        // Debug user info
        console.log("User check:", { 
          userId: user.id, 
          userIdType: typeof user.id,
          userEmail: user.email 
        })

        // Get teams where user is the owner
        const { data: ownedTeams, error: ownershipError } = await supabase
          .from("teams")
          .select("*")
          .eq("owner_id", user.id)
        
        console.log("Ownership query result:", { 
          ownedTeams, 
          ownershipError,
          queryUserId: user.id
        })

        // Also get user's team membership info for comparison
        const { data: memberTeams } = await supabase
          .from("v_user_teams")
          .select("*")
        
        console.log("Member teams:", memberTeams)
        
        if (ownedTeams && ownedTeams.length > 0) {
          // User owns at least one team
          const ownedTeam = ownedTeams[0]
          setTeam(ownedTeam)
          setIsOwner(true)
          
          console.log("Owner verified:", { 
            teamId: ownedTeam.id,
            teamName: ownedTeam.name,
            ownerId: ownedTeam.owner_id,
            userId: user.id
          })
        } else {
          // Check if we can find ownership through member teams
          if (memberTeams && memberTeams.length > 0) {
            const userTeam = memberTeams[0]
            console.log("Checking team ownership via member teams:", {
              teamOwnerId: userTeam.owner_id,
              userId: user.id,
              areEqual: userTeam.owner_id === user.id,
              stringComparison: String(userTeam.owner_id) === String(user.id)
            })
            
            // Check if user is owner through member team data
            if (String(userTeam.owner_id) === String(user.id)) {
              setTeam(userTeam)
              setIsOwner(true)
              console.log("Owner verified through member teams")
            } else {
              // User is a team member but not owner
              console.log("User is team member but not owner")
              router.replace("/dashboard")
              toast.error("Access denied. Owner privileges required.")
              return
            }
          } else {
            // User has no team at all
            console.log("User has no teams")
            router.replace("/dashboard")
            return
          }
        }
      } catch (error) {
        console.error("Error checking ownership:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    checkOwnership()
  }, [router, supabase])

  // Fetch available forms for the team
  useEffect(() => {
    const fetchForms = async () => {
      if (team && isOwner) {
        try {
          const { data: forms } = await supabase.rpc("get_available_forms", { p_team_id: team.id })
          setAvailableForms(forms || [])
        } catch (error) {
          console.error("Error fetching forms:", error)
        }
      }
    }

    fetchForms()
  }, [team, isOwner, supabase])

  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white flex items-center justify-center">
        <FuzzyText fontSize="1.5rem" fontFamily="monospace">
          LOADING...
        </FuzzyText>
      </div>
    )
  }

  if (!isOwner) {
    return null // Will redirect
  }

  return (
    <main className="min-h-dvh bg-black text-white relative">
      {/* Grid background */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent 0 23px, rgba(168,85,247,0.1) 24px),
            repeating-linear-gradient(90deg, transparent 0 23px, rgba(168,85,247,0.1) 24px)
          `
        }}
      />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 space-y-10">
        <ThemedHeader 
          title="OWNER DASHBOARD"
          subtitle={team ? `Team: ${team.name}` : "No Team"}
          profile={profile}
          user={user}
        />

        {/* Forms Section */}
        {availableForms.length > 0 && (
          <div className="space-y-6">
              <span className="text-lg font-bold text-white">Submission Portal</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableForms.map((form) => (
                <ElectricBorder key={form.id} color="#a855f7" className="h-fit">
                  <div className="bg-black border border-purple-700/60 p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white">{form.title}</h3>
                      <p className="text-white/70 text-sm">{form.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full border ${
                        form.is_locked 
                          ? 'border-purple-500 text-purple-400 bg-purple-500/10' 
                          : 'border-green-500 text-green-400 bg-green-500/10'
                      }`}>
                        {form.is_locked ? 'LOCKED' : 'UNLOCKED'}
                      </span>
                      
                      {form.has_submission && (
                        <span className="px-2 py-1 rounded-full border border-blue-500 text-blue-400 bg-blue-500/10">
                          SUBMITTED
                        </span>
                      )}
                    </div>

                    {form.has_submission && form.submitted_at && (
                      <p className="text-white/50 text-xs">
                        Submitted: {new Date(form.submitted_at).toLocaleString()}
                      </p>
                    )}

                    <Button
                      onClick={() => {
                        if (!form.is_locked) {
                          router.push(`/dashboard/forms/${form.id}`)
                        } else {
                          toast.error("Form is currently locked")
                        }
                      }}
                      disabled={form.is_locked}
                      className={`w-full font-mono ${
                        form.has_submission 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : form.is_locked 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {form.has_submission
                        ? 'VIEW/EDIT SUBMISSION'
                        : form.is_locked
                          ? 'LOCKED'
                          : 'SUBMIT FORM'
                      }
                    </Button>
                  </div>
                </ElectricBorder>
              ))}
            </div>
          </div>
        )}

        {/* Owner Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Management Card */}
          <ElectricBorder color="#a855f7" className="h-fit">
            <div className="bg-black border border-purple-700/60 p-6 space-y-4">
              <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>
                Team Management
              </FuzzyText>
              <p className="text-white/70 text-sm">
                Manage your team settings, members, and finalization status.
              </p>
              <Button
                onClick={() => router.push("/dashboard/team")}
                className="w-full bg-purple-600 text-white hover:bg-purple-700 font-mono"
              >
                MANAGE TEAM
              </Button>
            </div>
          </ElectricBorder>

          {/* Statistics Card */}
          <ElectricBorder color="#a855f7" className="h-fit">
            <div className="bg-black border border-purple-700/60 p-6 space-y-4">
              <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>
                Statistics
              </FuzzyText>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Team Status:</span>
                  <span className={team?.is_finalized ? "text-green-400" : "text-yellow-400"}>
                    {team?.is_finalized ? "FINALIZED" : "PENDING"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Members:</span>
                  <span className="text-white">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Join Code:</span>
                  <span className="text-purple-400 font-mono">
                    {team?.is_finalized ? "LOCKED" : team?.join_code || "NONE"}
                  </span>
                </div>
              </div>
            </div>
          </ElectricBorder>

          {/* Quick Actions Card */}
          <ElectricBorder color="#a855f7" className="h-fit">
            <div className="bg-black border border-purple-700/60 p-6 space-y-4">
              <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>
                Quick Actions
              </FuzzyText>
              <div className="space-y-2">
                {!team?.is_finalized && team?.join_code && (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(team.join_code)
                      toast.success("Join code copied!")
                    }}
                    className="w-full bg-black text-white border border-white hover:bg-white hover:text-black font-mono text-xs"
                  >
                    COPY JOIN CODE
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-black text-white border border-white hover:bg-white hover:text-black font-mono text-xs"
                >
                  VIEW REGULAR DASHBOARD
                </Button>
              </div>
            </div>
          </ElectricBorder>
        </div>

        {/* Empty Dashboard Message */}
          <ElectricBorder color="#a855f7">
            <div className="bg-black border border-purple-700/60 p-8 text-center space-y-4">
              Submission Portal
            <p className="text-white/70 max-w-2xl mx-auto">
              This is your exclusive owner dashboard. From here, you can manage your team, 
              view detailed statistics, and access owner-only features. More functionality 
              will be added as the system evolves.
            </p>
            <div className="pt-4">
              <p className="text-purple-400 text-sm font-mono">
                &gt; ACCESS LEVEL: ADMINISTRATOR
              </p>
            </div>
          </div>
        </ElectricBorder>
      </div>
    </main>
  )
}
