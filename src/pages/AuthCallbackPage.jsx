import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallbackPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Authentication failed. Please try again.')
          setTimeout(() => navigate('/'), 3000)
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          // No session, redirect to login
          navigate('/')
        }
      } catch (err) {
        console.error('Callback handling error:', err)
        setError('Something went wrong. Redirecting to login...')
        setTimeout(() => navigate('/'), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        {loading ? (
          <>
            <div style={{ 
              fontSize: '24px',
              marginBottom: '20px'
            }}>
              🔄
            </div>
            <h2 style={{ 
              margin: '0 0 10px 0',
              color: '#333',
              fontSize: '24px'
            }}>
              Verifying your account...
            </h2>
            <p style={{ 
              color: '#666',
              fontSize: '16px'
            }}>
              Please wait while we confirm your email verification.
            </p>
          </>
        ) : error ? (
          <>
            <div style={{ 
              fontSize: '24px',
              marginBottom: '20px'
            }}>
              ❌
            </div>
            <h2 style={{ 
              margin: '0 0 10px 0',
              color: '#e74c3c',
              fontSize: '24px'
            }}>
              Authentication Error
            </h2>
            <p style={{ 
              color: '#666',
              fontSize: '16px'
            }}>
              {error}
            </p>
          </>
        ) : (
          <>
            <div style={{ 
              fontSize: '24px',
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <h2 style={{ 
              margin: '0 0 10px 0',
              color: '#27ae60',
              fontSize: '24px'
            }}>
              Account Verified!
            </h2>
            <p style={{ 
              color: '#666',
              fontSize: '16px'
            }}>
              Redirecting to your dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallbackPage 