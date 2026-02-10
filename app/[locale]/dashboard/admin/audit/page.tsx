"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
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
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, parseISO } from "date-fns";

interface AuditLog {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  action: string;
  description: string;
  severity: "info" | "success" | "warning" | "error";
  ip_address: string;
  user_agent: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface FilterState {
  severity: string[];
  entityType: string[];
  dateRange: {
    from: string;
    to: string;
  };
  search: string;
}

// Fallback mock data
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    user_id: '1',
    entity_type: 'AUTH',
    entity_id: 'auth-001',
    entity_name: 'Login System',
    action: 'USER_LOGIN',
    description: 'Admin user authentication successful',
    severity: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    old_data: null,
    new_data: { status: 'logged_in' },
    metadata: { url: '/api/login', method: 'POST' },
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    user: {
      id: '1',
      name: 'Maritime Admin',
      email: 'admin@maritime.com',
      role: 'Admin'
    }
  },
  {
    id: '2',
    user_id: '2',
    entity_type: 'YACHT',
    entity_id: 'yacht-001',
    entity_name: 'Sea Breeze',
    action: 'YACHT_UPDATED',
    description: 'Yacht status updated from "Draft" to "For Sale"',
    severity: 'info',
    ip_address: '10.0.1.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    old_data: { status: 'Draft' },
    new_data: { status: 'For Sale', price: '€1,250,000' },
    metadata: { url: '/api/yachts/001', method: 'PUT' },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: {
      id: '2',
      name: 'Fleet Manager',
      email: 'fleet@maritime.com',
      role: 'Employee'
    }
  },
  {
    id: '3',
    user_id: '3',
    entity_type: 'BID',
    entity_id: 'bid-2024-001',
    entity_name: 'Ocean Monarch Bid',
    action: 'BID_PLACED',
    description: 'New bid placed - €2,450,000',
    severity: 'warning',
    ip_address: '89.100.25.150',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    old_data: { highest_bid: '€2,300,000' },
    new_data: { highest_bid: '€2,450,000', bidder_id: 'client-5' },
    metadata: { url: '/api/bids/place', method: 'POST' },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: {
      id: '3',
      name: 'Premium Client',
      email: 'client@corporate.com',
      role: 'Customer'
    }
  },
  {
    id: '4',
    user_id: '4',
    entity_type: 'TASK',
    entity_id: 'task-789',
    entity_name: 'Engine Inspection',
    action: 'TASK_COMPLETED',
    description: 'Maintenance task marked as completed',
    severity: 'success',
    ip_address: '192.168.2.25',
    user_agent: 'Tablet App v2.1',
    old_data: { status: 'In Progress' },
    new_data: { status: 'Done', completed_at: new Date().toISOString() },
    metadata: { url: '/api/tasks/789', method: 'PATCH' },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: {
      id: '4',
      name: 'Technical Officer',
      email: 'tech@maritime.com',
      role: 'Employee'
    }
  }
];

export default function SystemAuditPage() {
  const t = useTranslations("Audit");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    uniqueUsers: 0,
    bySeverity: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  });
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    severity: [],
    entityType: [],
    dateRange: {
      from: "",
      to: "",
    },
    search: "",
  });

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setIsRefreshing(true);
    setApiError(null);
    
    try {
      // Try to fetch from the new activity-logs endpoint
      const [logsRes, statsRes] = await Promise.allSettled([
        api.get("/activity-logs"),
        api.get("/activity-logs/stats")
      ]);

      let logs: AuditLog[] = [];
      let statsData = {
        total: 0,
        today: 0,
        uniqueUsers: 0,
        bySeverity: {},
        byType: {},
      };

      // Process logs
      if (logsRes.status === 'fulfilled') {
        const responseData = logsRes.value.data;
        if (responseData && responseData.logs) {
          logs = responseData.logs;
          statsData.total = responseData.pagination?.total || logs.length;
        }
      }

      // Process stats
      if (statsRes.status === 'fulfilled') {
        const statsResponse = statsRes.value.data;
        if (statsResponse) {
          statsData = {
            total: statsResponse.total_logs || logs.length,
            today: statsResponse.today_logs || 0,
            uniqueUsers: statsResponse.unique_users || 0,
            bySeverity: statsResponse.by_severity || {},
            byType: statsResponse.by_type || {},
          };
        }
      }

      // If API calls failed, use mock data
      if (logs.length === 0) {
        console.log('Using mock audit data');
        logs = [...MOCK_AUDIT_LOGS];
        statsData = {
          total: logs.length,
          today: logs.filter(log => 
            new Date(log.created_at).toDateString() === new Date().toDateString()
          ).length,
          uniqueUsers: new Set(logs.map(log => log.user_id)).size,
          bySeverity: logs.reduce((acc, log) => {
            acc[log.severity] = (acc[log.severity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byType: logs.reduce((acc, log) => {
            acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
        
        setApiError('API endpoint not available. Showing demo data.');
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAuditLogs(logs);
      setFilteredLogs(logs);
      setStats(statsData);
      
    } catch (error: any) {
      console.error("Audit log fetch error:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      setApiError(`Failed to load audit logs: ${errorMessage}. Using demo data.`);
      
      // Use mock data on error
      const mockLogs = [...MOCK_AUDIT_LOGS];
      setAuditLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setStats({
        total: mockLogs.length,
        today: mockLogs.filter(log => 
          new Date(log.created_at).toDateString() === new Date().toDateString()
        ).length,
        uniqueUsers: new Set(mockLogs.map(log => log.user_id)).size,
        bySeverity: mockLogs.reduce((acc, log) => {
          acc[log.severity] = (acc[log.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: mockLogs.reduce((acc, log) => {
          acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let result = auditLogs;

    // Apply severity filter
    if (filters.severity.length > 0) {
      result = result.filter(log => filters.severity.includes(log.severity));
    }

    // Apply entity type filter
    if (filters.entityType.length > 0) {
      result = result.filter(log => filters.entityType.includes(log.entity_type));
    }

    // Apply date range filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      result = result.filter(log => new Date(log.created_at) >= fromDate);
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(log => new Date(log.created_at) <= toDate);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(log =>
        log.description.toLowerCase().includes(searchLower) ||
        (log.user?.name || '').toLowerCase().includes(searchLower) ||
        log.entity_name.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        (log.user?.email || '').toLowerCase().includes(searchLower) ||
        log.entity_type.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(result);
  }, [filters, auditLogs]);

  // Fetch on mount
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Get severity icon and color
  const getSeverityInfo = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'success':
        return { 
          icon: CheckCircle, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          label: 'Success' 
        };
      case 'warning':
        return { 
          icon: AlertCircle, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          label: 'Warning' 
        };
      case 'error':
        return { 
          icon: XCircle, 
          color: 'text-rose-600', 
          bg: 'bg-rose-50', 
          border: 'border-rose-200',
          label: 'Error' 
        };
      default:
        return { 
          icon: Activity, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          label: 'Info' 
        };
    }
  };

  // Toggle filter
  const toggleFilter = (type: 'severity' | 'entityType', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // Export logs
  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'Action', 'Description', 'User', 'Role', 'Entity', 'Entity Type', 'IP Address', 'User Agent'],
      ...filteredLogs.map(log => [
        format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.severity.toUpperCase(),
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.user?.name || 'System',
        log.user?.role || 'System',
        log.entity_name,
        log.entity_type,
        log.ip_address,
        `"${log.user_agent.replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-audit-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      severity: [],
      entityType: [],
      dateRange: { from: '', to: '' },
      search: ''
    });
  };

  // Get unique entity types from logs
  const entityTypes = Array.from(new Set(auditLogs.map(log => log.entity_type))).sort();

  // Get unique severities
  const severities = ['info', 'success', 'warning', 'error'] as const;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif italic text-[#003566]">
            System Audit Trail
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2 flex items-center gap-2">
            <ShieldCheck size={12} />
            Comprehensive Security & Activity Monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold transition-colors border",
              filteredLogs.length === 0 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-300"
            )}
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => fetchAuditLogs()}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Refresh audit logs"
          >
            <RefreshCcw
              size={16}
              className={cn(isRefreshing && "animate-spin")}
            />
          </button>
        </div>
      </header>

      {/* API Error Alert */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Database className="text-amber-600" size={18} />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">{apiError}</p>
              <p className="text-xs text-amber-600 mt-1">
                The system is displaying demo data. Real-time updates may not be available.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Total Logs</p>
          <p className="text-2xl font-serif text-[#003566]">{stats.total.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Active Today</p>
          <p className="text-2xl font-serif text-emerald-600">{stats.today.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Unique Users</p>
          <p className="text-2xl font-serif text-blue-600">{stats.uniqueUsers.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Data Source</p>
          <div className="flex items-center gap-2">
            <Server size={16} className={apiError ? "text-amber-500" : "text-emerald-500"} />
            <p className="text-lg font-serif">
              {apiError ? "Demo Mode" : "Live API"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Severity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {severities.map((severity, index) => {
          const info = getSeverityInfo(severity);
          const Icon = info.icon;
          const count = stats.bySeverity[severity] || 0;
          
          return (
            <motion.div
              key={severity}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 border rounded-lg flex items-center gap-3 cursor-pointer",
                info.bg,
                info.border,
                filters.severity.includes(severity) && "ring-2 ring-offset-1",
                filters.severity.includes(severity) && info.color.replace('text', 'ring')
              )}
              onClick={() => toggleFilter('severity', severity)}
            >
              <div className={cn("p-2 rounded-full", info.bg)}>
                <Icon className={info.color} size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700">{info.label}</p>
                <p className={cn("text-lg font-bold", info.color)}>{count}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic flex items-center gap-2">
            <Filter size={14} />
            Filter Logs
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search actions, users, or entities..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 text-xs border border-slate-200 focus:border-blue-300 focus:outline-none w-64"
              />
            </div>
            {(filters.severity.length > 0 || filters.entityType.length > 0 || filters.dateRange.from || filters.dateRange.to || filters.search) && (
              <button
                onClick={clearFilters}
                className="text-xs uppercase tracking-wider font-bold text-slate-500 hover:text-rose-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Severity Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Severity Level</h3>
            <div className="flex flex-wrap gap-2">
              {severities.map((sev) => {
                const info = getSeverityInfo(sev);
                const Icon = info.icon;
                const isActive = filters.severity.includes(sev);
                const count = stats.bySeverity[sev] || 0;
                
                return (
                  <button
                    key={sev}
                    onClick={() => toggleFilter('severity', sev)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-bold transition-all border",
                      isActive
                        ? `${info.bg} ${info.color} ${info.color.replace('text', 'border')}`
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Icon size={12} />
                    {info.label}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      isActive ? "bg-white/30" : "bg-slate-200"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entity Type Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Entity Type</h3>
            <div className="flex flex-wrap gap-2">
              {entityTypes.slice(0, 5).map((type) => {
                const isActive = filters.entityType.includes(type);
                const count = stats.byType[type] || 0;
                
                return (
                  <button
                    key={type}
                    onClick={() => toggleFilter('entityType', type)}
                    className={cn(
                      "px-3 py-2 text-xs uppercase tracking-wider font-bold transition-all border",
                      isActive
                        ? "bg-blue-50 text-blue-600 border-blue-300"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {type}
                    <span className={cn(
                      "ml-1 text-[10px] px-1.5 py-0.5 rounded",
                      isActive ? "bg-blue-100" : "bg-slate-200"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
              {entityTypes.length > 5 && (
                <div className="text-xs text-slate-400 italic pl-2 py-2">
                  +{entityTypes.length - 5} more types
                </div>
              )}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Date Range</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="px-3 py-2 text-xs border border-slate-200 focus:border-blue-300 focus:outline-none flex-1"
                  max={filters.dateRange.to || format(new Date(), 'yyyy-MM-dd')}
                />
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="px-3 py-2 text-xs border border-slate-200 focus:border-blue-300 focus:outline-none flex-1"
                  min={filters.dateRange.from}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              {(filters.dateRange.from || filters.dateRange.to) && (
                <p className="text-[10px] text-slate-500">
                  Showing logs from {filters.dateRange.from || 'the beginning'} to {filters.dateRange.to || 'now'}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Audit Logs List */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic">
            Activity Timeline
            {filters.search && (
              <span className="ml-3 text-xs font-normal text-slate-500">
                Search: "{filters.search}"
              </span>
            )}
          </h2>
          <div className="text-xs text-slate-500">
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-3 h-3 bg-slate-200 rounded-full mt-1.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => {
              const severityInfo = getSeverityInfo(log.severity);
              const Icon = severityInfo.icon;
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-slate-50/50 transition-colors group"
                  onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                >
                  <div className="flex gap-4 cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        severityInfo.bg
                      )}>
                        <Icon className={severityInfo.color} size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-slate-800 font-medium">
                            {log.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {log.user?.name || 'System'} ({log.user?.role || 'System'}) • {log.entity_type}: {log.entity_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] uppercase tracking-widest px-2 py-1 border font-bold",
                            severityInfo.color.replace('text', 'border'),
                            severityInfo.bg
                          )}>
                            {log.severity.toUpperCase()}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-slate-200 text-slate-500 font-bold">
                            {log.action.replace('_', ' ')}
                          </span>
                          <ChevronRight 
                            size={16} 
                            className={cn(
                              "text-slate-400 transition-transform",
                              showDetails === log.id && "rotate-90"
                            )} 
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                          <span className="text-slate-300">•</span>
                          {format(parseISO(log.created_at), 'HH:mm:ss')}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {log.ip_address}
                        </span>
                      </div>

                      {/* Details section */}
                      {showDetails === log.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Info */}
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <User size={12} />
                                User Information
                              </h4>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Name</p>
                                  <p className="text-sm">{log.user?.name || 'System'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                                  <p className="text-sm">{log.user?.email || 'system@auto'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Role</p>
                                  <p className="text-sm">{log.user?.role || 'System'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Technical Info */}
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-2">
                                <Activity size={12} />
                                Technical Details
                              </h4>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">User Agent</p>
                                  <p className="text-sm font-mono text-xs break-all">{log.user_agent}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Entity ID</p>
                                  <p className="text-sm font-mono">{log.entity_id}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Full Timestamp</p>
                                  <p className="text-sm">{format(parseISO(log.created_at), 'PPpp')}</p>
                                </div>
                              </div>
                            </div>

                            {/* Data Changes */}
                            {(log.old_data || log.new_data) && (
                              <div className="md:col-span-2">
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                                  Data Changes
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {log.old_data && Object.keys(log.old_data).length > 0 && (
                                    <div>
                                      <p className="text-[10px] text-rose-500 uppercase font-bold mb-1">Before</p>
                                      <pre className="text-xs bg-rose-50 p-3 rounded border border-rose-200 overflow-x-auto">
                                        {JSON.stringify(log.old_data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.new_data && Object.keys(log.new_data).length > 0 && (
                                    <div>
                                      <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">After</p>
                                      <pre className="text-xs bg-emerald-50 p-3 rounded border border-emerald-200 overflow-x-auto">
                                        {JSON.stringify(log.new_data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Activity className="text-slate-300" size={24} />
              </div>
              <p className="text-sm text-slate-400 mb-1">No audit logs match your filters</p>
              <p className="text-xs text-slate-300 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="text-xs uppercase tracking-wider font-bold text-blue-600 hover:text-[#003566] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} />
          <p>System audit trail maintained for compliance and security monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="uppercase tracking-wider font-bold">
            {isRefreshing ? 'Refreshing...' : `Last refresh: ${formatDistanceToNow(new Date(), { addSuffix: true })}`}
          </p>
          {apiError && (
            <p className="text-amber-600 text-xs">
              <AlertCircle size={12} className="inline mr-1" />
              Demo Mode Active
            </p>
          )}
        </div>
      </div>
    </div>
  );
}