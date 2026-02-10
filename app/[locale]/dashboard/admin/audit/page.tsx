"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  ShieldCheck,
  Filter,
  Download,
  Search,
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  Server,
  ChevronRight,
  Users,
  Calendar,
  FileText,
  Ship,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import axios from "axios";

// Types
interface SystemLog {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: number | null;
  user_id: number | null;
  old_data: any;
  new_data: any;
  changes: any;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface SystemStats {
  summary: {
    total_logs: number;
    event_types: Array<{ event_type: string; count: number }>;
    entity_types: Array<{ entity_type: string; count: number }>;
  };
  recent_activity: SystemLog[];
  daily_activity: Array<{ date: string; count: number }>;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SystemAuditPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 1,
  });

  const [filters, setFilters] = useState({
    event_type: [] as string[],
    entity_type: [] as string[],
    dateRange: {
      from: "",
      to: "",
    },
    search: "",
    page: 1,
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return token || null;
    }
    return null;
  };

  // Create axios instance with auth headers
  const createApiInstance = useCallback(() => {
    const token = getAuthToken();
    const instance = axios.create({
      baseURL: '/api',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor to handle auth errors
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          setApiError("Unauthorized access. Please check your authentication token.");
          console.error("Authentication error:", error);
          
          // Optional: Redirect to login or show login modal
          // window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // ============================================
  // API CALLS
  // ============================================

  const fetchSystemStats = useCallback(async () => {
    try {
      const api = createApiInstance();
      const response = await api.get("/system-logs/summary");
      setSystemStats(response.data);
    } catch (error: any) {
      console.error("Error fetching system stats:", error);
      setApiError(error.response?.data?.message || "Failed to load system statistics");
    }
  }, [createApiInstance]);

  const fetchSystemLogs = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const api = createApiInstance();
      const params = new URLSearchParams();
      
      // Add filters
      if (filters.event_type.length > 0) {
        filters.event_type.forEach(type => params.append('event_type[]', type));
      }
      
      if (filters.entity_type.length > 0) {
        filters.entity_type.forEach(type => params.append('entity_type[]', type));
      }
      
      if (filters.dateRange.from) {
        params.append('start_date', filters.dateRange.from);
      }
      
      if (filters.dateRange.to) {
        params.append('end_date', filters.dateRange.to);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      params.append('page', filters.page.toString());
      
      const response = await api.get(`/system-logs?${params}`);
      setSystemLogs(response.data.data);
      setFilteredLogs(response.data.data);
      setPagination(response.data.meta);
      setApiError(null);
    } catch (error: any) {
      console.error("Error fetching system logs:", error);
      setApiError(error.response?.data?.message || "Failed to load system logs");
      setSystemLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, createApiInstance]);

  // ============================================
  // FILTERS AND UTILITIES
  // ============================================

  const getSeverityInfo = (eventType: string) => {
    const eventTypeLower = eventType.toLowerCase();
    
    if (eventTypeLower.includes('error') || eventTypeLower.includes('failed') || eventTypeLower.includes('alert')) {
      return { 
        icon: XCircle, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        border: 'border-rose-200',
        label: 'Error',
        dotColor: 'bg-rose-400'
      };
    }
    
    if (eventTypeLower.includes('warning') || eventTypeLower.includes('deleted') || eventTypeLower.includes('suspended')) {
      return { 
        icon: AlertCircle, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200',
        label: 'Warning',
        dotColor: 'bg-amber-400'
      };
    }
    
    if (eventTypeLower.includes('success') || eventTypeLower.includes('completed') || eventTypeLower.includes('accepted') || eventTypeLower.includes('created')) {
      return { 
        icon: CheckCircle, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200',
        label: 'Success',
        dotColor: 'bg-emerald-400'
      };
    }
    
    // Default info
    return { 
      icon: Activity, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200',
      label: 'Info',
      dotColor: 'bg-blue-400'
    };
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getEntityName = (log: SystemLog) => {
    if (log.entity_type && log.entity_id) {
      return `${log.entity_type} #${log.entity_id}`;
    }
    return log.entity_type || 'Unknown Entity';
  };

  const eventTypes = useMemo(() => {
    if (!systemStats?.summary.event_types) return [];
    return systemStats.summary.event_types.map(item => item.event_type);
  }, [systemStats]);

  const entityTypes = useMemo(() => {
    if (!systemStats?.summary.entity_types) return [];
    return systemStats.summary.entity_types.map(item => item.entity_type);
  }, [systemStats]);

  // ============================================
  // ACTIONS
  // ============================================

  const exportLogs = async () => {
    try {
      const api = createApiInstance();
      const params = new URLSearchParams();
      if (filters.dateRange.from) params.append('start_date', filters.dateRange.from);
      if (filters.dateRange.to) params.append('end_date', filters.dateRange.to);
      
      const response = await api.get(`/system-logs/export?${params}`);
      
      // Create and download CSV file
      const blob = new Blob([response.data.csv_data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting logs:', error);
      setApiError('Failed to export logs');
    }
  };

  const clearFilters = () => {
    setFilters({
      event_type: [],
      entity_type: [],
      dateRange: { from: '', to: '' },
      search: '',
      page: 1,
    });
  };

  const toggleFilter = (type: 'event_type' | 'entity_type', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated, page: 1 };
    });
  };

  const changePage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    const init = async () => {
      await fetchSystemStats();
      await fetchSystemLogs();
    };
    init();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchSystemLogs();
    }
  }, [filters.page]);

  // Apply search and filters immediately
  useEffect(() => {
    if (!loading && systemLogs.length > 0) {
      let filtered = systemLogs;

      // Event type filter
      if (filters.event_type.length > 0) {
        filtered = filtered.filter(log => filters.event_type.includes(log.event_type));
      }

      // Entity type filter
      if (filters.entity_type.length > 0) {
        filtered = filtered.filter(log => filters.entity_type.includes(log.entity_type));
      }

      // Date range filter
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from);
        filtered = filtered.filter(log => new Date(log.created_at) >= fromDate);
      }
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(log => new Date(log.created_at) <= toDate);
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(log =>
          log.description.toLowerCase().includes(searchLower) ||
          (log.user?.name?.toLowerCase() || '').includes(searchLower) ||
          log.entity_type.toLowerCase().includes(searchLower) ||
          log.event_type.toLowerCase().includes(searchLower) ||
          (log.user?.email?.toLowerCase() || '').includes(searchLower)
        );
      }

      setFilteredLogs(filtered);
    }
  }, [filters.search, filters.event_type, filters.entity_type, filters.dateRange, systemLogs, loading]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      {/* Header */}
      <div className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl supports-backdrop-blur:bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#003566] to-[#0077b6] rounded-xl blur opacity-30"></div>
                <div className="relative p-3 bg-gradient-to-br from-[#003566] via-[#00509d] to-[#003566] rounded-xl shadow-lg">
                  <ShieldCheck className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#003566] via-[#00509d] to-[#0077b6] bg-clip-text text-transparent tracking-tight">
                  System Activity Monitor
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">
                      LIVE MONITORING
                    </span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">
                    SECURITY COMPLIANCE
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">
                    ACTIVITY TRACKING
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-white border border-slate-200/70 rounded-xl shadow-sm">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${apiError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {apiError ? 'Connection Error' : 'API Connected'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {apiError ? 'Check authentication' : 'Live data streaming'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  fetchSystemStats();
                  fetchSystemLogs();
                }}
                disabled={isRefreshing}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative p-3 bg-gradient-to-br from-white to-slate-50 border border-slate-200/70 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <RefreshCcw 
                    size={18} 
                    className={cn(
                      "text-slate-600 transition-transform duration-300 group-hover:rotate-180",
                      isRefreshing && "animate-spin"
                    )} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* (The rest of your component code stays exactly as it was) */}

    </div>
  );
}