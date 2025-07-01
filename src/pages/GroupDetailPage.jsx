import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { apiService } from '../lib/api'

const GroupDetailPage = ({ user }) => {
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [expenseError, setExpenseError] = useState('')
  const [expenseMessage, setExpenseMessage] = useState('')
  const navigate = useNavigate()
  const { groupId } = useParams()

  useEffect(() => {
    if (user && groupId) {
      fetchGroup()
      fetchExpenses()
    }
  }, [user, groupId])

  const fetchGroup = async () => {
    try {
      setLoading(true)
      // Fetch all groups and find the one with matching ID
      const response = await apiService.getGroups()
      const groups = response.groups || []
      const foundGroup = groups.find(group => group.id === parseInt(groupId))
      
      if (foundGroup) {
        setGroup(foundGroup)
      } else {
        // Group not found, redirect to dashboard
        console.error('Group not found')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true)
      const response = await apiService.getExpensesForGroup(groupId)
      setExpenses(response.expenses || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setExpenseError('Error loading expenses: ' + (error?.message || 'Unknown error'))
    } finally {
      setExpensesLoading(false)
    }
  }

  const addExpense = async (e) => {
    e.preventDefault()
    setExpenseError('')
    setExpenseMessage('')

    if (!expenseDescription.trim()) {
      setExpenseError('Expense description is required')
      return
    }

    if (!expenseAmount || isNaN(expenseAmount) || parseFloat(expenseAmount) <= 0) {
      setExpenseError('Please enter a valid amount greater than 0')
      return
    }

    try {
      setExpensesLoading(true)
      const newExpense = await apiService.addExpenseToGroup(groupId, {
        description: expenseDescription.trim(),
        amount: parseFloat(expenseAmount)
      })
      
      setExpenses(prev => [newExpense, ...prev])
      setExpenseDescription('')
      setExpenseAmount('')
      setShowAddExpense(false)
      setExpenseMessage(`Expense "${newExpense.description}" added successfully!`)
      setTimeout(() => setExpenseMessage(''), 3000)
      
    } catch (error) {
      console.error('Error adding expense:', error)
      setExpenseError('Error adding expense: ' + (error?.message || 'Unknown error'))
    } finally {
      setExpensesLoading(false)
    }
  }

  const deleteExpense = async (expenseId, description) => {
    if (!window.confirm(`Are you sure you want to delete "${description}"?`)) {
      return
    }

    try {
      // Call API to delete from database
      await apiService.deleteExpense(expenseId)
      
      // Update local state only after successful deletion
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId))
      setExpenseMessage(`Expense "${description}" deleted successfully!`)
      setTimeout(() => setExpenseMessage(''), 3000)
      
    } catch (error) {
      console.error('Error deleting expense:', error)
      setExpenseError('Error deleting expense: ' + (error?.message || 'Unknown error'))
    }
  }

  const calculateTotal = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2)
  }

  // Calculate statistics
  const totalAmount = calculateTotal()
  const expenseCount = expenses.length
  const averageExpense = expenseCount > 0 ? (parseFloat(totalAmount) / expenseCount).toFixed(2) : '0.00'
  const todaysExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.created_at).toDateString()
    const today = new Date().toDateString()
    return expenseDate === today
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ 
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--space-4) auto' }}></div>
          <p style={{ color: '#64748b' }}>Loading group details...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center" style={{ 
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>×</div>
          <h2 className="text-2xl font-semibold" style={{ marginBottom: 'var(--space-4)', color: '#1e293b' }}>
            Group not found
          </h2>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary btn-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8fafc',
      padding: 0
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: 'var(--space-6)',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ 
                background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(100, 116, 139, 0.3)',
                marginBottom: 'var(--space-3)',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.4)'
                e.target.style.background = 'linear-gradient(135deg, #475569 0%, #334155 100%)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(100, 116, 139, 0.3)'
                e.target.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
              }}
            >
              <span style={{ fontSize: '1rem' }}>←</span>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold" style={{ color: '#1e293b', marginBottom: 'var(--space-1)' }}>
              {group.name}
            </h1>
            {group.description && (
              <p style={{ color: '#64748b' }}>{group.description}</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddExpense(true)}
              className="btn btn-primary"
            >
              <span>+</span>
              Add Expense
            </button>
          </div>
        </div>

        {/* Messages */}
        {expenseMessage && (
          <div className="alert alert-success fade-in" style={{ marginTop: 'var(--space-4)' }}>
            <span style={{ marginRight: 'var(--space-2)' }}>✓</span>
            {expenseMessage}
          </div>
        )}

        {expenseError && (
          <div className="alert alert-error fade-in" style={{ marginTop: 'var(--space-4)' }}>
            <span style={{ marginRight: 'var(--space-2)' }}>×</span>
            {expenseError}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex',
        height: 'calc(100vh - 140px)',
        width: '100%',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)'
      }}>
        {/* Left Side - Statistics Overview */}
        <div style={{ 
          flex: '1 1 60%',
          minWidth: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: 'var(--space-2)'
            }}>
              Expense Overview
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Track and monitor all expenses for this group
            </p>
          </div>

          {/* Statistics Cards - Vertical Layout */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            flex: 1
          }}>
            {/* Row 1 - Total Spent and Expense Count */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', height: '200px' }}>
              {/* Total Spent Card */}
              <div style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '2rem' }}>💰</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                    Total Spent
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    ${totalAmount}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Total expenses
                  </div>
                </div>
              </div>

              {/* Expense Count Card */}
              <div style={{
                flex: 1,
                background: '#059669',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '2rem' }}>📊</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                    Expenses
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    {expenseCount}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Total entries
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 - Average and Today */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', height: '200px' }}>
              {/* Average Card */}
              <div style={{
                flex: 1,
                background: '#f59e0b',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '2rem' }}>📈</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                    Average
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    ${averageExpense}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Per expense
                  </div>
                </div>
              </div>

              {/* Today Card */}
              <div style={{
                flex: 1,
                background: '#7c3aed',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '2rem' }}>⏰</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                    Today
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    {todaysExpenses}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    New expenses
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 - Quick Action (Full Width) */}
            <div style={{
              background: '#dc2626',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              cursor: 'pointer',
              height: '140px'
            }}
            onClick={() => setShowAddExpense(true)}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '2rem' }}>⚡</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)', opacity: 0.9 }}>
                  Quick Action
                </div>
                <button 
                  className="btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontSize: '1.125rem',
                    padding: 'var(--space-4) var(--space-8)',
                    fontWeight: '600',
                    borderRadius: '50px',
                    transition: 'all 0.2s'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddExpense(true);
                  }}
                >
                  + Add New Expense
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Expenses Section */}
        <div style={{ 
          flex: '0 0 35%',
          minWidth: '300px',
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Expenses Header */}
          <div style={{
            padding: 'var(--space-6)',
            background: '#1e293b',
            color: 'white',
            borderTopLeftRadius: 'var(--radius-xl)',
            borderTopRightRadius: 'var(--radius-xl)'
          }}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-1)' }}>
                  Expense History
                </h2>
                <p className="text-sm" style={{ opacity: '0.8', color: '#cbd5e1' }}>
                  {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'} for this group
                </p>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {expenseCount} {expenseCount === 1 ? 'Expense' : 'Expenses'} • ${totalAmount}
              </div>
            </div>
          </div>

          {/* Expenses Content */}
          <div style={{ 
            flex: 1,
            padding: 'var(--space-4)',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}>
            {expensesLoading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div className="loading-spinner" style={{ margin: '0 auto var(--space-4) auto' }}></div>
                <p style={{ color: '#64748b' }}>Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div style={{ 
                textAlign: 'center',
                padding: 'var(--space-12)',
                color: '#64748b'
              }}>
                <div style={{
                  background: '#3b82f6',
                  borderRadius: '50%',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4) auto',
                  color: 'white'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>💰</span>
                </div>
                <h3 className="text-lg font-medium" style={{ marginBottom: 'var(--space-2)', color: '#374151' }}>
                  No expenses yet
                </h3>
                <p style={{ marginBottom: 'var(--space-6)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Start tracking expenses for this group to see your spending history.
                </p>
                <button 
                  onClick={() => setShowAddExpense(true)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: 'var(--space-3) var(--space-6)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  + Add First Expense
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {expenses.map((expense, index) => (
                  <div 
                    key={expense.id} 
                    className="fade-in" 
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e2e8f0',
                      minHeight: '100px'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                          <div style={{
                            background: '#3b82f6',
                            borderRadius: 'var(--radius-md)',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            <span style={{ fontSize: '1rem', fontWeight: '600' }}>$</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1e293b', marginBottom: '2px', fontSize: '1rem' }}>
                              {expense.description}
                            </h4>
                            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              {new Date(expense.created_at).toLocaleDateString()} at {new Date(expense.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Expense #{expense.id}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" style={{ alignSelf: 'flex-start' }}>
                        <span style={{ 
                          color: '#059669',
                          fontSize: '1rem',
                          fontWeight: '700'
                        }}>
                          ${parseFloat(expense.amount).toFixed(2)}
                        </span>
                        <button
                          onClick={() => deleteExpense(expense.id, expense.description)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          title="Delete expense"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddExpense(false)
            }
          }}
        >
          <div 
            className="card fade-in"
            style={{ 
              width: '100%',
              maxWidth: '500px',
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: '#1e293b' }}>
                    Add New Expense
                  </h3>
                  <p className="text-sm" style={{ color: '#64748b', marginTop: 'var(--space-1)' }}>
                    Track a new expense for {group.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddExpense(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="card-body">
              {expenseError && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ marginRight: 'var(--space-2)' }}>×</span>
                  {expenseError}
                </div>
              )}

              <form onSubmit={addExpense}>
                <div className="form-group">
                  <label className="form-label">
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Lunch at Italian restaurant, Gas for trip, Movie tickets"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    required
                    className="form-input"
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="btn btn-secondary"
                    disabled={expensesLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={expensesLoading}
                    className="btn btn-success"
                  >
                    {expensesLoading ? (
                      <>
                        <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <span>+</span>
                        Add Expense
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupDetailPage 