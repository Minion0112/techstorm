"use client"

import { useEffect, useRef, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import JoinBurst from "@/components/matrix/join-burst"
import { notifyTeamJoined } from "@/lib/matrix-loader"

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [members, setMembers] = useState(["user1", "user2"]) // Mock members
  const unwrappedParams = use(params)
  const team = { id: unwrappedParams.id, name: "My Team", code: "ABCDEF", members } // Mock team
  const triggerKey = `${team?.id}:${members.length}`
  const prevCountRef = useRef<number>(members.length)

  useEffect(() => {
    const prev = prevCountRef.current
    const curr = members.length
    if (typeof prev === "number" && curr > prev) {
      notifyTeamJoined(1400)
    }
    prevCountRef.current = curr
  }, [members.length])

  if (!team) {
    return (
      <main className="min-h-dvh text-white">
        <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
          <h1 className="text-2xl">Team not found</h1>
          <Button
            className="bg-black text-white border border-white hover:bg-white hover:text-black"
            onClick={() => router.replace("/dashboard")}
          >
            Back to dashboard
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh  text-white relative z-10">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{team.name}</h1>
          <span className="text-xs border border-white px-2 py-1 bg-black">Join code: {team.code}</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg">Members</h2>
          <ul className="space-y-2">
            {members.map((uid) => (
              <li key={uid} className="flex items-center justify-between border border-white px-3 py-2 bg-black cursor-target">
                <span>
                  {uid === "user1" ? "You" : `Agent ${uid.slice(-4)}`}{" "}
                  {uid === "user1" && <span className="text-white/60">@user</span>}
                </span>
                <span className="text-xs">{uid === team.members[0] ? "owner" : "member"}</span>
              </li>
            ))}
          </ul>
          <div className="text-xs text-white/60">New members trigger a Matrix reveal.</div>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-black text-white border border-white hover:bg-white hover:text-black"
            onClick={() => {
              setMembers([...members, `user${members.length + 1}`])
            }}
          >
            Simulate teammate joining
          </Button>
          <Button
            className="bg-black text-white border border-white hover:bg-white hover:text-black"
            onClick={() => {
              router.replace("/")
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </main>
  )
}
