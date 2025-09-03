'use client'

import type React from 'react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { revalidatePath } from 'next/cache'

type Errors = Partial<Record<'imageFile1' | 'imageFile2', string>>

export default function RedbullSignupForm() {
    const router = useRouter()
    const [imageFile1, setImageFile1] = useState<File | null>(null)
    const [imageFile2, setImageFile2] = useState<File | null>(null)
    const [errors, setErrors] = useState<Errors>({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const fileInputRef1 = useRef<HTMLInputElement>(null)
    const fileInputRef2 = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    function validate(): boolean {
        const next: Errors = {}

        if (!imageFile1) {
            next.imageFile1 = 'Please upload the first image.'
        }
        if (!imageFile2) {
            next.imageFile2 = 'Please upload the second image.'
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

            let image_url_1 = null;
            if (imageFile1) {
                const { data, error } = await supabase.storage
                    .from('redbull-submissions')
                    .upload(`${user.id}/image1/${imageFile1.name}`, imageFile1, {
                        upsert: true,
                    });

                if (error) {
                    console.error('Error uploading file 1:', error);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('redbull-submissions').getPublicUrl(data.path);
                image_url_1 = publicUrl;
            }

            let image_url_2 = null;
            if (imageFile2) {
                const { data, error } = await supabase.storage
                    .from('redbull-submissions')
                    .upload(`${user.id}/image2/${imageFile2.name}`, imageFile2, {
                        upsert: true,
                    });

                if (error) {
                    console.error('Error uploading file 2:', error);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('redbull-submissions').getPublicUrl(data.path);
                image_url_2 = publicUrl;
            }

            if (image_url_1 && image_url_2) {
                const { error: submissionError } = await supabase.from('redbull_submissions').insert({
                    user_id: user.id,
                    image_url: image_url_1,
                    image_url_2: image_url_2,
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
                <div className="space-y-3 rounded-md border bg-foreground p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <Label>Submit Your Images</Label>
                            <p className="text-xs text-muted-foreground">
                                Upload your 2 images for the Red Bull event.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <Label>Please open the RedBull Tetris Link. Proceed to sign up using your email address and select Gurgaon as your city. Upon successful registration, please take a screenshot of the confirmation page and attach it below. Once registered, you may begin playing Tetris for an opportunity to participate in a real-life Tetris event in Dubai.</Label>
                        <input
                            ref={fileInputRef1}
                            id="image-upload-1"
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden cursor-target"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null
                                setImageFile1(f)
                                setSubmitted(false)
                                if (errors.imageFile1) {
                                    setErrors((prev) => ({ ...prev, imageFile1: undefined }))
                                }
                            }}
                            aria-invalid={!!errors.imageFile1}
                            aria-describedby={errors.imageFile1 ? 'image-error-1' : undefined}
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef1.current?.click()}
                            aria-controls="image-upload-1"
                            className="cursor-target"
                        >
                            Upload Image 1
                        </Button>
                        <span className="text-sm text-muted-foreground truncate">
                            {imageFile1 ? imageFile1.name : 'No file selected'}
                        </span>
                    </div>

                    {errors.imageFile1 && (
                        <p id="image-error-1" className="text-sm text-destructive">
                            {errors.imageFile1}
                        </p>
                    )}

                    <div className="flex  gap-3 flex-col justify-start items-start">
                        <Label>
                            Submit the Screenshot of the score.
                        </Label>
                        <div className="flex items-center gap-3 ">
                            <input
                                ref={fileInputRef2}
                                id="image-upload-2"
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden cursor-target"
                                onChange={(e) => {
                                    const f = e.target.files?.[0] ?? null
                                    setImageFile2(f)
                                    setSubmitted(false)
                                    if (errors.imageFile2) {
                                        setErrors((prev) => ({ ...prev, imageFile2: undefined }))
                                    }
                                }}
                                aria-invalid={!!errors.imageFile2}
                                aria-describedby={errors.imageFile2 ? 'image-error-2' : undefined}
                            />
                            <Button
                                type="button"
                                onClick={() => fileInputRef2.current?.click()}
                                aria-controls="image-upload-2"
                                className="cursor-target"
                            >
                                Upload Image 2
                            </Button>
                            <span className="text-sm text-muted-foreground truncate">
                                {imageFile2 ? imageFile2.name : 'No file selected'}
                            </span>

                        </div>

                    </div>

                    {errors.imageFile2 && (
                        <p id="image-error-2" className="text-sm text-destructive">
                            {errors.imageFile2}
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
