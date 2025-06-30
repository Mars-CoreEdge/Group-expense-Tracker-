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
      // Set empty groups array on error so UI still works
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
      // For now, just remove from local state since we don't have delete API yet
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 5px 0',
            color: '#333',
            fontSize: '24px'
          }}>
            Your Groups
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '14px'
          }}>
            Welcome back, <strong>{user?.email}</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            style={{ 
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showCreateGroup ? 'Cancel' : '+ Create Group'}
          </button>
          <button 
            onClick={handleSignOut}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Messages */}
      {groupMessage && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {groupMessage}
        </div>
      )}

      {/* Create Group Form */}
      {showCreateGroup && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Create New Group</h3>
          
          {groupError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              {groupError}
            </div>
          )}

          <form onSubmit={createGroup}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: '500'
              }}>
                Group Name *
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: '500'
              }}>
                Description (Optional)
              </label>
              <textarea
                placeholder="Enter group description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                disabled={false}
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
                Create Group
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateGroup(false)}
                style={{ 
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups Grid */}
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {groupsLoading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading your groups...</p>
        ) : groups.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <p>No groups yet. Create your first group to get started!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {groups.map((group) => (
              <div key={group.id} style={{
                background: '#fff',
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => viewGroup(group.id)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ 
                    margin: 0,
                    color: '#333',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {group.name}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteGroup(group.id, group.name)
                    }}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Delete group"
                  >
                    ×
                  </button>
                </div>
                
                {group.description && (
                  <p style={{ 
                    margin: '0 0 10px 0',
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {group.description}
                  </p>
                )}
                
                <div style={{ 
                  fontSize: '12px',
                  color: '#999',
                  borderTop: '1px solid #eee',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
                  <span style={{ 
                    background: '#007bff',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px'
                  }}>
                    Click to view
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage 