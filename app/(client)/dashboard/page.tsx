"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
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
                    setTeam(teamsData[0])
                } else {
                    setTeam(null)
                    setMembers([])
                }
            }
        }
        getData()
    }, [supabase])

    useEffect(() => {
        const getMembers = async () => {
            if (team) {
                const { data: membersData } = await supabase.rpc("get_team_members", { p_team_id: team.id })
                setMembers(membersData || [])
            }
        }
        getMembers()
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
        "repeating-linear-gradient(0deg, transparent 0 23px, rgba(239,68,68,0.1) 24px)," +
        "repeating-linear-gradient(90deg, transparent 0 23px, rgba(239,68,68,0.1) 24px)"


    return (
        <main className="min-h-dvh text-white relative"  >
            {/* grid background */}
            <div aria-hidden className="pointer-events-none absolute inset-0" />
            <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 space-y-10">
                <header className="flex items-center justify-between">
                    <h1 className="text-balance">
                        {`Welcome${profile?.display_name ? `, ${profile.display_name}` : ""}`}
                        <span className="block text-sm text-white/60 mt-1">{profile?.handle ? `@${profile.handle}` : ""}</span>
                    </h1>
                    <Button
                        className="bg-black text-white border border-white hover:bg-white hover:text-black cursor-target"
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push("/")
                        }}
                    >
                        Sign out
                    </Button>
                </header>

                {/* hero headline */}
                

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* left side */}
                    <div className="space-y-8">
                        {team ? (
                            <div className="space-y-8">
                                <div className="rounded-none border border-red-700/60 bg-black p-6  ">
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
                                        <div className="mt-4 pt-4 border-t border-red-700/30 space-y-2">
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

                                <div className="rounded-none border border-red-700/60 bg-black p-6  ">
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
                                            className="w-full bg-red-600 text-white hover:bg-red-700"
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

                                <div className="rounded-none border border-red-700/60 bg-black p-8  ">
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
                                    <div className="mt-1 h-6 w-6 shrink-0 rounded-sm bg-red-600 text-white grid place-items-center font-bold">
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
