/**
 * API Client for Backend Communication
 * Handles all HTTP requests to the FastAPI backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Add auth token to requests
        this.client.interceptors.request.use(async (config) => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`
            }
            return config
        })

        // Handle errors
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Redirect to login
                    window.location.href = '/auth'
                }
                return Promise.reject(error)
            }
        )
    }

    // User endpoints
    async getCurrentUser() {
        const { data } = await this.client.get('/api/users/me')
        return data
    }

    async createUser(userData: any) {
        const { data } = await this.client.post('/api/users', userData)
        return data
    }

    async updateUser(userData: any) {
        const { data } = await this.client.patch('/api/users/me', userData)
        return data
    }

    // Skill endpoints
    async getSkills(mode?: 'TEACH' | 'LEARN') {
        const { data } = await this.client.get('/api/skills', {
            params: mode ? { mode } : {},
        })
        return data
    }

    async createSkill(skillData: any) {
        const { data } = await this.client.post('/api/skills', skillData)
        return data
    }

    async updateSkill(skillId: string, skillData: any) {
        const { data } = await this.client.patch(`/api/skills/${skillId}`, skillData)
        return data
    }

    async deleteSkill(skillId: string) {
        await this.client.delete(`/api/skills/${skillId}`)
    }

    // Match endpoints
    async discoverMatches(limit: number = 10) {
        const { data } = await this.client.get('/api/matches/discover', {
            params: { limit },
        })
        return data
    }

    async getMatches(status?: string) {
        const { data } = await this.client.get('/api/matches', {
            params: status ? { status_filter: status } : {},
        })
        return data
    }

    async createMatch(matchData: any) {
        const { data } = await this.client.post('/api/matches', matchData)
        return data
    }

    async updateMatch(matchId: string, matchData: any) {
        const { data } = await this.client.patch(`/api/matches/${matchId}`, matchData)
        return data
    }

    async getMatch(matchId: string) {
        const { data } = await this.client.get(`/api/matches/${matchId}`)
        return data
    }

    // Session endpoints
    async getMatchSessions(matchId: string) {
        const { data } = await this.client.get(`/api/sessions/match/${matchId}`)
        return data
    }

    async createSession(sessionData: any) {
        const { data } = await this.client.post('/api/sessions', sessionData)
        return data
    }

    async generateAgenda(matchId: string, durationMinutes: number) {
        const { data } = await this.client.post('/api/sessions/generate-agenda', null, {
            params: { match_id: matchId, duration_minutes: durationMinutes },
        })
        return data
    }

    // Message endpoints
    async getMessages(matchId: string, limit: number = 100) {
        const { data } = await this.client.get(`/api/messages/match/${matchId}`, {
            params: { limit },
        })
        return data
    }

    async sendMessage(messageData: any) {
        const { data } = await this.client.post('/api/messages', messageData)
        return data
    }

    // AI Assistant endpoints
    async chatWithAssistant(messages: any[], context?: any) {
        const { data } = await this.client.post('/api/assistant/chat', {
            messages,
            context,
        })
        return data
    }
}

export const api = new APIClient()
