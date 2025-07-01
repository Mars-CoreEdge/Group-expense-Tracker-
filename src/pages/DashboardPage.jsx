import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../lib/api'

const DashboardPage = ({ user }) => {
  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupError, setGroupError] = useState('')
  const [groupMessage, setGroupMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchGroups()
    }
  }, [user])

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true)
      const response = await apiService.getGroups()
      setGroups(response.groups || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
      setGroupError('Error loading groups: ' + (error?.message || error?.toString() || 'Unknown error'))
      setGroups([])
    } finally {
      setGroupsLoading(false)
    }
  }

  const createGroup = async (e) => {
    e.preventDefault()
    setGroupError('')
    setGroupMessage('')

    if (!groupName.trim()) {
      setGroupError('Group name is required')
      return
    }

    try {
      setGroupsLoading(true)
      const newGroup = await apiService.createGroup({
        name: groupName.trim(),
        description: groupDescription.trim() || null
      })
      
      setGroups(prevGroups => [newGroup, ...prevGroups])
      setGroupName('')
      setGroupDescription('')
      setShowCreateGroup(false)
      setGroupMessage(`Group "${newGroup.name}" created successfully!`)
      setTimeout(() => setGroupMessage(''), 3000)
      
    } catch (error) {
      console.error('Error creating group:', error)
      setGroupError('Error creating group: ' + (error?.message || error?.toString() || 'Unknown error'))
    } finally {
      setGroupsLoading(false)
    }
  }

  const deleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      return
    }

    try {
      // Call API to delete from database
      await apiService.deleteGroup(groupId)
      
      // Update local state only after successful deletion
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId))
      setGroupMessage(`Group "${groupName}" deleted successfully!`)
      setTimeout(() => setGroupMessage(''), 3000)
      
    } catch (error) {
      console.error('Error deleting group:', error)
      setGroupError('Error deleting group: ' + (error?.message || error?.toString() || 'Unknown error'))
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const viewGroup = (groupId) => {
    navigate(`/groups/${groupId}`)
  }

  // Calculate statistics
  const totalGroups = groups.length
  const recentGroups = groups.filter(group => {
    const created = new Date(group.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return created > weekAgo
  }).length

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
            <h1 className="text-3xl font-bold" style={{ color: '#1e293b', marginBottom: 'var(--space-1)' }}>
              Welcome back
            </h1>
            <p style={{ color: '#64748b' }}>{user?.email}</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="btn btn-primary"
            >
              <span>+</span>
              Create Group
            </button>
            <button 
              onClick={handleSignOut} 
              className="btn btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Messages */}
        {groupMessage && (
          <div className="alert alert-success fade-in" style={{ marginTop: 'var(--space-4)' }}>
            <span style={{ marginRight: 'var(--space-2)' }}>✓</span>
            {groupMessage}
          </div>
        )}

        {groupError && (
          <div className="alert alert-error fade-in" style={{ marginTop: 'var(--space-4)' }}>
            <span style={{ marginRight: 'var(--space-2)' }}>×</span>
            {groupError}
          </div>
        )}
      </div>

      {/* Main Dashboard Content */}
      <div style={{ 
        display: 'flex',
        height: 'calc(100vh - 140px)',
        width: '100%',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)'
      }}>
        {/* Left Side - Dashboard Overview */}
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
              Dashboard Overview
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Monitor your expense groups and track your financial activities
            </p>
          </div>

          {/* Statistics Cards - Vertical Layout */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            flex: 1
          }}>
            {/* Row 1 - Total Groups and Recent Groups */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', height: '200px' }}>
              {/* Total Groups Card */}
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
                  <span style={{ fontSize: '2rem' }}>📊</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                    Total Groups
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    {totalGroups}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Active expense groups
                  </div>
                </div>
              </div>

              {/* Recent Groups Card */}
              <div style={{
                flex: 1,
                background: '#0f766e',
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
                    Recent Groups
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    {recentGroups}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Created this week
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 - Total Amount and This Month */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', height: '200px' }}>
              {/* Total Amount Card */}
              <div style={{
                flex: 1,
                background: '#dc2626',
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
                    Total Amount
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    ${groups.reduce((total, group) => total + parseFloat(group.total_amount || 0), 0).toFixed(0)}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Across all groups
                  </div>
                </div>
              </div>

              {/* This Month Card */}
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
                  <span style={{ fontSize: '2rem' }}>📊</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                    This Month
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1', marginBottom: 'var(--space-2)' }}>
                    {totalGroups}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                    Active groups
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 - Quick Action (Full Width) */}
            <div style={{
              background: '#f59e0b',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              cursor: 'pointer',
              height: '140px'
            }}
            onClick={() => setShowCreateGroup(true)}
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
                    setShowCreateGroup(true);
                  }}
                >
                  + Create New Group
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Groups Section */}
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
          {/* Groups Header */}
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
                  Your Groups
                </h2>
                <p className="text-sm" style={{ opacity: '0.8', color: '#cbd5e1' }}>
                  Manage and track expenses across all your groups
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
                {groups.length} Groups
              </div>
            </div>
          </div>

          {/* Groups Content */}
          <div style={{ 
            flex: 1,
            padding: 'var(--space-4)',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}>
            {groupsLoading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div className="loading-spinner" style={{ margin: '0 auto var(--space-4) auto' }}></div>
                <p style={{ color: '#64748b' }}>Loading groups...</p>
              </div>
            ) : groups.length === 0 ? (
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
                  <span style={{ fontSize: '1.5rem' }}>📂</span>
                </div>
                <h3 className="text-lg font-medium" style={{ marginBottom: 'var(--space-2)', color: '#374151' }}>
                  No groups yet
                </h3>
                <p style={{ marginBottom: 'var(--space-6)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Create your first expense group to start tracking shared costs.
                </p>
                <button 
                  onClick={() => setShowCreateGroup(true)}
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
                  + Create First Group
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {groups.map((group, index) => (
                  <div 
                    key={group.id} 
                    className="fade-in" 
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e2e8f0',
                      minHeight: '100px'
                    }}
                    onClick={() => viewGroup(group.id)}
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
                            <span style={{ fontSize: '1rem', fontWeight: '600' }}>📊</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1e293b', marginBottom: '2px', fontSize: '1rem' }}>
                              {group.name}
                            </h4>
                            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              Created {new Date(group.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {group.description && (
                          <p style={{ 
                            color: '#64748b', 
                            marginBottom: 'var(--space-2)',
                            fontSize: '0.75rem',
                            lineHeight: '1.3'
                          }}>
                            {group.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          <span>{group.expense_count || 0} expenses</span>
                          <span>→ View details</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" style={{ alignSelf: 'flex-start' }}>
                        <span style={{ 
                          color: '#059669',
                          fontSize: '1rem',
                          fontWeight: '700'
                        }}>
                          ${group.total_amount ? parseFloat(group.total_amount).toFixed(2) : '0.00'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGroup(group.id, group.name);
                          }}
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
                          title="Delete group"
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

      {/* Create Group Modal */}
      {showCreateGroup && (
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
              setShowCreateGroup(false)
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
                    Create New Group
                  </h3>
                  <p className="text-sm" style={{ color: '#64748b', marginTop: 'var(--space-1)' }}>
                    Start tracking expenses with your team or family
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateGroup(false)}
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
              {groupError && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ marginRight: 'var(--space-2)' }}>×</span>
                  {groupError}
                </div>
              )}

              <form onSubmit={createGroup}>
                <div className="form-group">
                  <label className="form-label">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Weekend Trip, Office Lunch, Roommate Expenses"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add a description to help others understand this group's purpose..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="btn btn-secondary"
                    disabled={groupsLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={groupsLoading}
                    className="btn btn-success"
                  >
                    {groupsLoading ? (
                      <>
                        <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span>+</span>
                        Create Group
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

export default DashboardPage 