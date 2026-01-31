"use client"

import type React from "react"

import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Avatar, SubscriptionPlan } from "@/types/avatar"
import { isAvatarLocked } from "@/lib/utils"
import { Star, Lock, CheckCircle, Calendar, Share2, Users, Settings, FileText, ShieldCheck } from "lucide-react"

interface AvatarModalProps {
  avatar: Avatar
  userPlan: SubscriptionPlan
  children: React.ReactNode
}

const functionIcons: Record<string, React.ElementType> = {
  "Keyword Research": Star,
  "Content Optimization": CheckCircle,
  "Backlink Analysis": Share2,
  "Technical SEO Audits": Settings,
  "PPC Strategy": Star,
  "Ad Copywriting": FileText,
  "Audience Targeting": Users,
  "Performance Tracking": CheckCircle,
  "User Research": Users,
  Wireframing: Settings,
  Prototyping: Share2,
  "Usability Testing": CheckCircle,
  "Sales Copy": FileText,
  "Blog Posts": FileText,
  "Website Content": FileText,
  "Email Campaigns": FileText,
  "Market Research": Star,
  "Trend Analysis": CheckCircle,
  Reporting: FileText,
  "Predictive Modeling": Settings,
  "Content Calendar": Calendar,
  "Engagement Tactics": Users,
  "Platform Management": Settings,
  "Influencer Outreach": Share2,
  "Frontend Development": Settings,
  "Backend Integration": Settings,
  "API Development": Settings,
  "Content Planning": Calendar,
  "Editorial Calendar": Calendar,
  "Audience Segmentation": Users,
  "Distribution Channels": Share2,
  "Media Relations": Share2,
  "Crisis Management": ShieldCheck,
  "Press Release Writing": FileText,
  "Brand Reputation": Star,
  "Compliance Checks": ShieldCheck,
  "Contract Review": FileText,
  "Intellectual Property": ShieldCheck,
  "Privacy Policies": FileText,
}

export function AvatarModal({ avatar, userPlan, children }: AvatarModalProps) {
  const locked = isAvatarLocked(userPlan, avatar.required_plan)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-xl">
        <div className="relative bg-purple-600 text-white p-4 flex justify-between items-center">
          <Badge className="bg-yellow-400 text-purple-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" /> PRO FEATURE
          </Badge>
          {/* Close button is handled by Dialog component itself */}
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center -mt-6 mb-4">
            <img
              src={avatar.image || "/placeholder.svg"}
              alt={avatar.name}
              width={200}
            height={160}
              className="rounded-full object-cover border-4 border-white shadow-lg bg-purple-100"
            />
          </div>
          <DialogTitle className="text-2xl font-bold mt-4">{avatar.name}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-lg">{avatar.role}</DialogDescription>

          <div className="mt-8 text-left">
            <h3 className="font-semibold text-xl mb-4">Functions:</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-base text-gray-800 dark:text-gray-200">
              {avatar.functions.map((func, index) => {
                const Icon = functionIcons[func] || CheckCircle // Default icon
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-purple-500" />
                    <span>{func}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {locked && (
            <div className="mt-8 text-center">
              <Badge className="bg-yellow-500 text-yellow-950 font-semibold px-4 py-2 rounded-md mb-4">PREMIUM</Badge>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
                This avatar requires the <span className="font-bold">{avatar.required_plan} Plan</span>
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 rounded-lg flex items-center justify-center gap-2"
                onClick={() => alert("Redirecting to upgrade flow...")}
              >
                <Lock className="w-5 h-5" />
                Unlock {avatar.name} for {avatar.required_plan} Plan →
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
