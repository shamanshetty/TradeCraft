import { User, Video, Calendar, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

interface MatchCardProps {
    match: any
    currentUserId: string
}

export default function MatchCard({ match, currentUserId }: MatchCardProps) {
    // Determine if current user is user1 or user2 in the match object
    const isUser1 = match.user1.id === currentUserId
    const partner = isUser1 ? match.user2 : match.user1

    // Skills exchange logic
    // If I am user1, I teach skill1 and learn skill2
    const teachSkill = isUser1 ? match.skill1 : match.skill2
    const learnSkill = isUser1 ? match.skill2 : match.skill1

    return (
        <div className="glass rounded-xl p-6 card-hover group relative overflow-hidden">
            {/* Compatibility Badge */}
            <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full text-white text-sm font-medium shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{Math.round(match.score * 100)}% Match</span>
                </div>
            </div>

            <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xl font-bold uppercase">
                    {partner.name[0]}
                </div>
                <div>
                    <h3 className="text-lg font-bold">{partner.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{partner.bio}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg border border-primary-100 dark:border-primary-900/50">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase mb-1">You Teach</p>
                    <p className="font-bold text-gray-900 dark:text-white">{teachSkill.name}</p>
                    <div className="flex items-center mt-1">
                        <div className="flex space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < teachSkill.level ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-accent-50 dark:bg-accent-900/20 p-3 rounded-lg border border-accent-100 dark:border-accent-900/50">
                    <p className="text-xs text-accent-600 dark:text-accent-400 font-medium uppercase mb-1">You Learn</p>
                    <p className="font-bold text-gray-900 dark:text-white">{learnSkill.name}</p>
                    <div className="flex items-center mt-1">
                        <div className="flex space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < learnSkill.level ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Explanation */}
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-6 text-sm italic text-gray-600 dark:text-gray-300 border-l-4 border-primary-400">
                " {match.explanation || "Great skill synergy based on proficiency levels and availability."} "
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2 text-xs">
                    {/* Availability Indicators */}
                    {(partner.availability?.times || []).slice(0, 3).map((day: string, i: number) => (
                        <div key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md border border-white dark:border-dark-card z-10">
                            {day.slice(0, 3)}
                        </div>
                    ))}
                    {(partner.availability?.times || []).length > 3 && (
                        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md border border-white dark:border-dark-card z-0 pl-3">
                            +{(partner.availability?.times || []).length - 3}
                        </div>
                    )}
                </div>

                <Link
                    href={`/match/${match.id}`}
                    className="btn-primary py-2 px-4 text-sm flex items-center"
                >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
