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
import { useOnboardingStatus } from '@/hooks/use-onboarding-status'

type Errors = Partial<
    Record<'name' | 'mobile' | 'email' | 'registration' | 'hostelName' | 'roomNo' | 'studentUndertakingFile' | 'parentUndertakingFile' | 'handle' | 'gender', string>
>

export default function NewForm() {
    const router = useRouter()
    const { refreshStatus } = useOnboardingStatus()
    const [name, setName] = useState('')
    const [handle, setHandle] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')
    const [gender, setGender] = useState('')
    const [registration, setRegistration] = useState('')
    const [isHosteler, setIsHosteler] = useState<boolean>(false)
    const [hostelName, setHostelName] = useState<string>('')
    const [roomNo, setRoomNo] = useState<string>('')
    const [studentUndertakingFile, setStudentUndertakingFile] = useState<File | null>(null)
    const [parentUndertakingFile, setParentUndertakingFile] = useState<File | null>(null)
    const [studentUndertakingUrl, setStudentUndertakingUrl] = useState<string>('')
    const [parentUndertakingUrl, setParentUndertakingUrl] = useState<string>('')
    const [errors, setErrors] = useState<Errors>({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const studentFileInputRef = useRef<HTMLInputElement>(null)
    const parentFileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');

                // Fetch existing profile data
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile && !error) {
                    // Pre-populate form with existing data
                    setName(profile.display_name || '');
                    setHandle(profile.handle || '');
                    setMobile(profile.mobile || '');
                    setGender(profile.gender || '');
                    setRegistration(profile.registration_number || '');
                    setIsHosteler(profile.is_hosteler || false);
                    setHostelName(profile.hostel_name || '');
                    setRoomNo(profile.room_no || '');
                    setStudentUndertakingUrl(profile.undertaking_url || '');
                    setParentUndertakingUrl(profile.parent_undertaking_url || '');
                }
            }
        };
        getUserData();
    }, [supabase]);

    const hostelOptions = useMemo(() => ['Ratan Tata Hostel', 'Kalpana Chawla Hostel', 'APJ Abdul Kalam Hostel'], [])

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

        if (!gender.trim()) {
            next.gender = 'Gender is required.'
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
            if (!studentUndertakingFile && !studentUndertakingUrl) {
                next.studentUndertakingFile = 'Please upload a signed student undertaking.'
            }
            if (!parentUndertakingFile && !parentUndertakingUrl) {
                next.parentUndertakingFile = 'Please upload a signed parent undertaking.'
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

            let student_undertaking_url = studentUndertakingUrl;
            if (studentUndertakingFile) {
                const { data, error } = await supabase.storage
                    .from('undertakings')
                    .upload(`${user.id}/student_${studentUndertakingFile.name}`,
                    studentUndertakingFile,
                    {
                        upsert: true,
                    });

                if (error) {
                    console.error('Error uploading student undertaking:', error);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('undertakings').getPublicUrl(data.path);
                student_undertaking_url = publicUrl;
            }

            let parent_undertaking_url = parentUndertakingUrl;
            if (parentUndertakingFile) {
                const { data, error } = await supabase.storage
                    .from('undertakings')
                    .upload(`${user.id}/parent_${parentUndertakingFile.name}`,
                    parentUndertakingFile,
                    {
                        upsert: true,
                    });

                if (error) {
                    console.error('Error uploading parent undertaking:', error);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('undertakings').getPublicUrl(data.path);
                parent_undertaking_url = publicUrl;
            }

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                display_name: name,
                handle: handle,
                mobile: mobile,
                gender: gender,
                registration_number: registration,
                is_hosteler: isHosteler,
                hostel_name: hostelName,
                room_no: roomNo,
                undertaking_url: student_undertaking_url,
                parent_undertaking_url: parent_undertaking_url,
            });

            if (error) {
                // handle error, maybe show a toast
                console.error(error);
                if (error.code === '23505') { // unique constraint violation
                    setErrors({ handle: 'This handle is already taken.' })
                }
                return;
            }

            setSubmitted(true)
            // Refresh onboarding status after successful submission
            refreshStatus()
            router.refresh()
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
                    <Label htmlFor="handle">Username</Label>
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

                {/* Gender */}
                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender" aria-invalid={!!errors.gender} className="cursor-target text-background" >
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male" className="cursor-target text-background">Male</SelectItem>
                            <SelectItem value="female" className="cursor-target text-background">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
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
                                setStudentUndertakingFile(null)
                                setParentUndertakingFile(null)
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    <>
                        <div className="space-y-3 rounded-md border bg-foreground p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <Label>Student Undertaking</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Download the undertaking template, sign it, and upload a scanned copy (PDF or image).
                                    </p>
                                </div>
                                <Button asChild className="cursor-target px-4 py-2">
                                    <a href="https://supa.t-bash.space/storage/v1/object/public/newbro//student%20undertaking.docx" download="undertaking-form.docx">
                                        Download Template
                                    </a>
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    ref={studentFileInputRef}
                                    id="student-undertaking"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                                    className="hidden cursor-target"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null
                                        setStudentUndertakingFile(f)
                                        setSubmitted(false)
                                        if (errors.studentUndertakingFile) {
                                            setErrors((prev) => ({ ...prev, studentUndertakingFile: undefined }))
                                        }
                                    }}
                                    aria-invalid={!!errors.studentUndertakingFile}
                                    aria-describedby={errors.studentUndertakingFile ? 'student-undertaking-error' : undefined}
                                />
                                <Button
                                    type="button"
                                    onClick={() => studentFileInputRef.current?.click()}
                                    aria-controls="student-undertaking"
                                    className="cursor-target"
                                >
                                    Upload
                                </Button>
                                <span className="text-sm text-muted-foreground truncate">
                                    {studentUndertakingFile ? studentUndertakingFile.name :
                                     studentUndertakingUrl ? 'File already uploaded' : 'No file selected'}
                                </span>
                            </div>

                            {errors.studentUndertakingFile && (
                                <p id="student-undertaking-error" className="text-sm text-destructive">
                                    {errors.studentUndertakingFile}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 rounded-md border bg-foreground p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <Label>Parent Undertaking</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Download the undertaking template, have it signed by a parent/guardian, and upload a scanned copy.
                                    </p>
                                </div>
                                <Button asChild className="cursor-target px-4 py-2">
                                    <a href="https://supa.t-bash.space/storage/v1/object/public/newbro//parent%20undertaking.docx" download="undertaking-form.docx">
                                        Download Template
                                    </a>
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    ref={parentFileInputRef}
                                    id="parent-undertaking"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                                    className="hidden cursor-target"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null
                                        setParentUndertakingFile(f)
                                        setSubmitted(false)
                                        if (errors.parentUndertakingFile) {
                                            setErrors((prev) => ({ ...prev, parentUndertakingFile: undefined }))
                                        }
                                    }}
                                    aria-invalid={!!errors.parentUndertakingFile}
                                    aria-describedby={errors.parentUndertakingFile ? 'parent-undertaking-error' : undefined}
                                />
                                <Button
                                    type="button"
                                    onClick={() => parentFileInputRef.current?.click()}
                                    aria-controls="parent-undertaking"
                                    className="cursor-target"
                                >
                                    Upload
                                </Button>
                                <span className="text-sm text-muted-foreground truncate">
                                    {parentUndertakingFile ? parentUndertakingFile.name :
                                     parentUndertakingUrl ? 'File already uploaded' : 'No file selected'}
                                </span>
                            </div>

                            {errors.parentUndertakingFile && (
                                <p id="parent-undertaking-error" className="text-sm text-destructive">
                                    {errors.parentUndertakingFile}
                                </p>
                            )}
                        </div>
                    </>
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
