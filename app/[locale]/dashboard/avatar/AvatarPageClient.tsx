"use client"

import { useEffect, useState } from "react"
import { AvatarCard } from "@/components/client/avatar/AvatarCard"
import { getAvatars } from "@/app/[locale]/actions/avatar"
import type { Avatar, SubscriptionPlan } from "@/types/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"


type Category = {
  id: string
  name: string
  color: string
  bgColor: string
  borderColor: string
  hoverBgColor: string
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'All Experts',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    hoverBgColor: 'hover:bg-gray-200'
  },
  {
    id: 'small',
    name: 'Small Plan',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    hoverBgColor: 'hover:bg-blue-200'
  },
  {
    id: 'medium',
    name: 'Medium Plan',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    hoverBgColor: 'hover:bg-purple-200'
  },
  {
    id: 'big',
    name: 'Big Plan',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    hoverBgColor: 'hover:bg-green-200'
  }
]

export default function AvatarsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [userSubscription, setUserSubscription] = useState<SubscriptionPlan>("small")
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setIsLoading(true)
        const data = await getAvatars()
        setAvatars(data)
      } catch (error) {
        console.error('Failed to fetch avatars:', error)
        alert("Failed to load avatars. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvatars()
  }, [])

  // Filter avatars based on selected category and user subscription
  const filteredAvatars = selectedCategory === 'all' 
    ? avatars.filter(avatar => {
        // Only show avatars that the user's subscription can access
        if (userSubscription === 'small') return true
        if (userSubscription === 'medium') return ['small', 'medium'].includes(avatar.required_plan)
        return true // big plan can see all
      })
    : avatars.filter(avatar => avatar.required_plan === selectedCategory)

  return (
    <div className="container mx-auto py-20">
      <h1 className="text-3xl font-bold text-center mb-8">Team AI Experts</h1>

      {/* Subscription Plan Selector */}
      <div className="flex flex-col items-center mb-8 space-y-4">
        {/* <div className="flex items-center space-x-2">
          <label htmlFor="subscription-select" className="text-lg font-medium">
            Your Plan:
          </label>
          <Select 
            value={userSubscription} 
            onValueChange={(value: SubscriptionPlan) => setUserSubscription(value)}
          >
            <SelectTrigger id="subscription-select" className="w-[180px]">
              <SelectValue placeholder="Select your plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small Plan</SelectItem>
              <SelectItem value="medium">Medium Plan</SelectItem>
              <SelectItem value="big">Big Plan</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-colors
                ${category.color}
                ${category.bgColor}
                border ${category.borderColor}
                ${category.hoverBgColor}
                ${selectedCategory === category.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
              `}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Avatars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
          ))
        ) : (
          filteredAvatars.map((avatar) => (
            <AvatarCard 
              key={avatar.id} 
              avatar={avatar} 
              userPlan={userSubscription} 
              className={selectedCategory === 'all' ? `border-2 border-${avatar.required_plan}-300` : ''}
            />
          ))
        )}
      </div>

      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No experts found in this category.</p>
          <p className="text-sm text-gray-400 mt-2">Upgrade your plan to access more experts.</p>
        </div>
      )}
    </div>
  )
}
