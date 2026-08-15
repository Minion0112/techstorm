"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import ThemedHeader from "@/components/ui/themed-header"
import FuzzyText from "@/components/transitions/glitch"
import ElectricBorder from "@/components/transitions/electric-grid"
import ProfileCard from "@/components/transitions/profile"
import { toast } from "sonner"

export default function DashboardPage() {
    const router = useRouter()
    const [teamName, setTeamName] = useState("")
    const [newTeamName, setNewTeamName] = useState("")
    const [isEditingTeamName, setIsEditingTeamName] = useState(false)
    const [joinCode, setJoinCode] = useState("")
    const [profile, setProfile] = useState<any>(null)
    const [team, setTeam] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [showCreate, setShowCreate] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [availableForms, setAvailableForms] = useState<any[]>([])
    const supabase = createClient()

    const blackAndWhiteBehindGradient = 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(0,80%,70%,var(--card-opacity)) 4%,hsla(0,60%,50%,calc(var(--card-opacity)*0.75)) 10%,hsla(0,40%,30%,calc(var(--card-opacity)*0.5)) 50%,hsla(0,0%,0%,0) 100%)';
    const blackAndWhiteInnerGradient = '';
    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
                setProfile(profileData)

                const { data: teamsData } = await supabase.from("v_user_teams").select("*")
                if (teamsData && teamsData.length > 0) {
                    const userTeam = teamsData[0]
                    setTeam(userTeam)

                    // Auto-redirect team owners to their owner dashboard
                    if (userTeam.owner_id === user.id) {
                        console.log("Team owner detected, redirecting to owner dashboard")
                        router.replace("/dashboard/owner")
                        return
                    }
                } else {
                    setTeam(null)
                    setMembers([])
                }
            }
        }
        getData()
    }, [supabase, router])

    useEffect(() => {
        const getMembers = async () => {
            if (team) {
                const { data: membersData } = await supabase.rpc("get_team_members", { p_team_id: team.id })
                setMembers(membersData || [])
            }
        }
        getMembers()
    }, [team, supabase])

    // Fetch available forms for the team
    useEffect(() => {
        const fetchForms = async () => {
            if (team) {
                try {
                    const { data: forms } = await supabase.rpc("get_available_forms", { p_team_id: team.id })
                    setAvailableForms(forms || [])
                } catch (error) {
                    console.error("Error fetching forms:", error)
                }
            }
        }

        fetchForms()
    }, [team, supabase])

    async function onCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const name = teamName.trim()
        if (!name) return

        const { data: newTeam, error } = await supabase.rpc("create_team_with_owner", { p_name: name })

        if (error) {
            console.error("[v0] create error:", error)
            toast.error(error.message)
            return
        }

        setTeam(newTeam)
    }

    async function onJoin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const code = joinCode.trim()
        if (!code) return

        const { data: joinedTeam, error } = await supabase.rpc("join_team_by_code", { p_join_code: code })

        if (error) {
            console.error("[v0] join error:", error)
            toast.error(error.message)
            return
        }

        setTeam(joinedTeam)
    }

    async function onLeave() {
        if (!team) return
        await supabase.rpc("leave_team", { p_team_id: team.id })
        setTeam(null)
        setMembers([])
    }

    // theme helpers
    const gridBackground =
        "repeating-linear-gradient(0deg, transparent 0 23px, rgba(168,85,247,0.1) 24px)," +
        "repeating-linear-gradient(90deg, transparent 0 23px, rgba(168,85,247,0.1) 24px)"


    return (
        <main className="min-h-dvh bg-black text-white relative">
            {/* grid background */}
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
                    title="DASHBOARD"
                    subtitle="Team Management System"
                    profile={profile}
                    user={user}
                />

                {/* Navigation for team members (owners are auto-redirected) */}
                {team && (
                    <div className="flex gap-4 flex-wrap">
                        <Button
                            onClick={() => router.push("/dashboard/team")}
                            className="bg-purple-600 text-white hover:bg-purple-700 font-mono"
                        >
                            VIEW TEAM DETAILS
                        </Button>
                    </div>
                )}

                {/* Forms Section - Only show forms to team owners */}
                {team && user && user.id === team.owner_id && availableForms.length > 0 && (
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
                                                        : 'bg-green-600 text-white hover:bg-green-700'
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* left side */}
                    <div className="space-y-8">
                        {team ? (
                            <div className="space-y-8">
                                <div className="rounded-none border border-purple-700/60 bg-black p-6  ">
                                    <h3 className="text-xl mb-4 font-extrabold flex flex-col gap-2">
                                        <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>Team: {team.name}</FuzzyText>
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-white/70">
                                            {team.is_finalized ? "Finalized" : `Join Code: ${team.join_code}`}
                                        </p>
                                        {!team.is_finalized && (
                                            <Button
                                                className="bg-black text-white border border-white hover:bg-white hover:text-black"
                                                onClick={() => navigator.clipboard.writeText(team.join_code)}
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

                                <div className="rounded-none border border-purple-700/60 bg-black p-6  ">
                                    <h3 className="text-xl mb-4 font-extrabold flex flex-col gap-2">
                                        <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>Team Members</FuzzyText>
                                    </h3>
                                    <ul className="space-y-3">
                                        {members.map((member) => (
                                            <li key={member.handle} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{member.display_name}</p>
                                                    <p className="text-sm text-white/60">@{member.handle}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    
                                                    <span className="text-xs px-2 py-1 border border-white rounded-full">{member.role}</span>
                                                </div>
                                            </li>
                                        ))}
                                        {members.length === 0 && <li className="text-sm text-white/70">No members yet.</li>}
                                    </ul>
                                </div>

                                <div className="flex gap-2">
                                    {!team.is_finalized && (
                                    <Button
                                        onClick={onLeave}
                                        className="w-full bg-transparent text-white border border-white hover:bg-white hover:text-black"
                                    >
                                        Leave Team
                                    </Button>
                                    )}
                                    {user && team && user.id === team.owner_id && !team.is_finalized && (
                                        <Button
                                            className="w-full bg-purple-600 text-white hover:bg-purple-700"
                                            onClick={async () => {
                                                const { error } = await supabase.rpc("finalize_team", { p_team_id: team.id })
                                                if (error) {
                                                    toast.error(error.message)
                                                } else {
                                                    toast.success("Team finalized!")
                                                    const { data: teamsData } = await supabase.from("v_user_teams").select("*")
                                                    if (teamsData && teamsData.length > 0) {
                                                        setTeam(teamsData[0])
                                                    } else {
                                                        setTeam(null)
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
                        ) : (
                            <div className="space-y-6">
                                {/* toggle */}
                                <div className="flex justify-center">
                                    <div className="inline-flex border border-white rounded-md p-1">
                                        <Button
                                            onClick={() => setShowCreate(true)}
                                            className={`px-6 py-2 ${showCreate ? "bg-white text-black" : "bg-black text-white"}`}
                                        >
                                            Create
                                        </Button>
                                        <Button
                                            onClick={() => setShowCreate(false)}
                                            className={`px-6 py-2 ${!showCreate ? "bg-white text-black" : "bg-black text-white"}`}
                                        >
                                            Join
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-none border border-purple-700/60 bg-black p-8  ">
                                    {showCreate ? (
                                        <form onSubmit={onCreate} className="space-y-4 flex flex-col gap-4" >
                                                <FuzzyText fontSize="1.5rem" fontFamily="monospace"  enableHover={false}>Create a new team</FuzzyText>
                                            <Input
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                placeholder="Team name"
                                                className="bg-black text-white border-white placeholder:text-white/40 cursor-target"
                                                aria-label="Team name"
                                            />
                                            <Button
                                                className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                                                type="submit"
                                            >
                                                Create
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={onJoin} className="space-y-4 flex flex-col gap-4" >
                                            <FuzzyText fontSize="1.5rem" fontFamily="monospace" enableHover={false}>Join an existing team</FuzzyText>
                                            <Input
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                placeholder="Join code"
                                                className="bg-black text-white border-white placeholder:text-white/40 uppercase cursor-target"
                                                aria-label="Join code"
                                            />
                                            <Button
                                                className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                                                type="submit"
                                            >
                                                Join
                                            </Button>
                                        </form>
                                    )}
                                </div>

                                {/* Guidelines: visible only when user has not joined any team */}
                                <div className="items-start gap-4 hidden md:flex">
                                    <div className="mt-1 h-6 w-6 shrink-0 rounded-sm bg-purple-600 text-white grid place-items-center font-bold">
                                        !
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-extrabold tracking-tight">
                                            <span className="pb-4">Participation Guidelines</span>
                                        </h4>
                                        <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-white/90">
                                            <li>Open to first-year students only.</li>
                                            <li>Each team must consist of 5 members.</li>

                                            <li>Teams must include at least one female participant.</li>
                                            <li>Interdisciplinary teams are encouraged.</li>
                                            <li>We advise you to include a maximum of 2 female members. Failure to do so may result in reshuffling</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* right side */}
                    <div className="flex items-start justify-center">
                        {profile && (
                            <ProfileCard
                                className="cursor-target"
                                avatarUrl='./trp.png'
                                miniAvatarUrl='./placeholder-user.jpg'
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
