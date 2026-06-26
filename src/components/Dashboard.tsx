import React from 'react';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Activity, 
  Plus, 
  Briefcase,
  UserX,
  FileSpreadsheet,
  FileUp,
  LogIn,
  LogOut,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { DashboardStats, RecentActivity } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigateToEmployees: () => void;
  onNavigateToCreate: () => void;
  onRefresh: () => void;
}

export default function Dashboard({ stats, loading, onNavigateToEmployees, onNavigateToCreate, onRefresh }: DashboardProps) {
  
  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Gathering analytics intelligence...</p>
      </div>
    );
  }

  const inactiveEmployees = stats.totalEmployees - stats.activeEmployees;
  
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4 text-emerald-600" />;
      case 'update':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'status_change':
        return <RefreshCw className="w-4 h-4 text-amber-600" />;
      case 'login':
        return <LogIn className="w-4 h-4 text-sky-600" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-slate-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActivityBg = (type: RecentActivity['type']) => {
    switch (type) {
      case 'create': return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30';
      case 'update': return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/30';
      case 'delete': return 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/30';
      case 'status_change': return 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30';
      case 'login': return 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/30';
      case 'logout': return 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/30';
      default: return 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/30';
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Find max department size to scale bars relatively
  const maxDeptCount = Math.max(...stats.departmentDistribution.map(d => d.count), 1);

  return (
    <div id="dashboard-tab" className="space-y-8 animate-fade-in">
      
      {/* Title Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time roster metrics and operations intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="dashboard-refresh-btn"
            onClick={onRefresh}
            className="p-2.5 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            id="dashboard-new-emp-btn"
            onClick={onNavigateToCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Roster KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Employees */}
        <div 
          onClick={onNavigateToEmployees}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
        >
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Employees</p>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalEmployees}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Active & inactive database</p>
        </div>

        {/* Active Employees */}
        <div 
          onClick={onNavigateToEmployees}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
        >
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Staff</p>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.activeEmployees}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            {stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}% of total strength
          </p>
        </div>

        {/* Inactive Employees */}
        <div 
          onClick={onNavigateToEmployees}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
        >
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inactive Staff</p>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{inactiveEmployees}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">On-leave or suspended</p>
        </div>

        {/* Active Departments */}
        <div 
          onClick={onNavigateToEmployees}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
        >
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Departments</p>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.departmentsCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Across active company teams</p>
        </div>

      </div>

      {/* Analytical Layout: Grid for Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Analytics Breakdown (Bento Style) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Department Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Headcount analysis across operating segments.
                </p>
              </div>
            </div>

            {/* Render a custom elegant pure HTML/CSS responsive bar chart */}
            <div className="space-y-4">
              {stats.departmentDistribution.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No department records found.</p>
              ) : (
                stats.departmentDistribution.map((dept, index) => {
                  const percentage = Math.round((dept.count / stats.totalEmployees) * 100) || 0;
                  const relativePercentage = Math.round((dept.count / maxDeptCount) * 100) || 0;
                  
                  // Palette rotation
                  const colors = [
                    'bg-indigo-600 dark:bg-indigo-500',
                    'bg-emerald-600 dark:bg-emerald-500',
                    'bg-sky-600 dark:bg-sky-500',
                    'bg-amber-600 dark:bg-amber-500',
                    'bg-rose-600 dark:bg-rose-500',
                    'bg-purple-600 dark:bg-purple-500'
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <div key={dept.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {dept.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 dark:text-slate-400">{dept.count} {dept.count === 1 ? 'person' : 'people'}</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-bold text-slate-600 dark:text-slate-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                          style={{ width: `${relativePercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Roster Health Status donut ring */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Roster Health Analysis
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Radial circle representation */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-emerald-500"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (stats.totalEmployees > 0 ? stats.activeEmployees / stats.totalEmployees : 0))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="block text-2xl font-black text-slate-800 dark:text-white">
                    {stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}%
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    Active Ratio
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="space-y-4 flex-1 max-w-xs">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Active Staff
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{stats.activeEmployees}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Currently engaged, present, and operational.</div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Inactive / On-Leave
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{inactiveEmployees}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Temporarily inactive, suspended, or archived.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities Log */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Recent Activity Logs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit trail of updates and admin operations.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[460px] pr-1">
              {stats.recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No recent operations logged.</p>
                </div>
              ) : (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="relative flex gap-4 items-start group">
                    
                    {/* Activity Badge Icon */}
                    <div className={`p-2 rounded-xl border flex-shrink-0 z-10 transition-transform group-hover:scale-105 duration-300 ${getActivityBg(act.type)}`}>
                      {getActivityIcon(act.type)}
                    </div>

                    {/* Timeline Line */}
                    <div className="absolute top-9 left-[19px] bottom-[-22px] w-[2px] bg-slate-100 dark:bg-slate-800 group-last:hidden" />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">{act.userEmail}</span>
                        <span>•</span>
                        <span>{getRelativeTime(act.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
