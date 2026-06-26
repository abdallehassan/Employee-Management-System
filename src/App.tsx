import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  LogOut, 
  User, 
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Employee, User as UserType, DashboardStats, RecentActivity } from './types';
import Toast, { ToastType } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import EmployeeDetail from './components/EmployeeDetail';

type ActiveTab = 'dashboard' | 'employees' | 'create_employee' | 'employee_detail';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export default function App() {
  // Session Authentication
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ems_token'));
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('ems_user');
    return saved ? JSON.parse(saved) : null;
  });

  // UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Notifications (Toasts)
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Deletion Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);

  // Sync Dark Mode state to root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Add notification toast
  const addToast = (message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch dashboard stats');
      setStats(data);
    } catch (error: any) {
      addToast(error.message || 'Error syncronizing dashboard analytics', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  // Trigger stats refresh on auth success or manual trigger
  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Auth Action Handlers
  const handleLoginSuccess = (newToken: string, newUser: UserType) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem('ems_token', newToken);
    localStorage.setItem('ems_user', JSON.stringify(newUser));
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.warn('Silent log out request failed', e);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setStats(null);
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
      setActiveTab('dashboard');
      addToast('Logged out of session. Have a great day!', 'info');
    }
  };

  // Employee Operations
  const handleSaveEmployee = async (employeeData: any) => {
    if (!token) return;
    try {
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.id}`
        : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save employee data');
      }

      addToast(
        editingEmployee 
          ? `Successfully updated profile of ${data.fullName}!` 
          : `Successfully registered new employee ${data.fullName}!`, 
        'success'
      );
      
      // Reset edit modes and return to list
      setEditingEmployee(null);
      setSelectedEmployee(null);
      fetchDashboardStats(); // Refresh dashboard counts
      setActiveTab('employees');
    } catch (error: any) {
      addToast(error.message || 'Failed to save employee profile', 'error');
      throw error;
    }
  };

  const handleToggleEmployeeStatus = async (id: string, currentStatus: Employee['status']) => {
    if (!token) return;
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle status');

      addToast(`Status of ${data.fullName} changed to ${newStatus}.`, 'success');
      
      // Update local states
      if (selectedEmployee && selectedEmployee.id === id) {
        setSelectedEmployee(data);
      }
      fetchDashboardStats();
    } catch (error: any) {
      addToast(error.message || 'Failed to update employee status', 'error');
    }
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setEmployeeToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (softDelete: boolean) => {
    if (!token || !employeeToDelete) return;
    try {
      const response = await fetch(`/api/employees/${employeeToDelete.id}?soft=${softDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete employee profile');

      addToast(`Employee profile for ${employeeToDelete.name} deleted successfully!`, 'success');
      
      // Cleanup visual detail views if we were inspecting it
      if (selectedEmployee && selectedEmployee.id === employeeToDelete.id) {
        setSelectedEmployee(null);
        setActiveTab('employees');
      }
      
      fetchDashboardStats();
    } catch (error: any) {
      addToast(error.message || 'Deletion failed', 'error');
    } finally {
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Navigations
  const handleEditTrigger = (emp: Employee) => {
    setEditingEmployee(emp);
    setActiveTab('create_employee');
  };

  const handleCreateTrigger = () => {
    setEditingEmployee(null);
    setActiveTab('create_employee');
  };

  const handleInspectDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setActiveTab('employee_detail');
  };

  // Render Page Content conditionally
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            loading={statsLoading} 
            onNavigateToEmployees={() => setActiveTab('employees')}
            onNavigateToCreate={handleCreateTrigger}
            onRefresh={fetchDashboardStats}
          />
        );
      case 'employees':
        return (
          <EmployeeList 
            onViewDetails={handleInspectDetails}
            onEdit={handleEditTrigger}
            onDelete={handleDeleteTrigger}
            addToast={addToast}
            authToken={token!}
          />
        );
      case 'create_employee':
        return (
          <EmployeeForm 
            employee={editingEmployee}
            onSave={handleSaveEmployee}
            onCancel={() => {
              setEditingEmployee(null);
              setActiveTab(selectedEmployee ? 'employee_detail' : 'employees');
            }}
            addToast={addToast}
          />
        );
      case 'employee_detail':
        return selectedEmployee ? (
          <EmployeeDetail 
            employee={selectedEmployee}
            onBack={() => {
              setSelectedEmployee(null);
              setActiveTab('employees');
            }}
            onEdit={handleEditTrigger}
            onDelete={handleDeleteTrigger}
            onToggleStatus={handleToggleEmployeeStatus}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No employee record selected.</p>
            <button onClick={() => setActiveTab('employees')} className="mt-4 text-indigo-600 font-bold hover:underline">
              Go back to Directory
            </button>
          </div>
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  // If unauthorized, render the login view
  if (!token) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Login onLoginSuccess={handleLoginSuccess} addToast={addToast} />
        {/* Floating notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans`}>
      
      {/* Top Application Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                StaffPortal
              </span>
            </div>

            {/* Desktop Center Navigation links */}
            <nav id="desktop-nav-links" className="hidden md:flex space-x-1 bg-slate-100 dark:bg-slate-950/40 p-1 rounded-lg border border-slate-200 dark:border-slate-850">
              <button
                id="tab-btn-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                id="tab-btn-employees"
                onClick={() => { setSelectedEmployee(null); setActiveTab('employees'); }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'employees' || activeTab === 'employee_detail'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Employees
              </button>
            </nav>

            {/* Actions: Theme Toggle, User Profile & Log out */}
            <div className="flex items-center gap-4">
              
              {/* Dark/Light mode switch */}
              <button
                id="theme-toggler"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User info panel & Log out */}
              <div id="header-user-panel" className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white leading-none">
                    {currentUser?.fullName}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-1">
                    {currentUser?.email}
                  </span>
                </div>

                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                  title="Sign out of system"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation bar */}
      <div id="mobile-nav-panel" className="md:hidden flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 p-2 gap-2">
        <button
          id="mobile-tab-btn-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          id="mobile-tab-btn-employees"
          onClick={() => { setSelectedEmployee(null); setActiveTab('employees'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'employees' || activeTab === 'employee_detail'
              ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          Employees
        </button>
      </div>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Navigation Breadcrumbs (highly helpful for sub views detail & form) */}
        {(activeTab === 'create_employee' || activeTab === 'employee_detail') && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 mb-6 max-w-4xl mx-auto px-1">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => setActiveTab('dashboard')}>Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => setActiveTab('employees')}>Employees</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold">
              {activeTab === 'create_employee' ? (editingEmployee ? 'Edit' : 'Add Employee') : 'Employee Dossier'}
            </span>
          </div>
        )}

        {/* Content Inject block */}
        {renderContent()}

      </main>

      {/* Portal Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 StaffPortal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Security</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* Global Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setEmployeeToDelete(null); }}
        onConfirm={handleConfirmDelete}
        employeeName={employeeToDelete?.name || ''}
      />

      {/* Floating toast notifications array */}
      <div id="global-notifications-layer">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

    </div>
  );
}
