"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Avatar, SubscriptionPlan } from "@/types/avatar"
import { isAvatarLocked, cn } from "@/lib/utils"
import { AvatarModal } from "./AvatarModal"
import { Badge } from "@/components/ui/badge"
import DemoImg from "@/public/image.png"

interface AvatarCardProps {
  avatar: Avatar
  userPlan: SubscriptionPlan
  className?: string
}

export function AvatarCard({ avatar, userPlan, className }: AvatarCardProps) {
  const locked = isAvatarLocked(userPlan, avatar.required_plan)

  const planBadgeColor = {
    small: "bg-blue-100 text-blue-800",
    medium: "bg-purple-100 text-purple-800",
    big: "bg-green-100 text-green-800",
  }

  return (
    <AvatarModal avatar={avatar} userPlan={userPlan}>
      <Card
        className={cn(
          "flex flex-col items-center p-0 text-cente cursor-pointer transition-all duration-200 hover:shadow-lg rounded-xl overflow-hidden",
          className,
          locked && "grayscale opacity-50 hover:opacity-75",
        )}
      >
        <div className="w-full h-48 overflow-hidden p-2">
          <img
            src={avatar.image || DemoImg.src}
            alt={avatar.name}
            width={200}
            height={160}
            className="object-cove w-full h-full rounded-xl"
          />
        </div>
        <CardContent className="pb-6 flex flex-col items-cente w-full">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">{avatar.role}</p>
          <h3 className="font-bold text-xl mb-2">{avatar.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{avatar?.description}</p>
          <Badge
            className={cn("px-3 py-1 rounded-full text-xs font-medium", planBadgeColor[avatar.required_plan])}
          >
            {avatar.required_plan.charAt(0).toUpperCase() + avatar.required_plan.slice(1)} Plan
          </Badge>
        </CardContent>
      </Card>
    </AvatarModal>
  )
}
