import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        })
        setIsSubmitting(false)
        setSent(true)
        if (error) {
            console.error('Password reset error:', error.message)
        }
    }

    return (
        <div className="auth-layout">
            <div className="auth-panel">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Reset Password</h1>
                    <p style={{ color: '#6B7280', fontSize: '15px' }}>Enter your administrator email</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: '20px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '12px', fontSize: '14px', marginBottom: '24px' }}>
                            If that email exists in our system, a reset link has been sent.
                        </div>
                        <a href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6366F1', fontWeight: '600', textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Back to Login
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@vitstudent.ac.in"
                                    className="input-modal-glass"
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn-rounded"
                            style={{ width: '100%', padding: '16px', backgroundColor: '#6366F1', color: '#FFFFFF', borderRadius: '14px', fontSize: '16px', fontWeight: '700', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 10px 24px rgba(99, 102, 241, 0.35)' }}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Recovery Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword
