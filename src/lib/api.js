import { supabase } from './supabase'

const API_BASE_URL = 'http://localhost:8000'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Get the authorization header with Supabase session token
  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = await this.getAuthHeaders()

    const config = {
      headers,
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Group API methods
  async createGroup(groupData) {
    return this.request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    })
  }

  async getGroups() {
    return this.request('/api/groups', {
      method: 'GET'
    })
  }

  // Expense API methods
  async getExpensesForGroup(groupId) {
    return this.request(`/api/expenses/${groupId}`, {
      method: 'GET'
    })
  }

  async addExpenseToGroup(groupId, expenseData) {
    return this.request(`/api/expenses/${groupId}`, {
      method: 'POST',
      body: JSON.stringify(expenseData)
    })
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return await response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
export default apiService 