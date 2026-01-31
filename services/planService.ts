import { apiRequest } from "@/utils/auth";

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: string;
  formatted_price: string;
  duration_days: number;
  features: any[];
  color: string;
  created_at: string;
  updated_at: string;
}

export interface PlanResponse {
  data: Plan;
}

export interface PlansResponse {
  data: Plan[];
}

export interface CreatePlanData {
  name: string;
  display_name: string;
  description: string;
  price: string;
  duration_days: number;
  features: any[];
  color: string;
}

export const planService = {
  // Get all plans
  getPlans: async (): Promise<PlansResponse> => {
    try {
      return await apiRequest("/plans");
    } catch (error: any) {
      console.error("Plan service - getPlans error:", error);
      throw new Error(error?.message || "Failed to fetch plans");
    }
  },

  // Get single plan
  getPlan: async (id: string): Promise<PlanResponse> => {
    try {
      return await apiRequest(`/plans/${id}`);
    } catch (error: any) {
      console.error("Plan service - getPlan error:", error);
      throw new Error(error?.message || "Failed to fetch plan");
    }
  },

  // Create new plan (admin only)
  createPlan: async (data: CreatePlanData): Promise<PlanResponse> => {
    try {
      return await apiRequest("/plans", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Plan service - createPlan error:", error);
      throw new Error(error?.message || "Failed to create plan");
    }
  },

  // Update plan (admin only)
  updatePlan: async (
    id: string,
    data: Partial<CreatePlanData>
  ): Promise<PlanResponse> => {
    try {
      return await apiRequest(`/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Plan service - updatePlan error:", error);
      throw new Error(error?.message || "Failed to update plan");
    }
  },

  // Delete plan (admin only)
  deletePlan: async (id: string): Promise<void> => {
    try {
      return await apiRequest(`/plans/${id}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      console.error("Plan service - deletePlan error:", error);
      throw new Error(error?.message || "Failed to delete plan");
    }
  },
};

export const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      return await apiRequest("/profile");
    } catch (error: any) {
      console.error("Profile service - getProfile error:", error);
      throw new Error(error?.message || "Failed to fetch profile");
    }
  },

  // Update user profile
  updateProfile: async (data: any) => {
    try {
      return await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Profile service - updateProfile error:", error);
      throw new Error(error?.message || "Failed to update profile");
    }
  },
};
