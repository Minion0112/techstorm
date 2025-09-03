'use client'

import { useEffect, useState } from "react"
import PixelBlast from "@/components/transitions/back"
import TargetCursor from "@/components/transitions/target-cursor"
import { Toaster } from "@/components/ui/sonner"
import { createClient } from "@/utils/supabase/client"
import { RedbullWarning } from "@/components/notifications/redbull-warning"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobile, setIsMobile] = useState(false)
    const [showRedbullWarning, setShowRedbullWarning] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const checkRedbullSignup = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
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
    }, [])

    return (
        <>
            {showRedbullWarning && <RedbullWarning />}
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

            <main>{children}</main>
            <Toaster />
        </>

    )
}