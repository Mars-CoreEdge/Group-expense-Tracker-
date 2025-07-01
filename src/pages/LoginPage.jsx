import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
// import { createLogger } from 'vite'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    if (!email || !password) {
      setAuthError('Email and password are required')
      return false
    }
    
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters')
      return false
    }
    
    if (isSignUp && password !== confirmPassword) {
      setAuthError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')
    
    if (!validateForm()) return
    
    setAuthLoading(true)
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) throw error
        
        if (data.user && !data.user.email_confirmed_at) {
          setAuthMessage('Please check your email and click the confirmation link to complete registration!')
        } else {
          setAuthMessage('Registration successful!')
          navigate('/dashboard')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        setAuthMessage('Login successful!')
        navigate('/dashboard')
      }
    } catch (error) {
      setAuthError(error?.message || error?.toString() || 'Unknown error')
      // console.log(error)
    } finally {
      setAuthLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setAuthError('')
    setAuthMessage('')
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  return (
    <div className="flex items-center justify-center" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
      padding: 'var(--space-4)'
    }}>
      <div className="card fade-in" style={{ 
        maxWidth: '450px',
        width: '100%'
      }}>
        <div className="card-body" style={{ padding: 'var(--space-10)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: 'var(--space-4)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              $
            </div>
            <h1 className="text-3xl font-bold" style={{ 
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-2)'
            }}>
              ExpenseTracker
            </h1>
            <p className="text-lg" style={{ color: 'var(--gray-600)' }}>
              {isSignUp ? 'Create your account' : 'Welcome back!'}
            </p>
          </div>

          {/* Messages */}
          {authMessage && (
            <div className="alert alert-success fade-in" style={{ marginBottom: 'var(--space-6)' }}>
              <span style={{ marginRight: 'var(--space-2)' }}>✓</span>
              {authMessage}
            </div>
          )}

          {authError && (
            <div className="alert alert-error fade-in" style={{ marginBottom: 'var(--space-6)' }}>
              <span style={{ marginRight: 'var(--space-2)' }}>×</span>
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="btn btn-primary btn-lg"
              style={{ 
                width: '100%',
                marginBottom: 'var(--space-6)',
                background: authLoading ? 'var(--gray-400)' : 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)'
              }}
            >
              {authLoading ? (
                <>
                  <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                  Processing...
                </>
              ) : (
                <>
                  <span style={{ marginRight: 'var(--space-2)' }}>
                    {isSignUp ? '→' : '→'}
                  </span>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>
          
          {/* Toggle Auth Mode */}
          <div style={{ textAlign: 'center' }}>
            <p className="text-sm" style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-3)' }}>
              {isSignUp 
                ? 'Already have an account?' 
                : "Don't have an account?"
              }
            </p>
            <button 
              onClick={toggleAuthMode}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              {isSignUp 
                ? 'Sign In Instead' 
                : 'Create Account'
              }
            </button>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 'var(--space-8)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
              Secure expense tracking for teams and individuals
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 