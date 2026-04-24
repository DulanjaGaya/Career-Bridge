import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle, CheckCircle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * LoginPage - User login page
 * Handles email/password authentication
 */
const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const highlights = [
    'One sign-in for jobs, Q&A, readiness, and interview practice',
    'Dark, focused workspace designed for long sessions',
    'Fast access to your student or employer dashboard',
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    setLoading(true)
    try {
      const result = await login({ email: formData.email.trim(), password: formData.password })
      setLoading(false)

      if (result.success) {
        const redirectTo = result.user?.role === 'student'
          ? '/student/dashboard'
          : result.user?.role === 'employer'
            ? '/employer/dashboard'
            : '/browse-jobs'

        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        setTimeout(() => navigate(redirectTo), 1200)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setLoading(false)
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Login failed' })
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-blue px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,157,79,0.18),_transparent_28%),radial-gradient(circle_at_80%_15%,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,_rgba(6,11,27,0.9)_0%,_rgba(6,11,27,1)_100%)]" />
      <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <aside className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-200">
                <Sparkles className="h-4 w-4" />
                Career Bridge access point
              </div>

              <h1 className="mt-8 max-w-xl text-5xl font-black tracking-tight text-white">
                Welcome back to the space where career progress stays visible.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                Sign in once to continue across jobs, interview practice, Q&A, and readiness tracking in one focused workspace.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-2xl font-bold text-white">01</p>
                  <p className="mt-1 text-sm text-slate-400">Single account across the platform</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-2xl font-bold text-white">02</p>
                  <p className="mt-1 text-sm text-slate-400">Readiness, jobs, and conversations in sync</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-2xl font-bold text-white">03</p>
                  <p className="mt-1 text-sm text-slate-400">Fast routing to your role dashboard</p>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-slate-200">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    <span className="text-sm leading-6">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-accent/25 bg-accent/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent/90">Built for focus</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                The interface keeps the visual weight low and the next action obvious, so you can get back to work quickly.
              </p>
            </div>
          </aside>

          <section className="mx-auto w-full max-w-xl">
            <div className="glass-effect overflow-hidden rounded-[2rem] border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="border-b border-white/10 bg-white/5 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">Secure sign in</p>
                    <h2 className="mt-2 text-3xl font-bold text-white">Welcome Back</h2>
                  </div>
                  <div className="hidden rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent-100 sm:flex">
                    Session ready
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">Sign in to your Career Bridge account and continue where you left off.</p>
              </div>

              <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                {message.text && (
                  <div className={`flex items-start gap-3 rounded-2xl border px-4 py-4 ${
                    message.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-red-500/30 bg-red-500/10 text-red-200'
                  }`}>
                    {message.type === 'success' ? <CheckCircle size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
                    <span className="text-sm leading-6">{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-100">Email address</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3.5 transition focus-within:border-accent/50 focus-within:bg-slate-900">
                      <Mail size={18} className="text-accent" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-100">Password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3.5 transition focus-within:border-accent/50 focus-within:bg-slate-900">
                      <Lock size={18} className="text-accent" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                        autoComplete="current-password"
                      />
                    </div>
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-accent focus:ring-accent" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="font-medium text-accent transition hover:text-orange-300">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 px-4 py-3.5 font-bold text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(249,115,22,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                </form>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-300">
                  <span>Need an account?</span>
                  <Link to="/signup" className="font-semibold text-accent transition hover:text-orange-300">
                    Create one here
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
