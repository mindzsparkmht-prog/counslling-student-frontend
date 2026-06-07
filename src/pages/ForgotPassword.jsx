import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { toast } from '../components/shared/Toast'
import SetPassword from './SetPassword'

export default function ForgotPassword() {
  const [step, setStep] = useState('memberId')
  const [memberId, setMemberId] = useState('')
  const [otp, setOtp] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/forgot-password', { memberId })
      setMaskedEmail(res.data.email)
      toast.info(`OTP sent to ${res.data.email}`)
      setStep('otp')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Member ID not found')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-otp', { memberId, otp })
      setResetToken(res.data.token)
      setStep('reset')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP')
    } finally { setLoading(false) }
  }

  if (step === 'reset') {
    return <SetPassword overrideToken={resetToken} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f36] to-[#2d3a6b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#ff6b35]">MindzSpark</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {step === 'memberId' ? (
            <>
              <h2 className="text-xl font-bold text-[#1a1f36] mb-1">Forgot Password</h2>
              <p className="text-gray-500 text-sm mb-5">Enter your Member ID to receive an OTP</p>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <input
                  className="input"
                  placeholder="Member ID (e.g. MS2026001)"
                  value={memberId}
                  onChange={e => setMemberId(e.target.value.toUpperCase())}
                  required
                />
                <button type="submit" disabled={loading} className="w-full bg-[#ff6b35] text-white font-semibold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Send OTP
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#1a1f36] mb-1">Enter OTP</h2>
              <p className="text-gray-500 text-sm mb-5">OTP sent to <strong>{maskedEmail}</strong></p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  className="input text-center text-2xl tracking-widest font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <button type="submit" disabled={loading} className="w-full bg-[#ff6b35] text-white font-semibold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => setStep('memberId')} className="w-full text-gray-400 text-sm">
                  ← Try different ID
                </button>
              </form>
            </>
          )}

          <Link to="/login" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-4">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
