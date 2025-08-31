"use client"

import PixelBlast from "@/components/transitions/back"
import TargetCursor from "@/components/transitions/target-cursor"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <PixelBlast
                    variant="square"
                    pixelSize={5}
                    color="#908e8e"
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
            <TargetCursor
                spinDuration={1}
                hideDefaultCursor={true}
            />

            <main>{children}</main>
        </>

    )
}