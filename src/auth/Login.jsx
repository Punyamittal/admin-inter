import React, { useState, useEffect } from 'react'
import { useAuthContext } from './AuthContext'
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const LockoutTimer = ({ lockedUntil, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(() => Math.ceil((lockedUntil - new Date()) / 1000))

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire()
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, onExpire])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  return (
    <div style={{ 
      padding: '12px', 
      backgroundColor: '#FEF2F2', 
      color: '#B91C1C', 
      borderRadius: '8px', 
      fontSize: '14px', 
      fontWeight: '600', 
      textAlign: 'center',
      marginBottom: '24px',
      border: '1px solid #FCA5A5'
    }}>
      Too many failed attempts. Try again in {mins}:{secs < 10 ? '0' : ''}{secs}
    </div>
  )
}

const Login = () => {
  const { login, lockedUntil } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locked, setLocked] = useState(lockedUntil && new Date() < lockedUntil)
  const navigate = useNavigate()

  useEffect(() => {
    if (lockedUntil && new Date() < lockedUntil) {
      setLocked(true)
    } else {
      setLocked(false)
    }
  }, [lockedUntil])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (locked) return

    setIsSubmitting(true)
    const { error } = await login(email, password)
    
    if (error) {
      toast.error(error)
      setIsSubmitting(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#EEF2FF', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            color: '#6366F1' 
          }}>
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Admin Portal</h1>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>Authorised personnel only</p>
          
          <div style={{ 
            marginTop: '16px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: '#F3F4F6', 
            padding: '6px 14px', 
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151'
          }}>
            <ShieldAlert size={14} color="#EF4444" />
            System monitored for unauthorised access
          </div>
        </div>

        {locked && (
          <LockoutTimer 
            lockedUntil={lockedUntil} 
            onExpire={() => setLocked(false)} 
          />
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Administrator email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required 
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vitstudent.ac.in"
                style={{ 
                  width: '100%', 
                  padding: '14px 14px 14px 48px', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  fontSize: '15px', 
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: locked ? '#F9FAFB' : '#FFFFFF'
                }}
                disabled={locked}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 48px 14px 48px', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  fontSize: '15px', 
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: locked ? '#F9FAFB' : '#FFFFFF'
                }}
                disabled={locked}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9CA3AF',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || locked}
            className="btn-rounded"
            style={{ 
              width: '100%', 
              padding: '16px', 
              backgroundColor: locked ? '#9CA3AF' : '#6366F1', 
              color: '#FFFFFF', 
              borderRadius: '14px', 
              fontSize: '16px', 
              fontWeight: '700', 
              border: 'none', 
              cursor: (isSubmitting || locked) ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if (!isSubmitting && !locked) e.target.style.backgroundColor = '#4F46E5' }}
            onMouseOut={(e) => { if (!isSubmitting && !locked) e.target.style.backgroundColor = '#6366F1' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/forgot-password" style={{ color: '#6366F1', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
            Forgotten password?
          </a>
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ color: '#6366F1', fontSize: '12px', opacity: 0.6, letterSpacing: '0.05em' }}>
          UNAUTHORISED ACCESS ATTEMPTS ARE LOGGED AND REPORTED.
        </p>
      </div>
    </div>
  )
}

export default Login
