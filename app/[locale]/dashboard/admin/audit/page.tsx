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
} from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  entityType: string;
  entityId: string;
  entityName: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "success";
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

export default function SystemAuditPage() {
  const t = useTranslations("Audit");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
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
    try {
      // In a real app, you'd have a dedicated audit endpoint
      // For now, we'll simulate with tasks data or create a mock
      const tasksRes = await api.get("/tasks");
      const yachtsRes = await api.get("/yachts");
      
      // Transform data into audit log format
      const tasks = tasksRes.data || [];
      const yachts = yachtsRes.data || [];
      
      // Generate audit logs from tasks
      const taskAudits = tasks.map((task: any) => ({
        id: `task-${task.id}`,
        action: task.status === 'Done' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
        description: `Task "${task.title}" was ${task.status === 'Done' ? 'completed' : 'updated'}`,
        userId: task.assigned_to || 'system',
        userName: task.assigned_to ? `Operator ${task.assigned_to}` : 'Auto-System',
        userEmail: task.assigned_to ? `operator${task.assigned_to}@maritime.com` : 'system@auto',
        entityType: 'TASK',
        entityId: task.id,
        entityName: task.title,
        oldData: {},
        newData: { status: task.status },
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (System Monitor)',
        timestamp: task.updated_at,
        severity: task.status === 'Done' ? 'success' : 
                 task.priority === 'HIGH' ? 'warning' : 'info'
      }));

      // Generate audit logs from yacht actions
      const yachtAudits = yachts.slice(0, 10).map((yacht: any) => ({
        id: `yacht-${yacht.id}`,
        action: yacht.status === 'Sold' ? 'YACHT_SOLD' : 'YACHT_UPDATED',
        description: `Yacht "${yacht.name}" ${yacht.status === 'Sold' ? 'was sold' : 'status updated to ' + yacht.status}`,
        userId: 'admin-1',
        userName: 'Fleet Manager',
        userEmail: 'fleet@maritime.com',
        entityType: 'YACHT',
        entityId: yacht.id,
        entityName: yacht.name,
        oldData: {},
        newData: { status: yacht.status, price: yacht.price },
        ipAddress: '10.0.0.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Fleet Dashboard)',
        timestamp: yacht.updated_at,
        severity: yacht.status === 'Sold' ? 'success' : 
                 yacht.status === 'For Bid' ? 'warning' : 'info'
      }));

      // Mock additional system audit logs
      const systemAudits: AuditLog[] = [
        {
          id: 'sys-1',
          action: 'USER_LOGIN',
          description: 'User authentication successful',
          userId: 'admin-1',
          userName: 'Admin User',
          userEmail: 'admin@maritime.com',
          entityType: 'AUTH',
          entityId: 'auth-001',
          entityName: 'User Session',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          severity: 'success'
        },
        {
          id: 'sys-2',
          action: 'DATA_EXPORT',
          description: 'Fleet data exported to CSV',
          userId: 'analyst-1',
          userName: 'Data Analyst',
          userEmail: 'analyst@maritime.com',
          entityType: 'EXPORT',
          entityId: 'export-2024-01',
          entityName: 'Fleet Report',
          ipAddress: '10.0.1.50',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          severity: 'info'
        },
        {
          id: 'sys-3',
          action: 'SECURITY_ALERT',
          description: 'Multiple failed login attempts detected',
          userId: 'system',
          userName: 'Security System',
          userEmail: 'security@maritime.com',
          entityType: 'SECURITY',
          entityId: 'sec-001',
          entityName: 'Login System',
          ipAddress: '192.168.1.250',
          userAgent: 'Security Monitor v2.1',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          severity: 'warning'
        },
      ];

      const allLogs = [...taskAudits, ...yachtAudits, ...systemAudits];
      
      // Sort by timestamp (newest first)
      allLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAuditLogs(allLogs);
      setFilteredLogs(allLogs);
    } catch (error) {
      console.error("Audit log fetch error:", error);
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
      result = result.filter(log => filters.entityType.includes(log.entityType));
    }

    // Apply date range filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      result = result.filter(log => new Date(log.timestamp) >= fromDate);
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      result = result.filter(log => new Date(log.timestamp) <= toDate);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(log =>
        log.description.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.entityName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(result);
  }, [filters, auditLogs]);

  // Fetch on mount and set up refresh interval
  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(() => fetchAuditLogs(), 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchAuditLogs]);

  // Get severity icon and color
  const getSeverityInfo = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'success':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Success' };
      case 'warning':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Warning' };
      case 'error':
        return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Error' };
      default:
        return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Info' };
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
      ['Timestamp', 'Severity', 'Action', 'Description', 'User', 'Entity', 'IP Address'],
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.severity.toUpperCase(),
        log.action,
        log.description,
        log.userName,
        log.entityName,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 hover:border-blue-300"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => fetchAuditLogs()}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={cn(isRefreshing && "animate-spin")}
            />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic flex items-center gap-2">
            <Filter size={14} />
            Filter Logs
          </h2>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Severity Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Severity Level</h3>
            <div className="flex flex-wrap gap-2">
              {['info', 'success', 'warning', 'error'].map((sev) => {
                const info = getSeverityInfo(sev as AuditLog['severity']);
                const Icon = info.icon;
                return (
                  <button
                    key={sev}
                    onClick={() => toggleFilter('severity', sev)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-bold transition-all",
                      filters.severity.includes(sev)
                        ? `${info.bg} ${info.color} border ${info.color.replace('text', 'border')}`
                        : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Icon size={12} />
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entity Type Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Entity Type</h3>
            <div className="flex flex-wrap gap-2">
              {['TASK', 'YACHT', 'AUTH', 'SECURITY', 'EXPORT'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter('entityType', type)}
                  className={cn(
                    "px-3 py-2 text-xs uppercase tracking-wider font-bold transition-all",
                    filters.entityType.includes(type)
                      ? "bg-blue-50 text-blue-600 border border-blue-300"
                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Date Range</h3>
            <div className="flex gap-3">
              <input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: e.target.value }
                }))}
                className="px-3 py-2 text-xs border border-slate-200 focus:border-blue-300 focus:outline-none flex-1"
              />
              <input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: e.target.value }
                }))}
                className="px-3 py-2 text-xs border border-slate-200 focus:border-blue-300 focus:outline-none flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Total Logs</p>
          <p className="text-2xl font-serif text-[#003566]">{filteredLogs.length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Active Today</p>
          <p className="text-2xl font-serif text-emerald-600">
            {filteredLogs.filter(log => 
              new Date(log.timestamp).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Unique Users</p>
          <p className="text-2xl font-serif text-blue-600">
            {new Set(filteredLogs.map(log => log.userId)).size}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Last Updated</p>
          <p className="text-2xl font-serif text-amber-600">
            {filteredLogs.length > 0 ? formatDistanceToNow(new Date(filteredLogs[0].timestamp), { addSuffix: true }) : 'Never'}
          </p>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic">
            Activity Timeline
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
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
                >
                  <div className="flex gap-4">
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
                        <p className="text-sm text-slate-800 font-medium">
                          {log.description}
                        </p>
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-slate-200 text-slate-500 font-bold">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {log.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity size={12} />
                          {log.entityType}: {log.entityName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          <span className="text-slate-300">•</span>
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px]">
                          {log.ipAddress}
                        </span>
                      </div>

                      {/* Details on hover */}
                      <div className="mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-4 text-xs">
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">
                              User Details
                            </p>
                            <p className="text-slate-600">{log.userEmail}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">
                              User Agent
                            </p>
                            <p className="text-slate-600 truncate" title={log.userAgent}>
                              {log.userAgent}
                            </p>
                          </div>
                        </div>
                      </div>
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
              <p className="text-sm text-slate-400 mb-1">No audit logs found</p>
              <p className="text-xs text-slate-300">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <p className="flex items-center gap-2">
          <ShieldCheck size={12} />
          System audit trail maintained for compliance and security monitoring
        </p>
        <p className="uppercase tracking-wider font-bold">
          Last refresh: {formatDistanceToNow(new Date(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}