'use client'

import type React from 'react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Errors = Partial<
    Record<'name' | 'mobile' | 'email' | 'registration' | 'hostelName' | 'roomNo' | 'undertakingFile' | 'handle', string>
>

export default function NewForm() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [handle, setHandle] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')
    const [registration, setRegistration] = useState('')
    const [isHosteler, setIsHosteler] = useState<boolean>(false)
    const [hostelName, setHostelName] = useState<string>('')
    const [roomNo, setRoomNo] = useState<string>('')
    const [undertakingFile, setUndertakingFile] = useState<File | null>(null)
    const [errors, setErrors] = useState<Errors>({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
            }
        };
        getUser();
    }, [supabase.auth]);

    const hostelOptions = useMemo(() => ['A Block', 'B Block', 'C Block', 'D Block', 'Girls Hostel', 'Boys Hostel'], [])

    function validate(): boolean {
        const next: Errors = {}

        if (!name.trim()) {
            next.name = 'Name is required.'
        }

        if (!handle.trim()) {
            next.handle = 'Handle is required.'
        }

        if (!/^\d{10}$/.test(mobile.trim())) {
            next.mobile = 'Enter a 10-digit mobile number.'
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            next.email = 'Enter a valid email address.'
        }

        if (!registration.trim()) {
            next.registration = 'Registration number is required.'
        }

        if (isHosteler) {
            if (!hostelName.trim()) {
                next.hostelName = 'Select your hostel.'
            }
            if (!roomNo.trim()) {
                next.roomNo = 'Enter your room number.'
            }
        } else {
            if (!undertakingFile) {
                next.undertakingFile = 'Please upload a signed undertaking.'
            }
        }

        setErrors(next)
        return Object.keys(next).length === 0
    }


    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) {
            return
        }

        try {
            setSubmitting(true)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // handle case where user is not logged in
                return;
            }

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                display_name: name,
                handle: handle,
                mobile: mobile,
                registration_number: registration,
                is_hosteler: isHosteler,
                hostel_name: hostelName,
                room_no: roomNo,
            }).select();

            if (error) {
                // handle error, maybe show a toast
                console.error(error);
                if (error.code === '23505') { // unique constraint violation
                    setErrors({ handle: 'This handle is already taken.' })
                }
                return;
            }

            setSubmitted(true)
            router.push('/dashboard');
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className="cursor-target"
                    />
                    {errors.name && (
                        <p id="name-error" className="text-sm text-destructive">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Handle */}
                <div className="space-y-2">
                    <Label htmlFor="handle">Handle</Label>
                    <Input
                        id="handle"
                        placeholder="your-unique-handle"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        aria-invalid={!!errors.handle}
                        aria-describedby={errors.handle ? 'handle-error' : undefined}
                        className="cursor-target"
                    />
                    {errors.handle && (
                        <p id="handle-error" className="text-sm text-destructive">
                            {errors.handle}
                        </p>
                    )}
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                        id="mobile"
                        inputMode="numeric"
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                        aria-invalid={!!errors.mobile}
                        aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                        className="cursor-target"
                    />
                    {errors.mobile && (
                        <p id="mobile-error" className="text-sm text-destructive">
                            {errors.mobile}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email ID</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className="cursor-target"
                        disabled
                    />
                    {errors.email && (
                        <p id="email-error" className="text-sm text-destructive">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Registration Number */}
                <div className="space-y-2">
                    <Label htmlFor="registration">Registration Number</Label>
                    <Input
                        id="registration"
                        placeholder="e.g., 23CSE1234"
                        value={registration}
                        onChange={(e) => setRegistration(e.target.value)}
                        aria-invalid={!!errors.registration}
                        aria-describedby={errors.registration ? 'registration-error' : undefined}
                        className="cursor-target"
                        />
                    {errors.registration && (
                        <p id="registration-error" className="text-sm text-destructive">
                            {errors.registration}
                        </p>
                    )}
                </div>

                {/* Hosteler Toggle */}
                <div className="flex items-center justify-between rounded-md border bg-foreground px-4 py-3">
                    <div className="space-y-0.5">
                        <Label htmlFor="hosteler">Are you a hosteler?</Label>
                        <p className="text-xs text-muted-foreground">Toggle on if you reside in a hostel.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={cn('text-sm', isHosteler ? 'text-background' : 'text-muted-foreground')}>
                            {isHosteler ? 'Yes' : 'No'}
                        </span>
                        <Switch
                            id="hosteler"
                            checked={isHosteler}
                            onCheckedChange={(v) => {
                                setIsHosteler(v)
                                setHostelName('')
                                setRoomNo('')
                                setUndertakingFile(null)
                                setErrors({})
                                setSubmitted(false)
                            }}
                            aria-label="Are you a hosteler?"
                            className="cursor-target"
                        />
                    </div>
                </div>

                {/* Conditional: Hosteler fields */}
                {isHosteler && (
                    <div className="grid grid-cols-2 gap-5 min-w-[600px]">
                        <div className="space-y-2">
                            <Label htmlFor="hostelName">Hostel Name</Label>
                            <Select value={hostelName} onValueChange={setHostelName}>
                                <SelectTrigger id="hostelName" aria-invalid={!!errors.hostelName} className="cursor-target text-background" >
                                    <SelectValue placeholder="Select hostel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hostelOptions.map((h) => (
                                        <SelectItem key={h} value={h} className="cursor-target text-background" >
                                            {h}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.hostelName && <p className="text-sm text-destructive">{errors.hostelName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="roomNo">Room No.</Label>
                            <Input
                                id="roomNo"
                                placeholder="e.g., 203"
                                value={roomNo}
                                onChange={(e) => setRoomNo(e.target.value)}
                                aria-invalid={!!errors.roomNo}
                                aria-describedby={errors.roomNo ? 'room-error' : undefined}
                                className="cursor-target"
                            />
                            {errors.roomNo && (
                                <p id="room-error" className="text-sm text-destructive">
                                    {errors.roomNo}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Conditional: Non-hosteler undertaking */}
                {!isHosteler && (
                    <div className="space-y-3 rounded-md border bg-foreground p-4 min-w-[600px]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <Label>Undertaking Form</Label>
                                <p className="text-xs text-muted-foreground">
                                    Download the undertaking template, sign it, and upload a scanned copy (PDF or image).
                                </p>
                            </div>
                            <Button asChild className="cursor-target px-4 py-2">
                                {/* Replace href with your actual template file path when available */}
                                <a href="/placeholder.svg?height=842&width=595" download="undertaking-form-template.svg">
                                    Download Template
                                </a>
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                ref={fileInputRef}
                                id="undertaking"
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden cursor-target"
                                onChange={(e) => {
                                    const f = e.target.files?.[0] ?? null
                                    setUndertakingFile(f)
                                    setSubmitted(false)
                                    if (errors.undertakingFile) {
                                        setErrors((prev) => ({ ...prev, undertakingFile: undefined }))
                                    }
                                }}
                                aria-invalid={!!errors.undertakingFile}
                                aria-describedby={errors.undertakingFile ? 'undertaking-error' : undefined}
                            />
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                aria-controls="undertaking"
                                className="cursor-target"
                            >
                                Upload
                            </Button>
                            <span className="text-sm text-muted-foreground truncate">
                                {undertakingFile ? undertakingFile.name : 'No file selected'}
                            </span>
                        </div>

                        {errors.undertakingFile && (
                            <p id="undertaking-error" className="text-sm text-destructive">
                                {errors.undertakingFile}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting} className="cursor-target px-4 py-2">
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
                {submitted && <p className="text-sm text-muted-foreground">Profile saved successfully.</p>}
            </div>
        </form>
    )
}
