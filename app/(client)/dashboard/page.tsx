"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [teamName, setTeamName] = useState("")
  const [joinCode, setJoinCode] = useState("")

  const profile = { bio: "user", handle: "user" } // Mock profile
  const teams = [{ id: "1", name: "My Team", code: "ABCDEF" }] // Mock teams

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = teamName.trim()
    if (!name) return
    // Mock team creation
    const newTeam = { id: "2", name, code: "GHIJKL" }
    teams.push(newTeam)
    router.push(`/team/${newTeam.id}`)
  }

  async function onJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = joinCode.trim()
    if (!code) return
    // Mock team joining
    const team = teams.find((t) => t.code === code)
    if (team) {
      router.push(`/team/${team.id}`)
    } else {
      console.error("[v0] join error: Invalid join code")
    }
  }

  return (
    <main className="min-h-dvh text-white  relative z-10 ">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        <h1 className="text-2xl text-balance">
          Welcome{profile?.bio ? `, ${profile.bio}` : ""}{" "}
          <span className="text-white/50">@{profile?.handle}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-black border border-white">
            <CardHeader>
              <CardTitle>Create a team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreate} className="space-y-4">
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="bg-black text-white border-white placeholder:text-white/40"
                />
                <Button
                  className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                  type="submit"
                >
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-black border border-white">
            <CardHeader>
              <CardTitle>Join a team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onJoin} className="space-y-4">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Join code"
                  className="bg-black text-white border-white placeholder:text-white/40 uppercase"
                />
                <Button
                  className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                  type="submit"
                >
                  Join
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg">Your teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.length > 0 ? (
              teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/team/${t.id}`}
                  className="block border border-white p-4 hover:bg-white hover:text-black transition"
                >
                  <div className="flex items-center justify-between">
                    <span>{t.name}</span>
                    <span className="text-xs">Code: {t.code}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-white/60 text-sm">You’re not in any teams yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
