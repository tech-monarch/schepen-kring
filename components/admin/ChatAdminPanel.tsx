"use client"

import React, { useState, useEffect } from "react"
import { Settings, Bot, Users, MessageSquare, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  aiEnabled: boolean
  lastActive: string
  totalMessages: number
}

interface ChatAnalytics {
  totalChats: number
  totalMessages: number
  aiResponses: number
  activeUsers: number
  avgResponseTime: number
}

export function ChatAdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
    loadAnalytics()
  }, [])

  const loadUsers = async () => {
    try {
      // This would call your Laravel API
      // const response = await fetch('/api/admin/users')
      // const data = await response.json()
      
      // Mock data for now
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "client",
          aiEnabled: true,
          lastActive: "2024-01-15T10:30:00Z",
          totalMessages: 45
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "partner",
          aiEnabled: false,
          lastActive: "2024-01-14T15:20:00Z",
          totalMessages: 23
        },
        {
          id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          role: "client",
          aiEnabled: true,
          lastActive: "2024-01-15T09:15:00Z",
          totalMessages: 67
        }
      ]
      
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      // This would call your Laravel API
      // const response = await fetch('/api/admin/chat-analytics')
      // const data = await response.json()
      
      // Mock data for now
      const mockAnalytics: ChatAnalytics = {
        totalChats: 156,
        totalMessages: 2847,
        aiResponses: 1243,
        activeUsers: 89,
        avgResponseTime: 2.3
      }
      
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("Error loading analytics:", error)
    }
  }

  const toggleUserAI = async (userId: string, enabled: boolean) => {
    try {
      // This would call your Laravel API
      // await fetch(`/api/admin/users/${userId}/ai-toggle`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ai_enabled: enabled })
      // })

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, aiEnabled: enabled } : user
      ))
    } catch (error) {
      console.error("Error toggling AI:", error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Management</h1>
          <p className="text-gray-600">Manage ChatGPT settings and monitor chat activity</p>
        </div>
        <Button onClick={loadAnalytics}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh Analytics
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalChats}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMessages}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">AI Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.aiResponses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgResponseTime}s</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User AI Settings
          </CardTitle>
          <CardDescription>
            Enable or disable ChatGPT for individual users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {user.totalMessages} messages
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Last active: {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                    <div className={cn(
                      "text-xs font-medium",
                      user.aiEnabled ? "text-green-600" : "text-gray-500"
                    )}>
                      {user.aiEnabled ? "AI Enabled" : "AI Disabled"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bot className={cn(
                      "w-4 h-4",
                      user.aiEnabled ? "text-green-600" : "text-gray-400"
                    )} />
                    <Switch
                      checked={user.aiEnabled}
                      onCheckedChange={(enabled) => toggleUserAI(user.id, enabled)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
