"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import ThemedHeader from "@/components/ui/themed-header"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"
import ProfileCard from "@/components/transitions/profile"
import { toast } from "sonner"

export default function TeamDetailsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const blackAndWhiteBehindGradient = 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(270,80%,70%,var(--card-opacity)) 4%,hsla(270,60%,50%,calc(var(--card-opacity)*0.75)) 10%,hsla(270,40%,30%,calc(var(--card-opacity)*0.5)) 50%,hsla(0,0%,0%,0) 100%)';
  const blackAndWhiteInnerGradient = '';

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/")
          return
        }

        setUser(user)

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profileData)

        const { data: teamsData } = await supabase
          .from("v_user_teams")
          .select("*")
        
        if (teamsData && teamsData.length > 0) {
          setTeam(teamsData[0])
        } else {
          // No team, redirect to dashboard
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [router, supabase])

  useEffect(() => {
    const getMembers = async () => {
      if (team) {
        const { data: membersData } = await supabase.rpc("get_team_members", { p_team_id: team.id })
        setMembers(membersData || [])
      }
    }
    getMembers()
  }, [team, supabase])

  const onLeave = async () => {
    if (!team) return
    await supabase.rpc("leave_team", { p_team_id: team.id })
    router.push("/dashboard")
    toast.success("Left team successfully")
  }

  const isOwner = user && team && user.id === team.owner_id

  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white flex items-center justify-center">
        <FuzzyText fontSize="1.5rem" fontFamily="monospace">
          LOADING...
        </FuzzyText>
      </div>
    )
  }

  if (!team) {
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
          title="TEAM DETAILS"
          subtitle={team.name}
          profile={profile}
          user={user}
        />

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-black text-white border border-white hover:bg-white hover:text-black font-mono"
          >
            ← BACK TO DASHBOARD
          </Button>
          {isOwner && (
            <Button
              onClick={() => router.push("/dashboard/owner")}
              className="bg-purple-600 text-white hover:bg-purple-700 font-mono"
            >
              OWNER DASHBOARD
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team Information */}
          <div className="space-y-8">
            <ElectricBorder color="#a855f7">
              <div className="bg-black border border-purple-700/60 p-6">
                <h3 className="text-xl mb-4 font-extrabold flex flex-col gap-2">
                  <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>
                    Team: {team.name}
                  </FuzzyText>
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/70">
                    {team.is_finalized ? "Finalized" : `Join Code: ${team.join_code}`}
                  </p>
                  {!team.is_finalized && (
                    <Button
                      className="bg-black text-white border border-white hover:bg-white hover:text-black"
                      onClick={() => {
                        navigator.clipboard.writeText(team.join_code)
                        toast.success("Join code copied!")
                      }}
                    >
                      Copy
                    </Button>
                  )}
                </div>
                {team.is_finalized && (
                  <div className="mt-4 pt-4 border-t border-purple-700/30 space-y-2">
                    <p className="text-base font-bold text-white/90">
                      Mentor: <span className="font-normal text-white/70">{team.mentor_name || "Not Assigned"}</span>
                    </p>
                    {team.room_name && (
                      <p className="text-base font-bold text-white/90">
                        Room: <span className="font-normal text-white/70">{team.room_name}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ElectricBorder>

            {/* Team Members */}
            <ElectricBorder color="#a855f7">
              <div className="bg-black border border-purple-700/60 p-6">
                <h3 className="text-xl mb-4 font-extrabold flex flex-col gap-2">
                  <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>
                    Team Members ({members.length}/5)
                  </FuzzyText>
                </h3>
                <ul className="space-y-3">
                  {members.map((member) => (
                    <li key={member.handle} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{member.display_name}</p>
                        <p className="text-sm text-white/60">@{member.handle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 border rounded-full ${
                          member.role === 'owner' ? 'border-purple-500 text-purple-400' : 'border-white text-white'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </li>
                  ))}
                  {members.length === 0 && (
                    <li className="text-sm text-white/70">No members yet.</li>
                  )}
                </ul>
              </div>
            </ElectricBorder>

            {/* Actions */}
            <div className="flex gap-4">
              {!team.is_finalized && (
                <Button
                  onClick={onLeave}
                  className="flex-1 bg-transparent text-white border border-white hover:bg-white hover:text-black"
                >
                  Leave Team
                </Button>
              )}
              {isOwner && !team.is_finalized && (
                <Button
                  className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                  onClick={async () => {
                    const { error } = await supabase.rpc("finalize_team", { p_team_id: team.id })
                    if (error) {
                      toast.error(error.message)
                    } else {
                      toast.success("Team finalized!")
                      // Refresh team data
                      const { data: teamsData } = await supabase.from("v_user_teams").select("*")
                      if (teamsData && teamsData.length > 0) {
                        setTeam(teamsData[0])
                      }
                    }
                  }}
                  disabled={members.length !== 5}
                  title={members.length !== 5 ? "Teams must have exactly 5 members" : "Finalize Team"}
                >
                  Finalize Team
                </Button>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex items-start justify-center">
            {profile && (
              <ProfileCard
                className="cursor-target"
                avatarUrl='/trp.png'
                miniAvatarUrl='/placeholder-user.jpg'
                name={profile.display_name}
                title={team ? team.name : "No Team"}
                handle={profile.handle}
                status={team ? team.role : "Unassigned"}
                behindGradient={blackAndWhiteBehindGradient}
                innerGradient={blackAndWhiteInnerGradient}
                showUserInfo={true}
                contactText={team ? (team.is_finalized ? 'Finalized' : `Code: ${team.join_code}`) : "No Team"}
                onContactClick={() => {
                  if (team && !team.is_finalized) {
                    navigator.clipboard.writeText(team.join_code)
                    toast.success("Join code copied!")
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
