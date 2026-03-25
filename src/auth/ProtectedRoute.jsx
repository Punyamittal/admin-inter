import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './AuthContext'

const FullPageSpinner = ({ message = 'Verifying credentials...', dark = true }) => (
  <div style={{ 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: dark ? '#0F172A' : '#FFFFFF',
    flexDirection: 'column',
    gap: '20px',
    color: dark ? '#FFFFFF' : '#0F172A'
  }}>
    <div style={{ 
        width: '44px', 
        height: '44px', 
        border: '4px solid #6366F1', 
        borderTopColor: 'transparent', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
    }}></div>
    <p style={{ fontWeight: '500', opacity: 0.8 }}>{message}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export function ProtectedRoute({ children }) {
  const { admin, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return <FullPageSpinner dark={true} />
  }

  if (!admin) {
    // Save current location for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
