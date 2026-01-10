'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { User, BookOpen, Clock, Check, ChevronRight, Loader2, Award } from 'lucide-react'

// Steps in the onboarding process
const STEPS = [
    { id: 1, name: 'Profile', icon: User },
    { id: 2, name: 'Teach', icon: Award },
    { id: 3, name: 'Learn', icon: BookOpen },
    { id: 4, name: 'Availability', icon: Clock },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [userId, setUserId] = useState<string | null>(null)

    // Form State
    const [profile, setProfile] = useState({ name: '', bio: '' })
    const [teachSkills, setTeachSkills] = useState<{ name: string; level: number }[]>([])
    const [learnSkills, setLearnSkills] = useState<{ name: string; level: number }[]>([])
    const [availability, setAvailability] = useState<string[]>([])

    // Temporary input state
    const [skillInput, setSkillInput] = useState('')
    const [skillLevel, setSkillLevel] = useState(3)

    useEffect(() => {
        // Check auth status
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth')
                return
            }
            setUserId(session.user.id)

            // Check if user already exists
            try {
                const user = await api.getCurrentUser()
                if (user) {
                    // If user exists, redirect to dashboard
                    router.push('/dashboard')
                }
            } catch (error) {
                // User doesn't exist yet, proceed with onboarding
            }
        }

        checkAuth()
    }, [router])

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        } else {
            handleSubmit()
        }
    }

    const handleAddSkill = (type: 'TEACH' | 'LEARN') => {
        if (!skillInput.trim()) return

        const newSkill = { name: skillInput, level: skillLevel }

        if (type === 'TEACH') {
            setTeachSkills([...teachSkills, newSkill])
        } else {
            setLearnSkills([...learnSkills, newSkill])
        }

        setSkillInput('')
        setSkillLevel(3)
    }

    const removeSkill = (type: 'TEACH' | 'LEARN', index: number) => {
        if (type === 'TEACH') {
            const newSkills = [...teachSkills]
            newSkills.splice(index, 1)
            setTeachSkills(newSkills)
        } else {
            const newSkills = [...learnSkills]
            newSkills.splice(index, 1)
            setLearnSkills(newSkills)
        }
    }

    const toggleAvailability = (day: string) => {
        if (availability.includes(day)) {
            setAvailability(availability.filter(d => d !== day))
        } else {
            setAvailability([...availability, day])
        }
    }

    const handleSubmit = async () => {
        if (!userId) return
        setLoading(true)

        try {
            // 1. Create User
            await api.createUser({
                name: profile.name,
                email: (await supabase.auth.getUser()).data.user?.email,
                bio: profile.bio,
                availability: { times: availability }
            })

            // 2. Add Teaching Skills
            for (const skill of teachSkills) {
                await api.createSkill({
                    name: skill.name,
                    level: skill.level,
                    mode: 'TEACH'
                })
            }

            // 3. Add Learning Skills
            for (const skill of learnSkills) {
                await api.createSkill({
                    name: skill.name,
                    level: skill.level,
                    mode: 'LEARN'
                })
            }

            toast.success('Profile created successfully!')
            router.push('/dashboard')

        } catch (error: any) {
            toast.error('Failed to create profile: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <nav aria-label="Progress">
                        <ol className="flex items-center">
                            {STEPS.map((step, stepIdx) => (
                                <li key={step.name} className={`relative ${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                                    {step.id < currentStep ? (
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-primary-600" />
                                        </div>
                                    ) : null}
                                    <div className="relative flex items-center justify-center">
                                        <span
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-dark-bg ${step.id < currentStep
                                                    ? 'bg-primary-600'
                                                    : step.id === currentStep
                                                        ? 'bg-white dark:bg-dark-card border-2 border-primary-600'
                                                        : 'bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border'
                                                }`}
                                        >
                                            {step.id < currentStep ? (
                                                <Check className="h-5 w-5 text-white" aria-hidden="true" />
                                            ) : (
                                                <step.icon
                                                    className={`h-4 w-4 ${step.id === currentStep ? 'text-primary-600' : 'text-gray-500'
                                                        }`}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-dark-card shadow rounded-2xl p-8 border border-gray-100 dark:border-dark-border">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="input"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="input min-h-[100px]"
                                        placeholder="I am a software engineer passionate about..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold">What can you teach?</h2>
                            <p className="text-gray-500 text-sm">Add skills you are proficient in and willing to share.</p>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Skill Name</label>
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        className="input"
                                        placeholder="e.g. React, Python"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill('TEACH')}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-sm font-medium mb-1">Level (1-5)</label>
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(Number(e.target.value))}
                                        className="input"
                                    >
                                        {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => handleAddSkill('TEACH')} className="btn-primary mb-[1px]">Add</button>
                            </div>

                            <div className="space-y-2">
                                {teachSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{skill.name}</span>
                                            <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                                                Level {skill.level}
                                            </span>
                                        </div>
                                        <button onClick={() => removeSkill('TEACH', idx)} className="text-red-500 hover:text-red-700 text-sm">
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {teachSkills.length === 0 && (
                                    <p className="text-center text-gray-400 py-4">No skills added yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold">What do you want to learn?</h2>
                            <p className="text-gray-500 text-sm">Add skills you want to improve or learn from scratch.</p>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Skill Name</label>
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        className="input"
                                        placeholder="e.g. Docker, Rust"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill('LEARN')}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-sm font-medium mb-1">Profiency</label>
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(Number(e.target.value))}
                                        className="input"
                                    >
                                        {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => handleAddSkill('LEARN')} className="btn-accent mb-[1px]">Add</button>
                            </div>

                            <div className="space-y-2">
                                {learnSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{skill.name}</span>
                                            <span className="text-xs px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded">
                                                Target Level {skill.level}
                                            </span>
                                        </div>
                                        <button onClick={() => removeSkill('LEARN', idx)} className="text-red-500 hover:text-red-700 text-sm">
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {learnSkills.length === 0 && (
                                    <p className="text-center text-gray-400 py-4">No learning goals added yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold">When are you available?</h2>
                            <p className="text-gray-500 text-sm">Select days you can typically meet.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => toggleAvailability(day)}
                                        className={`p-4 rounded-xl border transition-all ${availability.includes(day)
                                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                                                : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:border-primary-300'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border flex justify-between">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={loading || (currentStep === 1 && !profile.name) || (currentStep === 2 && teachSkills.length === 0) || (currentStep === 3 && learnSkills.length === 0)}
                            className="btn-primary flex items-center"
                        >
                            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            {currentStep === STEPS.length ? 'Complete Profile' : 'Next Step'}
                            {!loading && currentStep !== STEPS.length && <ChevronRight className="ml-2 h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
