import { SubscriptionPlan } from "@/types/avatar"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define the hierarchy of subscription plans
const planHierarchy: Record<SubscriptionPlan, number> = {
  small: 1,
  medium: 2,
  big: 3,
}

export function isAvatarLocked(userPlan: SubscriptionPlan, avatarRequiredPlan: SubscriptionPlan): boolean {
  return planHierarchy[userPlan] < planHierarchy[avatarRequiredPlan]
}
