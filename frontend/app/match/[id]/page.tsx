'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Send, Sparkles, Calendar, Clock,
    Video, MoreVertical, CheckCircle, Download, User
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function MatchDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const matchId = params.id as string

    const [loading, setLoading] = useState(true)
    const [match, setMatch] = useState<any>(null)
    const [currentUserId, setCurrentUserId] = useState<string>('')

    // Chat State
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Session State
    const [generatingAgenda, setGeneratingAgenda] = useState(false)
    const [agenda, setAgenda] = useState<any>(null)
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [sessionDate, setSessionDate] = useState('')
    const [sessionTime, setSessionTime] = useState('')
    const [duration, setDuration] = useState(60)

    // Polling for messages (MVP limitation: no websockets yet)
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (matchId) {
            // Initial fetch
            fetchMatchData()

            // Poll every 5 seconds
            interval = setInterval(fetchMessages, 5000)
        }

        return () => clearInterval(interval)
    }, [matchId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchMatchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth')
                return
            }
            setCurrentUserId(user.id)

            const matchData = await api.getMatch(matchId)
            setMatch(matchData)

            await fetchMessages()
            await fetchSessions()

        } catch (error) {
            console.error('Error fetching match:', error)
            toast.error('Failed to load match details')
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async () => {
        try {
            const msgs = await api.getMessages(matchId)
            setMessages(msgs)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    const fetchSessions = async () => {
        try {
            const sessions = await api.getMatchSessions(matchId)
            // If there's a pending session, show it (simplified)
            if (sessions && sessions.length > 0) {
                // Just checking if any exists for now
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            setSending(true)
            await api.sendMessage({
                match_id: matchId,
                content: newMessage
            })
            setNewMessage('')
            await fetchMessages()
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const handleGenerateAgenda = async () => {
        try {
            setGeneratingAgenda(true)
            const result = await api.generateAgenda(matchId, duration)
            setAgenda(result.agendas)
            toast.success('AI Agenda Generated!')
        } catch (error) {
            toast.error('Failed to generate agenda')
        } finally {
            setGeneratingAgenda(false)
        }
    }

    const handleScheduleSession = async () => {
        if (!sessionDate || !sessionTime || !agenda) return

        try {
            const scheduledAt = new Date(`${sessionDate}T${sessionTime}`)

            // Combine agendas into one string
            const agendaText = Object.entries(agenda).map(([title, content]) =>
                `## ${title}\n\n${content}`
            ).join('\n\n---\n\n')

            await api.createSession({
                match_id: matchId,
                scheduled_at: scheduledAt.toISOString(),
                duration_minutes: duration,
                agenda: agendaText,
                meeting_link: 'https://meet.google.com/new' // Placeholder
            })

            toast.success('Session scheduled successfully!')
            setShowScheduleModal(false)
            // Refresh to show session (logic skipped for brevity)
        } catch (error) {
            toast.error('Failed to schedule session')
        }
    }

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>
    if (!match) return <div className="p-8 text-center">Match not found</div>

    const isUser1 = match.user1.id === currentUserId
    const partner = isUser1 ? match.user2 : match.user1
    const mySkill = isUser1 ? match.skill1 : match.skill2
    const partnerSkill = isUser1 ? match.skill2 : match.skill1

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
            {/* Header */}
            <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                            {partner.name[0]}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 dark:text-white">{partner.name}</h1>
                            <p className="text-xs text-gray-500 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="btn-primary py-2 px-3 text-sm flex items-center"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Schedule Session</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-dark-bg relative">
                    {/* Scrollable Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* System Message - Match Info */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-3 text-sm text-center max-w-md">
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">It's a Match! 🎉</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    You teach <span className="font-medium text-primary-600">{mySkill.name}</span> and learn <span className="font-medium text-accent-600">{partnerSkill.name}</span>.
                                </p>
                            </div>
                        </div>

                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-white rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                            {format(new Date(msg.created_at), 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 input py-2"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar (Desktop only) */}
                <div className="hidden lg:flex w-80 bg-gray-50 dark:bg-dark-card border-l border-gray-200 dark:border-dark-border flex-col overflow-y-auto">
                    <div className="p-6">
                        <h2 className="font-bold text-lg mb-4 flex items-center">
                            <Sparkles className="w-5 h-5 text-accent-500 mr-2" />
                            AI Assistant
                        </h2>

                        {!agenda ? (
                            <div className="bg-white dark:bg-dark-bg p-4 rounded-xl border border-dashed border-gray-300 dark:border-dark-border text-center">
                                <p className="text-sm text-gray-500 mb-4">
                                    Need help planning your session? I can generate a structured agenda based on your skill levels.
                                </p>
                                <button
                                    onClick={handleGenerateAgenda}
                                    disabled={generatingAgenda}
                                    className="btn-accent w-full text-sm py-2"
                                >
                                    {generatingAgenda ? (
                                        <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Generating...</>
                                    ) : (
                                        'Generate Agenda'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium text-sm text-gray-500">Suggested Agenda</h3>
                                    <button onClick={() => setAgenda(null)} className="text-xs text-primary-600 hover:underline">Reset</button>
                                </div>

                                {Object.entries(agenda).map(([title, content]: [string, any], idx) => (
                                    <div key={idx} className="bg-white dark:bg-dark-bg p-4 rounded-xl border border-gray-200 dark:border-dark-border text-sm">
                                        <h4 className="font-bold mb-2 text-primary-600">{title}</h4>
                                        <div className="prose dark:prose-invert text-xs max-w-none whitespace-pre-wrap">
                                            {content}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setShowScheduleModal(true)}
                                    className="btn-primary w-full text-sm"
                                >
                                    Use This Agenda
                                </button>
                            </div>
                        )}

                        <div className="mt-8">
                            <h3 className="font-bold mb-2 text-sm text-gray-500 uppercase">Match Reasoning</h3>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-sm italic text-gray-700 dark:text-gray-300 border-l-4 border-primary-500">
                                "{match.explanation}"
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
                        <h2 className="text-2xl font-bold mb-4">Schedule Session</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    value={sessionDate}
                                    onChange={(e) => setSessionDate(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={sessionTime}
                                        onChange={(e) => setSessionTime(e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Duration</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="input"
                                    >
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>60 min</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded-lg flex items-center">
                                <Video className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-500">Google Meet link will be generated</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="flex-1 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleSession}
                                disabled={!sessionDate || !sessionTime || !agenda}
                                className="flex-1 btn-primary"
                            >
                                Confirm
                            </button>
                        </div>
                        {!agenda && (
                            <p className="text-xs text-red-500 mt-2 text-center">
                                Please generate an AI agenda first!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
