import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder login logic
    if (email === 'admin@college.edu' && password === 'admin123') {
      localStorage.setItem('adminToken', 'mock-admin-jwt-token');
      navigate('/');
    } else {
      alert('Invalid admin credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1E1B4B',
      backgroundImage: `linear-gradient(rgba(30, 27, 75, 0.95), rgba(30, 27, 75, 0.95)), url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
      backgroundSize: 'cover',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '48px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#6366F1',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 24px'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Super Admin Portal</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>College Food Court Master Control</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.4)'
            }} />
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '14px 14px 14px 44px',
                borderRadius: '12px',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.4)'
            }} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '14px 44px 14px 44px',
                borderRadius: '12px',
                fontSize: '15px'
              }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="#" style={{ fontSize: '13px', color: '#6366F1', fontWeight: '500' }}>Forgot password?</a>
          </div>

          <button 
            type="submit" 
            style={{
              marginTop: '12px',
              backgroundColor: '#6366F1',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
            }}
          >
            Access Dashboard
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
          Restricted access. This activity is being logged.
        </p>
      </div>
    </div>
  );
};

export default Login;
