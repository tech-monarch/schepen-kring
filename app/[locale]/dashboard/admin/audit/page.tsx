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
  Eye,
  Users,
  Calendar,
  FileText,
  Ship,
  Settings,
  Key,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  Database as DatabaseIcon,
  Network,
  Terminal,
  Cpu,
  HardDrive,
  MemoryStick,
  Router,
  Wifi,
  ServerCrash,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, parseISO } from "date-fns";

// ============================================
// TYPES AND INTERFACES
// ============================================

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  description: string;
  entityType: string;
  entityId: string;
  entityName: string;
  severity: "info" | "success" | "warning" | "error";
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, any>;
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

interface SystemStats {
  totalLogs: number;
  todayLogs: number;
  uniqueUsers: number;
  systemStatus: "online" | "degraded" | "offline";
  apiStatus: "online" | "error";
  responseTime: number;
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

const generateMockLog = (index: number): AuditLog => {
  const actions = [
    { type: "LOGIN", desc: "User logged in successfully", entity: "AUTH", severity: "success" },
    { type: "LOGOUT", desc: "User logged out", entity: "AUTH", severity: "info" },
    { type: "CREATE", desc: "Created new yacht listing", entity: "YACHT", severity: "info" },
    { type: "UPDATE", desc: "Updated yacht specifications", entity: "YACHT", severity: "info" },
    { type: "DELETE", desc: "Deleted yacht from system", entity: "YACHT", severity: "warning" },
    { type: "BID_PLACE", desc: "Placed bid on yacht", entity: "BID", severity: "success" },
    { type: "BID_ACCEPT", desc: "Bid accepted by admin", entity: "BID", severity: "success" },
    { type: "TASK_CREATE", desc: "Created new task", entity: "TASK", severity: "info" },
    { type: "TASK_COMPLETE", desc: "Task marked as completed", entity: "TASK", severity: "success" },
    { type: "USER_CREATE", desc: "Created new user account", entity: "USER", severity: "info" },
    { type: "USER_UPDATE", desc: "Updated user permissions", entity: "USER", severity: "warning" },
    { type: "USER_DELETE", desc: "Deleted user account", entity: "USER", severity: "error" },
    { type: "SYSTEM_BACKUP", desc: "System backup completed", entity: "SYSTEM", severity: "success" },
    { type: "SECURITY_ALERT", desc: "Security alert triggered", entity: "SECURITY", severity: "error" },
    { type: "API_CALL", desc: "API endpoint accessed", entity: "API", severity: "info" },
    { type: "FILE_UPLOAD", desc: "File uploaded to server", entity: "STORAGE", severity: "info" },
    { type: "EMAIL_SENT", desc: "Email notification sent", entity: "EMAIL", severity: "info" },
    { type: "PAYMENT_RECEIVED", desc: "Payment processed successfully", entity: "PAYMENT", severity: "success" },
    { type: "DATABASE_QUERY", desc: "Database query executed", entity: "DATABASE", severity: "info" },
    { type: "CACHE_CLEAR", desc: "System cache cleared", entity: "SYSTEM", severity: "warning" },
  ];

  const users = [
    { id: "admin-1", name: "Admin User", email: "admin@maritime.com", role: "Admin" },
    { id: "fleet-1", name: "Fleet Manager", email: "fleet@maritime.com", role: "Employee" },
    { id: "tech-1", name: "Technical Officer", email: "tech@maritime.com", role: "Employee" },
    { id: "client-1", name: "Premium Client", email: "client@corporate.com", role: "Customer" },
    { id: "client-2", name: "Business Partner", email: "partner@business.com", role: "Partner" },
    { id: "system", name: "System Auto", email: "system@auto", role: "System" },
  ];

  const entities = [
    { id: "yacht-001", name: "Ocean Monarch", type: "YACHT" },
    { id: "yacht-002", name: "Sea Breeze", type: "YACHT" },
    { id: "yacht-003", name: "Royal Voyager", type: "YACHT" },
    { id: "task-001", name: "Engine Inspection", type: "TASK" },
    { id: "task-002", name: "Safety Check", type: "TASK" },
    { id: "bid-001", name: "Bid #2024-001", type: "BID" },
    { id: "user-001", name: "User Profile", type: "USER" },
    { id: "auth-001", name: "Login Session", type: "AUTH" },
    { id: "system-001", name: "Backup Job", type: "SYSTEM" },
  ];

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    "Tablet App v2.1.0",
    "Mobile App v3.0.1",
    "System Monitor v1.2",
    "API Client v2.0",
    "Backup Service v1.0",
  ];

  const action = actions[Math.floor(Math.random() * actions.length)];
  const user = users[Math.floor(Math.random() * users.length)];
  const entity = entities[Math.floor(Math.random() * entities.length)];
  const hoursAgo = Math.floor(Math.random() * 24 * 7);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  return {
    id: `log-${Date.now()}-${index}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: action.type,
    description: action.desc,
    entityType: entity.type,
    entityId: entity.id,
    entityName: entity.name,
    severity: action.severity as any,
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    timestamp: new Date(Date.now() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000)).toISOString(),
    metadata: {
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
      location: ["US", "EU", "ASIA", "AU"][Math.floor(Math.random() * 4)],
      method: ["GET", "POST", "PUT", "DELETE", "PATCH"][Math.floor(Math.random() * 5)],
      endpoint: `/api/${["yachts", "tasks", "users", "bids", "auth"][Math.floor(Math.random() * 5)]}`,
    }
  };
};

const generateMockLogs = (count: number): AuditLog[] => {
  return Array.from({ length: count }, (_, i) => generateMockLog(i));
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SystemAuditPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalLogs: 0,
    todayLogs: 0,
    uniqueUsers: 0,
    systemStatus: "online",
    apiStatus: "error",
    responseTime: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    severity: [],
    entityType: [],
    dateRange: {
      from: "",
      to: "",
    },
    search: "",
  });

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchSystemStats = useCallback(async () => {
    try {
      // Try to get basic system info from available endpoints
      const startTime = Date.now();
      
      // Test API connectivity
      const testResponse = await Promise.race([
        api.get("/yachts").catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 3000))
      ]);

      const responseTime = Date.now() - startTime;
      
      setSystemStats(prev => ({
        ...prev,
        responseTime,
        apiStatus: testResponse ? "online" : "error",
        systemStatus: testResponse ? "online" : "degraded"
      }));

    } catch (error) {
      console.log("System stats check completed with demo data");
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setIsRefreshing(true);
    setApiError(null);
    
    try {
      // Always use mock data for now since API is not ready
      const mockLogs = generateMockLogs(25);
      
      // Calculate stats from mock data
      const today = new Date().toDateString();
      const todayLogs = mockLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
      ).length;
      
      const uniqueUsers = new Set(mockLogs.map(log => log.userId)).size;

      setAuditLogs(mockLogs);
      setFilteredLogs(mockLogs);
      
      setSystemStats(prev => ({
        ...prev,
        totalLogs: mockLogs.length,
        todayLogs,
        uniqueUsers,
      }));

      setApiError("Using demo data - API endpoints not configured");
      
    } catch (error: any) {
      console.error("Error loading audit data:", error);
      setApiError("Failed to load audit data. Using offline mode.");
      
      // Fallback to minimal mock data
      const fallbackLogs = generateMockLogs(10);
      setAuditLogs(fallbackLogs);
      setFilteredLogs(fallbackLogs);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // ============================================
  // FILTERS AND UTILITIES
  // ============================================

  const applyFilters = useCallback(() => {
    let result = auditLogs;

    // Severity filter
    if (filters.severity.length > 0) {
      result = result.filter(log => filters.severity.includes(log.severity));
    }

    // Entity type filter
    if (filters.entityType.length > 0) {
      result = result.filter(log => filters.entityType.includes(log.entityType));
    }

    // Date range filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      result = result.filter(log => new Date(log.timestamp) >= fromDate);
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(log => new Date(log.timestamp) <= toDate);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(log =>
        log.description.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.entityName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        log.userRole.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(result);
  }, [filters, auditLogs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getSeverityInfo = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'success':
        return { 
          icon: CheckCircle, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          label: 'Success',
          dotColor: 'bg-emerald-400'
        };
      case 'warning':
        return { 
          icon: AlertCircle, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          label: 'Warning',
          dotColor: 'bg-amber-400'
        };
      case 'error':
        return { 
          icon: XCircle, 
          color: 'text-rose-600', 
          bg: 'bg-rose-50', 
          border: 'border-rose-200',
          label: 'Error',
          dotColor: 'bg-rose-400'
        };
      default:
        return { 
          icon: Activity, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          label: 'Info',
          dotColor: 'bg-blue-400'
        };
    }
  };

  const entityTypes = useMemo(() => {
    const types = Array.from(new Set(auditLogs.map(log => log.entityType)));
    return types.sort();
  }, [auditLogs]);

  const severityCounts = useMemo(() => {
    return auditLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [auditLogs]);

  // ============================================
  // ACTIONS
  // ============================================

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'Action', 'Description', 'User', 'Role', 'Entity', 'Entity Type', 'IP Address'],
      ...filteredLogs.map(log => [
        format(parseISO(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.severity.toUpperCase(),
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.userName,
        log.userRole,
        log.entityName,
        log.entityType,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      severity: [],
      entityType: [],
      dateRange: { from: '', to: '' },
      search: ''
    });
  };

  const toggleFilter = (type: 'severity' | 'entityType', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    const init = async () => {
      await fetchSystemStats();
      await fetchAuditLogs();
    };
    init();
  }, [fetchSystemStats, fetchAuditLogs]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#003566]/10 rounded-lg">
                <ShieldCheck className="text-[#003566]" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-serif italic text-[#003566]">
                  System Audit & Security
                </h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium mt-1">
                  REAL-TIME MONITORING • SECURITY COMPLIANCE • ACTIVITY TRACKING
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  systemStats.systemStatus === 'online' ? 'bg-emerald-500' :
                  systemStats.systemStatus === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-slate-600 font-medium">
                  {systemStats.systemStatus === 'online' ? 'All Systems Operational' :
                   systemStats.systemStatus === 'degraded' ? 'Partial Degradation' : 'System Offline'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  setTimeout(() => {
                    fetchAuditLogs();
                    fetchSystemStats();
                  }, 500);
                }}
                disabled={isRefreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCcw size={18} className={cn("text-slate-500", isRefreshing && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <DatabaseIcon size={20} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                TOTAL LOGS
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{systemStats.totalLogs.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">
              <span className="text-emerald-600 font-medium">+{systemStats.todayLogs}</span> today
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Users size={20} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                UNIQUE USERS
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{systemStats.uniqueUsers}</div>
            <div className="text-xs text-slate-500 mt-2">
              Active across the system
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Server size={20} className={cn(
                systemStats.apiStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'
              )} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                API STATUS
              </span>
            </div>
            <div className={cn(
              "text-3xl font-bold",
              systemStats.apiStatus === 'online' ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {systemStats.apiStatus === 'online' ? 'ONLINE' : 'ERROR'}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {systemStats.responseTime > 0 ? `${systemStats.responseTime}ms` : 'Monitoring...'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Shield size={20} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                SECURITY LEVEL
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">HIGH</div>
            <div className="text-xs text-slate-500 mt-2">
              All protocols active
            </div>
          </div>
        </div>

        {/* Severity Quick Stats */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={16} />
            Activity by Severity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['info', 'success', 'warning', 'error'] as const).map((severity, index) => {
              const info = getSeverityInfo(severity);
              const Icon = info.icon;
              const count = severityCounts[severity] || 0;
              const percentage = auditLogs.length > 0 ? (count / auditLogs.length) * 100 : 0;
              
              return (
                <motion.div
                  key={severity}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md",
                    info.bg,
                    info.border,
                    filters.severity.includes(severity) && "ring-2 ring-offset-1",
                    filters.severity.includes(severity) && info.color.replace('text', 'ring')
                  )}
                  onClick={() => toggleFilter('severity', severity)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", info.bg)}>
                        <Icon className={info.color} size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{info.label}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: info.color.split(' ')[1] }}>
                          {count}
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
                disabled={filteredLogs.length === 0}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                  filteredLogs.length === 0
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Severity Filters */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Severity Level</h3>
              <div className="flex flex-wrap gap-2">
                {(['info', 'success', 'warning', 'error'] as const).map((severity) => {
                  const info = getSeverityInfo(severity);
                  const Icon = info.icon;
                  const isActive = filters.severity.includes(severity);
                  
                  return (
                    <button
                      key={severity}
                      onClick={() => toggleFilter('severity', severity)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? `${info.bg} ${info.color} border ${info.border}`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      )}
                    >
                      <Icon size={14} />
                      {info.label}
                      {isActive && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-white/50 rounded">
                          {severityCounts[severity] || 0}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entity Type Filters */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Entity Type</h3>
              <div className="flex flex-wrap gap-2">
                {entityTypes.slice(0, 6).map((type) => {
                  const isActive = filters.entityType.includes(type);
                  const count = auditLogs.filter(log => log.entityType === type).length;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter('entityType', type)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      )}
                    >
                      {type}
                      {isActive && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-white/50 rounded">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
                {entityTypes.length > 6 && (
                  <span className="text-xs text-slate-500 self-center ml-2">
                    +{entityTypes.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Date Range</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, from: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, to: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear date filters
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {(filters.severity.length > 0 || filters.entityType.length > 0 || filters.dateRange.from || filters.dateRange.to || filters.search) && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.severity.map(severity => (
                      <span key={severity} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {getSeverityInfo(severity as any).label}
                      </span>
                    ))}
                    {filters.entityType.map(type => (
                      <span key={type} className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                        {type}
                      </span>
                    ))}
                    {filters.search && (
                      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                        Search: "{filters.search}"
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Audit Log Entries</h2>
              <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{filteredLogs.length}</span> of{" "}
                <span className="font-bold text-slate-700">{auditLogs.length}</span> logs
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
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const info = getSeverityInfo(log.severity);
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
                      <div className="flex-shrink-0">
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
                              <span className="font-medium">{log.userName}</span> ({log.userRole}) • {log.entityType}: {log.entityName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                              info.bg,
                              info.color
                            )}>
                              {log.severity}
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
                            {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {log.userEmail}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                            {log.ipAddress}
                          </span>
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
                                    User Information
                                  </h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Name
                                      </p>
                                      <p className="text-sm font-medium">{log.userName}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Email
                                      </p>
                                      <p className="text-sm font-medium">{log.userEmail}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Role
                                      </p>
                                      <p className="text-sm font-medium">{log.userRole}</p>
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
                                        Action
                                      </p>
                                      <p className="text-sm font-mono bg-slate-100 px-3 py-2 rounded">
                                        {log.action}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        User Agent
                                      </p>
                                      <p className="text-sm text-slate-600 truncate" title={log.userAgent}>
                                        {log.userAgent}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Timestamp
                                      </p>
                                      <p className="text-sm font-medium">
                                        {format(parseISO(log.timestamp), 'PPpp')}
                                      </p>
                                    </div>
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
                <h3 className="text-lg font-bold text-slate-700 mb-2">No logs found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {filters.search || filters.severity.length > 0 || filters.entityType.length > 0
                    ? "No audit logs match your current filters. Try adjusting your search criteria."
                    : "No audit logs available. Start by generating some activity in the system."}
                </p>
                {(filters.search || filters.severity.length > 0 || filters.entityType.length > 0) && (
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
        </div>

        {/* Footer Status */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {apiError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle size={16} className="text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Demo Mode Active</p>
                    <p className="text-xs text-amber-600">Using generated data for demonstration</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Server size={14} />
                <span>System ID: MARITIME-AUDIT-001</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span>Security Level: HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}