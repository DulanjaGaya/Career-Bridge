import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, AlertCircle, CheckCircle, ShieldCheck, Sparkles, ArrowRight, Briefcase, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * SignupPage - User registration page
 * Handles user signup with name, email, password, and role selection
 */
const SignupPage = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })

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
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    // Name validation - must contain letters, no only numbers/symbols
    const trimmedName = formData.name.trim()
    if (trimmedName.length < 2) {
      setMessage({ type: 'error', text: 'Name can only contain letters and spaces' })
      return
    }

    if (trimmedName.length > 50) {
      setMessage({ type: 'error', text: 'Name must not exceed 50 characters' })
      return
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) {
      setMessage({ type: 'error', text: 'Name can only contain letters and spaces' })
      return
    }

    // Only letters and spaces allowed
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setMessage({ type: 'error', text: 'Name can only contain letters and spaces' })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    if (formData.email.trim().length > 100) {
      setMessage({ type: 'error', text: 'Email must not exceed 100 characters' })
      return
    }

    // Password validation
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    if (formData.password.length > 128) {
      setMessage({ type: 'error', text: 'Password must not exceed 128 characters' })
      return
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      })
      setLoading(false)

      if (result.success) {
        const redirectTo = result.user?.role === 'student'
          ? '/student/dashboard'
          : result.user?.role === 'employer'
            ? '/employer/dashboard'
            : '/browse-jobs'

        setMessage({ type: 'success', text: 'Account created! Redirecting to dashboard...' })
        setTimeout(() => navigate(redirectTo), 1200)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setLoading(false)
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Signup failed' })
    }
  }

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'university', label: 'University' },
    { value: 'employer', label: 'Employer' }
  ]

  const roleCards = {
    student: {
      icon: GraduationCap,
      title: 'Student-ready',
      text: 'Build your profile, track readiness, and prepare for opportunities.',
    },
    university: {
      icon: ShieldCheck,
      title: 'University access',
      text: 'Support cohorts, share opportunities, and manage guidance workflows.',
    },
    employer: {
      icon: Briefcase,
      title: 'Employer access',
      text: 'Post jobs, review applicants, and move candidates through hiring flows.',
    },
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-blue px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(248,157,79,0.16),_transparent_30%),radial-gradient(circle_at_20%_15%,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(180deg,_rgba(6,11,27,0.92)_0%,_rgba(6,11,27,1)_100%)]" />
      <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-100">
                <Sparkles className="h-4 w-4" />
                Start your Career Bridge profile
              </div>

              <h1 className="mt-8 max-w-xl text-5xl font-black tracking-tight text-white">
                Create an account designed for real career movement.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                Build once, then move seamlessly into dashboards, interview practice, Q&A, and opportunity tracking with a single profile.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {['Profile', 'Practice', 'Progress'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-2xl font-bold text-white">0{index + 1}</p>
                    <p className="mt-1 text-sm text-slate-400">{item} in one connected flow</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-3">
                {roles.map((role) => {
                  const meta = roleCards[role.value]
                  const Icon = meta.icon

                  return (
                    <div key={role.value} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-slate-200">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{meta.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{meta.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-accent/25 bg-accent/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent/90">One account</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Students, universities, and employers all move through the same polished experience, without bouncing between disconnected pages.
              </p>
            </div>
          </aside>

          <section className="mx-auto w-full max-w-2xl">
            <div className="glass-effect overflow-hidden rounded-[2rem] border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="border-b border-white/10 bg-white/5 px-6 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">Create your account</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Create Account</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">Join Career Bridge and start your journey with a profile that fits your role.</p>
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
                    <span className="mb-2 block text-sm font-semibold text-slate-100">Full name</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3.5 transition focus-within:border-accent/50 focus-within:bg-slate-900">
                      <User size={18} className="text-accent" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                        autoComplete="name"
                      />
                    </div>
                  </label>

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
                    <span className="mb-2 block text-sm font-semibold text-slate-100">I am a</span>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3.5 text-slate-100 outline-none transition focus:border-accent/50 focus:bg-slate-900"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value} className="bg-slate-950 text-white">
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
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
                          autoComplete="new-password"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-100">Confirm password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3.5 transition focus-within:border-accent/50 focus-within:bg-slate-900">
                        <Lock size={18} className="text-accent" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                          autoComplete="new-password"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-300">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900 text-accent focus:ring-accent" required />
                    <span>I agree to the Terms of Service and Privacy Policy</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 px-4 py-3.5 font-bold text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(249,115,22,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                </form>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-300">
                  <span>Already have an account?</span>
                  <Link to="/login" className="font-semibold text-accent transition hover:text-orange-300">
                    Sign in here
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

export default SignupPage
