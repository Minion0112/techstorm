"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { showMatrixLoader } from "@/lib/matrix-loader"
import Max from "@/components/transitions/form"

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
    <main className="h-dvh text-white relative z-10 flex items-center justify-center">
      <div className=" px-6 py-16 h-100vh">
        <Max />
        
      </div>
    </main>
  )
}
