'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import MatchCard from '@/components/MatchCard'
import { Search, Loader2, Sparkles, LogOut, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [matches, setMatches] = useState<any[]>([])

    // AI Assistant Toggle
    const [showAssistant, setShowAssistant] = useState(false)

    useEffect(() => {
        const initDashboard = async () => {
            try {
                setLoading(true)

                // 1. Get User
                const userData = await api.getCurrentUser()
                if (!userData) {
                    router.push('/onboarding')
                    return
                }
                setUser(userData)

                // 2. Discover Matches (AI Powered)
                // Note: In real app, might want to cache this or trigger manually
                const matchResults = await api.discoverMatches()
                setMatches(matchResults)

            } catch (error) {
                console.error('Error loading dashboard:', error)
                // If auth error, redirect
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) router.push('/auth')
            } finally {
                setLoading(false)
            }
        }

        initDashboard()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary-600 animate-pulse" />
                    </div>
                </div>
                <h2 className="mt-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
                    Finding your perfect skill matches...
                </h2>
                <p className="mt-2 text-gray-500 animate-pulse">Running AI semantic analysis on User Profile</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            {/* Header */}
            <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">TC</span>
                            </div>
                            <span className="text-xl font-bold gradient-text hidden sm:block">TradeCraft</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-slide-up">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome back, {user?.name.split(' ')[0]}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        We found <span className="font-bold text-primary-600">{matches.length} matches</span> compatible with your skills and goals.
                    </p>
                </div>

                {/* Matches Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {matches.length > 0 ? (
                        matches.map((match) => (
                            <MatchCard key={match.id} match={match} currentUserId={user.id} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-dark-border">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No matches found yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                We're still growing our community. Try adding more skills or adjusting your availability.
                            </p>
                            <Link href="/onboarding" className="btn-primary mt-6 inline-block">
                                Update Profile
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating AI Assistant Button */}
            {/* (Placeholder for Phase 10 integration) */}
            <button
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-pulse-slow"
                onClick={() => alert("AI Assistant implemented in backend - UI coming in next phase!")}
                title="Open AI Tutor"
            >
                <MessageSquare className="w-7 h-7" />
            </button>
        </div>
    )
}
