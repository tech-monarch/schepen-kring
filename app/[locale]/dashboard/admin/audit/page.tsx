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
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, parseISO } from "date-fns";

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

  // ============================================
  // API CALLS - Simplified without authentication
  // ============================================

  const fetchSystemStats = useCallback(async () => {
    try {
      console.log('Fetching system stats...');
      const response = await fetch('/api/system-logs/summary');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats API error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const data = await response.json();
      console.log('System stats received:', data);
      setSystemStats(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching system stats:", error);
      setApiError(error.message || "Failed to load system statistics");
      return null;
    }
  }, []);

  const fetchSystemLogs = useCallback(async () => {
    setIsRefreshing(true);
    setApiError(null);
    
    try {
      console.log('Fetching system logs...');
      
      // Build query parameters
      const params = new URLSearchParams();
      
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
      
      const url = `/api/system-logs?${params}`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logs API error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const data = await response.json();
      console.log('System logs received:', data);
      
      setSystemLogs(data.data || []);
      setFilteredLogs(data.data || []);
      setPagination(data.meta || {
        total: 0,
        per_page: 50,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });
      
    } catch (error: any) {
      console.error("Error fetching system logs:", error);
      setApiError(error.message || "Failed to load system logs");
      setSystemLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

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
      const params = new URLSearchParams();
      if (filters.dateRange.from) params.append('start_date', filters.dateRange.from);
      if (filters.dateRange.to) params.append('end_date', filters.dateRange.to);
      
      const response = await fetch(`/api/system-logs/export?${params}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create and download CSV file
      const blob = new Blob([data.csv_data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
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
      setLoading(true);
      try {
        console.log('Initializing system audit page...');
        const stats = await fetchSystemStats();
        
        // Only fetch logs if stats were successful
        if (stats) {
          await fetchSystemLogs();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
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
  // DEBUG: Test API endpoint
  // ============================================

  const testApiEndpoint = async () => {
    console.log('Testing API endpoints...');
    
    const endpoints = [
      '/api/system-logs/summary',
      '/api/system-logs?page=1',
      '/api/system-logs/health'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        const response = await fetch(endpoint);
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const text = await response.text();
          console.error(`Error response:`, text.substring(0, 200));
        } else {
          const data = await response.json();
          console.log(`Success:`, data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
      }
    }
  };

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
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${apiError ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">
                      {apiError ? 'CONNECTION ERROR' : 'LIVE MONITORING'}
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
                    {apiError ? 'Check API endpoint' : 'Live data streaming'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  setApiError(null);
                  Promise.all([fetchSystemStats(), fetchSystemLogs()]).finally(() => {
                    setIsRefreshing(false);
                  });
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
              
              {/* Debug button - remove in production */}
              <button
                onClick={testApiEndpoint}
                className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                title="Test API Endpoints"
              >
                Debug API
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Error Banner */}
        {apiError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-rose-600" size={20} />
                <div>
                  <p className="font-medium text-rose-800">API Error</p>
                  <p className="text-sm text-rose-600">{apiError}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setApiError(null);
                    setIsRefreshing(true);
                    Promise.all([fetchSystemStats(), fetchSystemLogs()]).finally(() => {
                      setIsRefreshing(false);
                    });
                  }}
                  className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setApiError(null)}
                  className="px-3 py-1.5 text-sm bg-white text-rose-600 border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <Database size={20} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                TOTAL LOGS
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {systemStats?.summary?.total_logs?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              <span className="text-emerald-600 font-medium">
                {systemStats?.recent_activity?.length || 0}
              </span> recent
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <Users size={20} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ACTIVITY TYPES
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {eventTypes.length || 0}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Different event types
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <Server size={20} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                API STATUS
              </span>
            </div>
            <div className={`text-3xl font-bold ${apiError ? 'text-rose-600' : 'text-emerald-600'}`}>
              {apiError ? 'ERROR' : 'ONLINE'}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              System Logs API
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <Shield size={20} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ENTITY TYPES
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {entityTypes.length || 0}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Tracked system entities
            </div>
          </div>
        </div>

        {/* Event Type Quick Stats */}
        {systemStats?.summary?.event_types && systemStats.summary.event_types.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} />
              Activity by Event Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {systemStats.summary.event_types.slice(0, 4).map((item, index) => {
                const info = getSeverityInfo(item.event_type);
                const Icon = info.icon;
                const percentage = systemStats.summary.total_logs > 0 ? 
                  (item.count / systemStats.summary.total_logs) * 100 : 0;
                
                return (
                  <motion.div
                    key={item.event_type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md",
                      info.bg,
                      info.border,
                      filters.event_type.includes(item.event_type) && "ring-2 ring-offset-1",
                      filters.event_type.includes(item.event_type) && info.color.replace('text', 'ring')
                    )}
                    onClick={() => toggleFilter('event_type', item.event_type)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", info.bg)}>
                          <Icon className={info.color} size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm truncate">
                            {formatEventType(item.event_type)}
                          </p>
                          <p className="text-2xl font-bold mt-1" style={{ color: info.color.split(' ')[1] }}>
                            {item.count}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all", info.dotColor)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Filter & Search</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={exportLogs}
                disabled={filteredLogs.length === 0 || loading}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                  filteredLogs.length === 0 || loading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          
        {/* System Logs Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">System Activity Logs</h2>
              <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{filteredLogs.length}</span> of{" "}
                <span className="font-bold text-slate-700">{pagination.total}</span> logs
                {pagination.last_page > 1 && (
                  <span className="ml-2">(Page {pagination.current_page} of {pagination.last_page})</span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : apiError ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertCircle size={32} className="text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Unable to load logs</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {apiError}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setIsRefreshing(true);
                      Promise.all([fetchSystemStats(), fetchSystemLogs()]).finally(() => {
                        setIsRefreshing(false);
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => setApiError(null)}
                    className="px-4 py-2 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const info = getSeverityInfo(log.event_type);
                const Icon = info.icon;
                
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          info.bg
                        )}>
                          <Icon className={info.color} size={20} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800 leading-tight">
                              {log.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {log.user ? (
                                <span className="font-medium">{log.user.name}</span>
                              ) : (
                                <span className="font-medium">System</span>
                              )} • {getEntityName(log)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                              info.bg,
                              info.color
                            )}>
                              {formatEventType(log.event_type)}
                            </span>
                            <ChevronRight 
                              size={16} 
                              className={cn(
                                "text-slate-400 transition-transform",
                                selectedLog?.id === log.id && "rotate-90"
                              )} 
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {log.user?.email || 'system@auto'}
                          </span>
                          {log.ip_address && (
                            <>
                              <span className="hidden md:inline">•</span>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                {log.ip_address}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedLog?.id === log.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-slate-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Information */}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    {log.user ? 'User Information' : 'System Action'}
                                  </h4>
                                  <div className="space-y-3">
                                    {log.user ? (
                                      <>
                                        <div>
                                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Name
                                          </p>
                                          <p className="text-sm font-medium">{log.user.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Email
                                          </p>
                                          <p className="text-sm font-medium">{log.user.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Role
                                          </p>
                                          <p className="text-sm font-medium">{log.user.role}</p>
                                        </div>
                                      </>
                                    ) : (
                                      <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                          Action
                                        </p>
                                        <p className="text-sm font-medium">System Automated Action</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Event Type
                                      </p>
                                      <p className="text-sm font-medium">{formatEventType(log.event_type)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Technical Details */}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Settings size={16} />
                                    Technical Details
                                  </h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Entity Details
                                      </p>
                                      <p className="text-sm text-slate-600">
                                        {getEntityName(log)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Timestamp
                                      </p>
                                      <p className="text-sm font-medium">
                                        {format(parseISO(log.created_at), 'PPpp')}
                                      </p>
                                    </div>
                                    {log.changes && Object.keys(log.changes).length > 0 && (
                                      <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                          Changes Made
                                        </p>
                                        <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                                          {JSON.stringify(log.changes, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {log.ip_address && (
                                      <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                          IP Address
                                        </p>
                                        <p className="text-sm font-mono">{log.ip_address}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No activity logs found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {filters.search || filters.event_type.length > 0 || filters.entity_type.length > 0
                    ? "No activity logs match your current filters. Try adjusting your search criteria."
                    : "No activity logs available yet. Start by creating tasks, updating yachts, or having users log in."}
                </p>
                {(filters.search || filters.event_type.length > 0 || filters.entity_type.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && !apiError && (
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => changePage(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1 || loading}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() => changePage(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page || loading}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
          
        </div>

        {/* Debug information - remove in production */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Debug Information</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Refreshing: {isRefreshing ? 'Yes' : 'No'}</p>
            <p>System Logs: {systemLogs.length}</p>
            <p>Filtered Logs: {filteredLogs.length}</p>
            <p>API Error: {apiError || 'None'}</p>
            <button
              onClick={testApiEndpoint}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test All API Endpoints
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}