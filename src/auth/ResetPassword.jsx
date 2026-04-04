import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import zxcvbn from 'zxcvbn'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const strength = zxcvbn(password)
    const score = strength.score // 0-4

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirm) {
            toast.error('Passwords do not match')
            return
        }
        if (score < 3) {
            toast.error('Password is too weak. Aim for a strong score.')
            return
        }

        setIsSubmitting(true)
        const { error } = await supabase.auth.updateUser({ password })
        setIsSubmitting(false)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Password updated successfully. Please sign in.')
            navigate('/login')
        }
    }

    const getStrengthColor = (s) => ['#EF4444', '#F97316', '#FBBF24', '#10B981', '#059669'][s]

    return (
        <div className="auth-layout">
            <div className="auth-panel">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>New Password</h1>
                    <p style={{ color: '#6B7280', fontSize: '15px' }}>Security requirement: Strong (3/4) or better</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required 
                                minLength={12}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-modal-glass"
                                style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: '12px', outline: 'none' }}
                                placeholder="Min 12 characters"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {/* Strength Meter */}
                        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: i < score ? getStrengthColor(score) : '#E5E7EB' }}></div>
                                ))}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: getStrengthColor(score) }}>
                                {['Very Weak', 'Weak', 'So-so', 'Strong', 'Great!'][score]}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
                        <input 
                            type="password" 
                            required 
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="input-modal-glass"
                            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', outline: 'none' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting || score < 3}
                        className="btn-rounded"
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            backgroundColor: (isSubmitting || score < 3) ? '#9CA3AF' : '#6366F1', 
                            color: '#FFFFFF', 
                            borderRadius: '14px', 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            border: 'none', 
                            cursor: (isSubmitting || score < 3) ? 'not-allowed' : 'pointer',
                            boxShadow: (isSubmitting || score < 3) ? 'none' : '0 10px 24px rgba(99, 102, 241, 0.35)'
                        }}
                    >
                        {isSubmitting ? 'Updating...' : 'Set New Password'}
                    </button>
                    {score < 3 && password.length > 0 && (
                        <p style={{ marginTop: '12px', fontSize: '12px', color: '#EF4444', textAlign: 'center', fontWeight: '500' }}>
                            Password is not strong enough for admin accounts.
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
