"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { showMatrixLoader } from "@/lib/matrix-loader"

export default function OnboardingPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [handle, setHandle] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = displayName.trim()
    const h = handle.trim()
    if (!name || !h) return
    // Mock profile completion
    showMatrixLoader(1100)
    router.replace("/dashboard")
  }

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <Card className="bg-black text-white border border-white">
          <CardHeader>
            <CardTitle className="text-xl">Complete your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  placeholder="Ada Lovelace"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-black text-white border-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handle">Handle</Label>
                <Input
                  id="handle"
                  placeholder="ada"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="bg-black text-white border-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/60">Letters, numbers, dashes, underscores</p>
              </div>
              <Button
                className="w-full bg-white text-black hover:bg-black hover:text-white border border-white"
                type="submit"
              >
                Save and continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
