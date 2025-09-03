'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Button } from "../ui/button"
import { TriangleAlert, X } from "lucide-react"

export function RedbullWarning({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Alert 
      variant="destructive" 
      className="w-full border-red-500/50 bg-red-950/90 backdrop-blur-sm shadow-lg z-10 rounded-none"
    >
      <TriangleAlert className="h-5 w-5" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <AlertTitle className="text-red-100 font-semibold">Red Bull Sign Up Required</AlertTitle>
          <AlertDescription className="text-red-200/80 mt-1">
            Complete your Red Bull registration by submitting your image to participate in the event.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            asChild 
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-red-500 shrink-0"
          >
            <Link href="/redbull-signup">Complete Sign Up</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-red-200/80 hover:text-white hover:bg-red-900/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}
