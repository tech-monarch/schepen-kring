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
  X,
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
  const [showFilters, setShowFilters] = useState(false);
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
  // API CALLS
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

  const availableEventTypes = useMemo(() => {
    if (!systemStats?.summary?.event_types) return [];
    return systemStats.summary.event_types.map(et => et.event_type);
  }, [systemStats]);

  const availableEntityTypes = useMemo(() => {
    if (!systemStats?.summary?.entity_types) return [];
    return systemStats.summary.entity_types.map(et => et.entity_type);
  }, [systemStats]);

  const toggleEventFilter = (eventType: string) => {
    setFilters(prev => ({
      ...prev,
      event_type: prev.event_type.includes(eventType)
        ? prev.event_type.filter(t => t !== eventType)
        : [...prev.event_type, eventType],
      page: 1,
    }));
  };

  const toggleEntityFilter = (entityType: string) => {
    setFilters(prev => ({
      ...prev,
      entity_type: prev.entity_type.includes(entityType)
        ? prev.entity_type.filter(t => t !== entityType)
        : [...prev.entity_type, entityType],
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      event_type: [],
      entity_type: [],
      dateRange: { from: "", to: "" },
      search: "",
      page: 1,
    });
  };

  const changePage = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getEventIcon = (eventType: string) => {
    const iconProps = { size: 18, className: "flex-shrink-0" };
    
    switch (eventType.toLowerCase()) {
      case 'create':
      case 'created':
        return <CheckCircle {...iconProps} className="flex-shrink-0 text-green-600" />;
      case 'update':
      case 'updated':
        return <Activity {...iconProps} className="flex-shrink-0 text-blue-600" />;
      case 'delete':
      case 'deleted':
        return <XCircle {...iconProps} className="flex-shrink-0 text-red-600" />;
      case 'login':
      case 'logout':
        return <User {...iconProps} className="flex-shrink-0 text-purple-600" />;
      default:
        return <Activity {...iconProps} className="flex-shrink-0 text-slate-600" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'create':
      case 'created':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'update':
      case 'updated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
      case 'deleted':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'login':
      case 'logout':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getEntityName = (log: SystemLog) => {
    const entityType = formatEventType(log.entity_type);
    const entityId = log.entity_id ? `#${log.entity_id}` : '';
    return `${entityType} ${entityId}`.trim();
  };

  const handleExport = () => {
    const csvData = filteredLogs.map(log => ({
      timestamp: log.created_at,
      event_type: log.event_type,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      user: log.user?.name || 'System',
      description: log.description,
      ip_address: log.ip_address,
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-audit-${new Date().toISOString()}.csv`;
    a.click();
  };

  // ============================================
  // LIFECYCLE
  // ============================================

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchSystemStats();
      await fetchSystemLogs();
      setLoading(false);
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchSystemLogs();
    }
  }, [filters]);

  // ============================================
  // RENDER
  // ============================================

  const activeFilterCount = 
    filters.event_type.length + 
    filters.entity_type.length + 
    (filters.search ? 1 : 0) +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Main Container - Adjusted for sidebar and navbar */}
      <div className="pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                    <ShieldCheck className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Audit Log</h1>
                    <p className="text-slate-600 text-sm mt-1">
                      Track all system activities and changes
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm",
                    showFilters 
                      ? "bg-blue-600 text-white shadow-blue-200" 
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  )}
                >
                  <Filter size={18} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={fetchSystemLogs}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                  <RefreshCcw size={18} className={cn(isRefreshing && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                
                <button
                  onClick={handleExport}
                  disabled={filteredLogs.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-sm disabled:opacity-50"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {systemStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database size={20} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {systemStats.summary.total_logs.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 mt-1">Total Events</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity size={20} className="text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {systemStats.summary.event_types.length}
                </p>
                <p className="text-sm text-slate-600 mt-1">Event Types</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Server size={20} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {systemStats.summary.entity_types.length}
                </p>
                <p className="text-sm text-slate-600 mt-1">Entity Types</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock size={20} className="text-orange-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {systemStats.recent_activity.length}
                </p>
                <p className="text-sm text-slate-600 mt-1">Recent Activity</p>
              </div>
            </motion.div>
          )}

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search descriptions, users, IPs..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, from: e.target.value },
                          page: 1 
                        }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, to: e.target.value },
                          page: 1 
                        }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Event Types */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Event Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableEventTypes.map(eventType => (
                        <button
                          key={eventType}
                          onClick={() => toggleEventFilter(eventType)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                            filters.event_type.includes(eventType)
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
                          )}
                        >
                          {formatEventType(eventType)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entity Types */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Entity Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableEntityTypes.map(entityType => (
                        <button
                          key={entityType}
                          onClick={() => toggleEntityFilter(entityType)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                            filters.entity_type.includes(entityType)
                              ? "bg-green-600 text-white border-green-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-300 hover:border-green-400"
                          )}
                        >
                          {formatEventType(entityType)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFilterCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Clear all filters ({activeFilterCount})
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-red-900">Error Loading Data</h3>
                  <p className="text-sm text-red-700 mt-1">{apiError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Activity Logs</h2>
                <p className="text-sm text-slate-600">
                  {pagination.total > 0 && `${pagination.total.toLocaleString()} total entries`}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {loading ? (
                <div className="py-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                  <p className="text-slate-600">Loading activity logs...</p>
                </div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const isExpanded = selectedLog?.id === log.id;
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "hover:bg-slate-50 transition-colors cursor-pointer",
                        isExpanded && "bg-blue-50"
                      )}
                      onClick={() => setSelectedLog(isExpanded ? null : log)}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getEventIcon(log.event_type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <p className="text-slate-900 font-medium leading-relaxed">
                                  {log.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap",
                                  getEventColor(log.event_type)
                                )}>
                                  {formatEventType(log.event_type)}
                                </span>
                              </div>
                            </div>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                              </span>
                              
                              {log.user && (
                                <span className="flex items-center gap-1.5">
                                  <User size={14} />
                                  {log.user.name}
                                </span>
                              )}
                              
                              <span className="flex items-center gap-1.5">
                                <Database size={14} />
                                {getEntityName(log)}
                              </span>
                              
                              {log.ip_address && (
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                  {log.ip_address}
                                </span>
                              )}

                              <ChevronRight 
                                size={16} 
                                className={cn(
                                  "ml-auto transition-transform",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
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
                                              <p className="text-sm font-medium text-slate-900">{log.user.name}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                                Email
                                              </p>
                                              <p className="text-sm font-medium text-slate-900">{log.user.email}</p>
                                            </div>
                                            <div>
                                              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                                Role
                                              </p>
                                              <p className="text-sm font-medium text-slate-900">{log.user.role}</p>
                                            </div>
                                          </>
                                        ) : (
                                          <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                              Action
                                            </p>
                                            <p className="text-sm font-medium text-slate-900">System Automated Action</p>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Event Type
                                          </p>
                                          <p className="text-sm font-medium text-slate-900">{formatEventType(log.event_type)}</p>
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
                                          <p className="text-sm text-slate-900 font-medium">
                                            {getEntityName(log)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Timestamp
                                          </p>
                                          <p className="text-sm font-medium text-slate-900">
                                            {format(parseISO(log.created_at), 'PPpp')}
                                          </p>
                                        </div>
                                        {log.changes && Object.keys(log.changes).length > 0 && (
                                          <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                              Changes Made
                                            </p>
                                            <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-auto max-h-40 border border-slate-200 text-slate-900">
                                              {JSON.stringify(log.changes, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {log.ip_address && (
                                          <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                              IP Address
                                            </p>
                                            <p className="text-sm font-mono text-slate-900">{log.ip_address}</p>
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
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && !apiError && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-slate-700">
                    Showing <span className="font-medium">{pagination.from}</span> to{' '}
                    <span className="font-medium">{pagination.to}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1 || loading}
                      className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-white transition-colors font-medium text-sm disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-700">
                      Page <span className="font-medium">{pagination.current_page}</span> of{' '}
                      <span className="font-medium">{pagination.last_page}</span>
                    </span>
                    <button
                      onClick={() => changePage(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page || loading}
                      className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-white transition-colors font-medium text-sm disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}