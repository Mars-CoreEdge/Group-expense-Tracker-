import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import GroupDetailPage from './pages/GroupDetailPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error.message)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show modern loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)'
      }}>
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--space-4) auto' }}></div>
          <h2 className="text-xl font-medium" style={{ color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
            ExpenseTracker
          </h2>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
            Loading your experience...
          </p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          
          <Route 
            path="/auth/callback" 
            element={<AuthCallbackPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? <DashboardPage user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/groups/:groupId" 
            element={
              user ? <GroupDetailPage user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Catch all route - redirect to dashboard if logged in, login if not */}
          <Route 
            path="*" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App