'use client'

import type React from 'react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { revalidatePath } from 'next/cache'

type Errors = Partial<Record<'imageFile', string>>

export default function RedbullSignupForm() {
    const router = useRouter()
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [errors, setErrors] = useState<Errors>({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    function validate(): boolean {
        const next: Errors = {}

        if (!imageFile) {
            next.imageFile = 'Please upload an image.'
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // handle case where user is not logged in
                return;
            }

            let image_url = null;
            if (imageFile) {
                const { data, error } = await supabase.storage
                    .from('redbull-submissions')
                    .upload(`${user.id}/${imageFile.name}`, imageFile, {
                        upsert: true,
                    });

                if (error) {
                    console.error('Error uploading file:', error);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('redbull-submissions').getPublicUrl(data.path);
                image_url = publicUrl;
            }

            if (image_url) {
                const { error: submissionError } = await supabase.from('redbull_submissions').insert({
                    user_id: user.id,
                    image_url: image_url,
                });

                if (submissionError) {
                    console.error('Error creating submission:', submissionError);
                    return;
                }
            }

            const { error: profileError } = await supabase.from('profiles').update({
                is_signed_up_for_red_bull: true,
            }).eq('id', user.id);


            if (profileError) {
                // handle error, maybe show a toast
                console.error(profileError);
                return;
            }

            setSubmitted(true)
            
            // Revalidate the page to update the UI
            window.location.reload()
            
            router.push('/dashboard');
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-3 rounded-md border bg-foreground p-4 min-w-[600px]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <Label>Submit Your Image</Label>
                            <p className="text-xs text-muted-foreground">
                                Upload your image for the Red Bull event.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            id="image-upload"
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden cursor-target"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null
                                setImageFile(f)
                                setSubmitted(false)
                                if (errors.imageFile) {
                                    setErrors((prev) => ({ ...prev, imageFile: undefined }))
                                }
                            }}
                            aria-invalid={!!errors.imageFile}
                            aria-describedby={errors.imageFile ? 'image-error' : undefined}
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            aria-controls="image-upload"
                            className="cursor-target"
                        >
                            Upload
                        </Button>
                        <span className="text-sm text-muted-foreground truncate">
                            {imageFile ? imageFile.name : 'No file selected'}
                        </span>
                    </div>

                    {errors.imageFile && (
                        <p id="image-error" className="text-sm text-destructive">
                            {errors.imageFile}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting} className="cursor-target px-4 py-2">
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
                {submitted && <p className="text-sm text-muted-foreground">Submission successful.</p>}
            </div>
        </form>
    )
}
