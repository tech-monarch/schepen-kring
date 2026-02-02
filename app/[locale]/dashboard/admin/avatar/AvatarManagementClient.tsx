"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Search,
  Filter,
  Grid3x3,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type PlanType = "small" | "medium" | "big";

const planBadgeColors = {
  free: "bg-slate-100 text-slate-700 border-slate-200",
  small: "bg-sky-100 text-sky-700 border-sky-200",
  medium: "bg-indigo-100 text-indigo-700 border-indigo-200",
  big: "bg-violet-100 text-violet-700 border-violet-200",
};

const planLabels = {
  free: "Free",
  small: "Starter",
  medium: "Pro",
  big: "Enterprise",
};

export default function AdminAvatarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [avatars, setAvatars] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarToDelete, setAvatarToDelete] = useState<string | null>(null);

  const API_BASE = "https://kring.answer24.nl/api/v1";

  useEffect(() => {
    loadAvatars();
  }, []);

  const getToken = (): string => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token") || "";
    }
    return "";
  };

  const loadAvatars = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/avatars`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to load avatars");
      const data = await response.json();
      setAvatars(data?.data || data);
    } catch (error) {
      console.error("Failed to load avatars:", error);
      toast.error("Failed to load avatars");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!avatarToDelete) return;
    const token = getToken();
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/avatars/${avatarToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setAvatars(avatars.filter((a) => a.id !== avatarToDelete));
        toast.success("Avatar deleted successfully");
      } else {
        toast.error("Failed to delete avatar");
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error("Failed to delete avatar");
    } finally {
      setIsDeleting(false);
      setAvatarToDelete(null);
    }
  };

  const filteredAvatars = avatars.filter((avatar) => {
    const matchesSearch =
      searchTerm === "" ||
      avatar.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avatar.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (avatar.description &&
        avatar.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan =
      filterPlan === "all" || avatar.required_plan === filterPlan;

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Avatar Management
              </h1>
              <p className="text-slate-600 mt-2">
                Create and manage your AI avatars with ease
              </p>
            </div>
            <Link href="/dashboard/admin/avatar/create">
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Plus className="h-5 w-5 mr-2" />
                Create Avatar
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search avatars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none min-w-[140px]"
                >
                  <option value="all">All Plans</option>
                  <option value="small">Starter</option>
                  <option value="medium">Pro</option>
                  <option value="big">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAvatars.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <div className="mx-auto h-24 w-24 text-slate-300 mb-6">
              <User className="h-full w-full" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No avatars found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterPlan !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first avatar"}
            </p>
            {!searchTerm && filterPlan === "all" && (
              <Link href="/dashboard/admin/avatar/create">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Avatar
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`group bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 ${
                  viewMode === "list" ? "flex items-center p-6" : "p-6"
                }`}
              >
                <div
                  className={`flex ${viewMode === "list" ? "items-center space-x-6 flex-1" : "flex-col"}`}
                >
                  <div
                    className={`relative ${viewMode === "list" ? "flex-shrink-0" : "mb-4 self-center"}`}
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ring-4 ring-white shadow-lg">
                      {avatar.image ? (
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-2 -right-2 px-3 py-1 text-xs font-semibold rounded-full border-2 border-white shadow-sm ${planBadgeColors[avatar.required_plan as PlanType]}`}
                    >
                      {planLabels[avatar.required_plan as PlanType]}
                    </div>
                  </div>

                  <div
                    className={`flex-1 ${viewMode === "list" ? "min-w-0" : ""}`}
                  >
                    <div
                      className={`${viewMode === "list" ? "flex items-start justify-between" : ""}`}
                    >
                      <div
                        className={`${viewMode === "list" ? "flex-1 min-w-0 pr-4" : "text-center mb-4"}`}
                      >
                        <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">
                          {avatar.name}
                        </h3>
                        <p className="text-indigo-600 font-medium text-sm mb-2 truncate">
                          {avatar.role}
                        </p>
                        <p
                          className={`text-slate-600 text-sm leading-relaxed ${
                            viewMode === "grid"
                              ? "line-clamp-2"
                              : "line-clamp-1"
                          }`}
                        >
                          {avatar.description}
                        </p>
                      </div>

                      <div
                        className={`${
                          viewMode === "list"
                            ? "flex items-center space-x-2"
                            : "flex justify-center space-x-2 mt-4"
                        }`}
                      >
                        <Link
                          href={`/dashboard/admin/avatar/update/${avatar.id}`}
                        >
                          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group">
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={() => setAvatarToDelete(avatar.id)}
                              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the avatar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {avatar.functions && avatar.functions.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-2 ${viewMode === "list" ? "mt-3" : "mt-4"}`}
                      >
                        {avatar.functions
                          .slice(0, viewMode === "list" ? 4 : 3)
                          .map((func: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {func}
                            </span>
                          ))}
                        {avatar.functions.length >
                          (viewMode === "list" ? 4 : 3) && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            +
                            {avatar.functions.length -
                              (viewMode === "list" ? 4 : 3)}{" "}
                            more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
