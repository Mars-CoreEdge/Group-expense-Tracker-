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
      // For now, we'll just set a mock group since we don't have a get single group API
      setGroup({ 
        id: groupId, 
        name: `Group ${groupId}`, 
        description: 'Sample group' 
      })
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
      // For now, just remove from local state since we don't have delete API yet
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  if (!group) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Group not found</h2>
        <button onClick={() => navigate('/dashboard')} style={{ 
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '10px',
            textDecoration: 'underline'
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '24px' }}>
              {group.name}
            </h1>
            {group.description && (
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {group.description}
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              background: '#e8f5e8',
              color: '#2d5a2d',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Total: ${calculateTotal()}
            </div>
            <button 
              onClick={() => setShowAddExpense(!showAddExpense)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {showAddExpense ? 'Cancel' : '+ Add Expense'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {expenseMessage && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {expenseMessage}
        </div>
      )}

      {/* Add Expense Form */}
      {showAddExpense && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Add New Expense</h3>
          
          {expenseError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              {expenseError}
            </div>
          )}

          <form onSubmit={addExpense}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '2', minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="Enter expense description"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  required
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
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
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
                <button 
                  type="submit" 
                  disabled={expensesLoading}
                  style={{ 
                    background: expensesLoading ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: expensesLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {expensesLoading ? 'Adding...' : 'Add'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  style={{ 
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          Expenses ({expenses.length})
        </h2>

        {expensesLoading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No expenses yet. Add your first expense to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expenses.map((expense) => (
              <div key={expense.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                    {expense.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(expense.created_at).toLocaleDateString()} at {new Date(expense.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#28a745' }}>
                    ${parseFloat(expense.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteExpense(expense.id, expense.description)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Delete expense"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupDetailPage 