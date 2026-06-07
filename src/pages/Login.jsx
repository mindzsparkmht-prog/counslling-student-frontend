import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import { toast } from '../components/shared/Toast'

export default function Login() {
  const [step, setStep] = useState('credentials') // 'credentials' | 'otp'
  const [memberId, setMemberId] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [pendingMemberId, setPendingMemberId] = useState('')
  const otpRef = useRef(null)
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus()
  }, [step])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { memberId, password })
      if (data.user?.role === 'admin') {
        toast.error('Admin must use the admin portal to sign in')
        return
      }
      if (data.requires_otp) {
        setMaskedEmail(data.email)
        setPendingMemberId(data.memberId)
        setStep('otp')
        toast.info(`Verification code sent to ${data.email}`)
      } else {
        setAuth(data.user, data.access_token)
        redirectByRole(data.user.role)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/verify-login-otp', { memberId: pendingMemberId, otp })
      setAuth(data.user, data.access_token)
      redirectByRole(data.user.role)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const redirectByRole = (role) => {
    if (role === 'student') navigate('/student/home')
    else if (role === 'counselor') navigate('/counselor/dashboard')
    else navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f36] to-[#2d3a6b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo.webp"
            alt="MindzSpark"
            className="w-16 h-16 mx-auto mb-3 drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white">MindzSpark</h1>
          <p className="text-blue-200 text-sm mt-0.5">Excellence is our Identity</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {step === 'credentials' ? (
            <>
              <h2 className="text-xl font-bold text-[#1a1f36] mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-6">Sign in to your counseling portal</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                  <input
                    className="input"
                    placeholder="MS2026204 / C001"
                    value={memberId}
                    onChange={e => setMemberId(e.target.value.toUpperCase())}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-[#ff6b35] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6b35] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Sign In
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#1a1f36]">Verify Your Login</h2>
                <p className="text-gray-500 text-sm mt-1">
                  A 6-digit code was sent to <strong>{maskedEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  ref={otpRef}
                  className="input text-center text-2xl tracking-widest font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#ff6b35] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Verify & Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp('') }}
                  className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
                >
                  ← Use different credentials
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-blue-200 mt-6">
          Private portal — authorized users only
        </p>
      </div>
    </div>
  )
}
