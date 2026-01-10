'use client'

import Link from 'next/link'
import { Brain, Calendar, MessageSquare, Users, TrendingUp, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card">
            {/* Navigation */}
            <nav className="border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">TC</span>
                            </div>
                            <span className="text-xl font-bold gradient-text">TradeCraft</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">
                                Product
                            </Link>
                            <Link href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">
                                Solutions
                            </Link>
                            <Link href="#why" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">
                                Community
                            </Link>
                            <Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">
                                Pricing
                            </Link>
                        </div>

                        <Link href="/auth" className="btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container-custom py-20 md:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-slide-up">
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Master Technical Skills Through{' '}
                            <span className="gradient-text">Exchange</span>, Not Expenses.
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            AI-powered matching for students and pros to swap knowledge. Learn what you need, teach what you know.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/auth" className="btn-primary inline-flex items-center justify-center">
                                Join the Community
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link href="#how-it-works" className="btn-outline inline-flex items-center justify-center">
                                Learn More
                            </Link>
                        </div>

                        {/* Trusted By */}
                        <div className="pt-8">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by leading enterprises</p>
                            <div className="flex items-center space-x-8 opacity-60">
                                <div className="text-lg font-semibold">▲ Adthena! Corp</div>
                                <div className="text-lg font-semibold">● OmniGlobal</div>
                                <div className="text-lg font-semibold">◆ DataSphere</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Illustration */}
                    <div className="relative animate-fade-in">
                        <div className="glass rounded-2xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <div>
                                        <div className="font-semibold">Alex Chen</div>
                                        <div className="text-sm text-gray-500">React Expert</div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded-full text-sm font-medium">
                                    AI Match: 94%
                                </div>
                            </div>

                            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border-l-4 border-primary-600">
                                <div className="flex items-start space-x-2">
                                    <Brain className="w-5 h-5 text-primary-600 mt-0.5" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        "Alex wants to learn Docker at intermediate level, and you're teaching advanced Docker.
                                        You want to learn React basics, and Alex teaches React at expert level.
                                        Your schedules overlap on Tuesday and Thursday evenings."
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 border-2 border-white dark:border-dark-card"></div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white dark:border-dark-card"></div>
                                </div>
                                <button className="btn-accent text-sm">
                                    Request Exchange
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section id="features" className="bg-gray-50 dark:bg-dark-card py-20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Key Features & Capabilities</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Powered by AI to make skill exchange seamless and effective
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass rounded-2xl p-8 card-hover">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">AI Semantic Matching</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Leverage advanced machine learning to predict trends and identify anomalies before they impact your business.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Embedding-based similarity
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Reciprocity scoring
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Explainable matches
                                </li>
                            </ul>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass rounded-2xl p-8 card-hover">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-6">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Smart Session Agendas</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Work together seamlessly across teams with real-time editing and automated reports.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    AI-generated agendas
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Time-optimized sessions
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Calendar integration
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass rounded-2xl p-8 card-hover">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">In-app AI Tutor</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Built for a secure, enterprise-ready architecture designed for scale with ease.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Technical Q&A
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Code snippets
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-accent-600" />
                                    Learning guidance
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How it Works</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Four simple steps to start exchanging skills
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { num: 1, icon: Users, title: 'Create Profile', desc: 'Add skills you teach and want to learn' },
                            { num: 2, icon: Brain, title: 'Get Matched', desc: 'AI finds perfect skill exchange partners' },
                            { num: 3, icon: Calendar, title: 'Swap Knowledge', desc: 'Schedule and conduct learning sessions' },
                            { num: 4, icon: TrendingUp, title: 'Level Up', desc: 'Track progress and grow your skills' },
                        ].map((step) => (
                            <div key={step.num} className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                                    {step.num}
                                </div>
                                <step.icon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why TradeCraft */}
            <section id="why" className="bg-gray-50 dark:bg-dark-card py-20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why TradeCraft?</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { icon: TrendingUp, title: 'Faster Skill Acquisition', desc: 'Leverage advanced machine learning to predict trends and identify anomalies before they impact your business.' },
                            { icon: Lightbulb, title: 'Personalized Learning', desc: 'Work together seamlessly across teams with real-time editing and automated reports.' },
                            { icon: Users, title: 'Community Driven', desc: 'Built on a secure, enterprise-ready architecture designed for scale with ease.' },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <item.icon className="w-16 h-16 mx-auto mb-4 text-primary-600" />
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="glass rounded-3xl p-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Join thousands of learners exchanging skills every day
                        </p>
                        <Link href="/auth" className="btn-primary inline-flex items-center">
                            Create Your Profile
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-dark-border py-12">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li><Link href="/features">Features</Link></li>
                                <li><Link href="/solutions">Data Solutions</Link></li>
                                <li><Link href="/customers">Customers</Link></li>
                                <li><Link href="/pricing">Pricing</Link></li>
                                <li><Link href="/press">Press</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li><Link href="/about">About us</Link></li>
                                <li><Link href="/careers">Careers</Link></li>
                                <li><Link href="/category">Category</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li><Link href="/resources">Resources</Link></li>
                                <li><Link href="/courses">Courses</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Contact</h4>
                            <div className="space-y-4">
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    </a>
                                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                    </a>
                                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Newsletter</p>
                                    <div className="flex mt-2">
                                        <input type="email" placeholder="Enter your email" className="input text-sm" />
                                        <button className="btn-primary ml-2">Subscribe</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-dark-border mt-12 pt-8 text-center text-gray-500 dark:text-gray-400">
                        <p>© TradeCraft Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
