'use client'

import { useEffect, useState } from "react"
import PixelBlast from "@/components/transitions/back"
import TargetCursor from "@/components/transitions/target-cursor"
import { Toaster } from "@/components/ui/sonner"
import { createClient } from "@/utils/supabase/client"

import { useOnboardingStatus } from "@/hooks/use-onboarding-status"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobile, setIsMobile] = useState(false)
    const [showRedbullWarning, setShowRedbullWarning] = useState(false)
    const [user, setUser] = useState<any>(null)
    const { isComplete, isDayScholar, isHosteler, loading: statusLoading } = useOnboardingStatus()

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
    }, [])

    useEffect(() => {
        const checkRedbullSignup = async () => {
            if (user) {
                const supabase = createClient()
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_signed_up_for_red_bull')
                    .eq('id', user.id)
                    .single()

                if (profile && !profile.is_signed_up_for_red_bull) {
                    setShowRedbullWarning(true)
                }
            }
        }
        checkRedbullSignup()
    }, [user])

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <PixelBlast
                    variant="square"
                    pixelSize={5}
                    color="#781C20"
                    patternScale={1.75}
                    patternDensity={1}
                    pixelSizeJitter={0}
                    enableRipples
                    rippleSpeed={0.4}
                    rippleThickness={0.12}
                    rippleIntensityScale={1.5}
                    speed={0.4}
                    edgeFade={0.1}
                    transparent
                    noiseAmount={0}
                />
            </div>
            {!isMobile && (
                <TargetCursor
                    spinDuration={4}
                    hideDefaultCursor={true}
                />
            )}

            {/* Onboarding Status Warning */}
            {user && !statusLoading && !isComplete && (
                <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
                    <div className="bg-yellow-600/90 backdrop-blur-sm border border-yellow-500/50 rounded-lg p-3 pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-4 w-4 text-yellow-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-yellow-100 font-medium">
                                    Profile incomplete - {isDayScholar ? 'Day Scholar' : isHosteler ? 'Hosteler' : 'Student'} requirements not met
                                </p>
                                <p className="text-xs text-yellow-200/80">
                                    Complete your profile to access all features
                                </p>
                            </div>
                            <Link
                                href="/onboarding"
                                className="text-xs bg-yellow-500 hover:bg-yellow-400 text-yellow-900 px-3 py-1 rounded font-medium transition-colors"
                            >
                                Complete Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <main>{children}</main>
            <Toaster />
        </>

    )
}