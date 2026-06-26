import React from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  Clock, 
  Activity,
  UserCheck2,
  UserMinus2
} from 'lucide-react';
import { Employee } from '../types';

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (id: string, currentStatus: Employee['status']) => void;
}

export default function EmployeeDetail({ employee, onBack, onEdit, onDelete, onToggleStatus }: EmployeeDetailProps) {
  
  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(employee.salary || 0);

  const formattedJoinDate = new Date(employee.dateOfJoining).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div id="employee-detail-tab" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <button
            id="detail-back-btn"
            onClick={onBack}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Employee Dossier
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ref: {employee.employeeId}
            </p>
          </div>
        </div>

        {/* Operational buttons */}
        <div className="flex items-center gap-2">
          {/* Status Quick toggle */}
          <button
            id="detail-status-toggle"
            onClick={() => onToggleStatus(employee.id, employee.status)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              employee.status === 'Active'
                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 hover:bg-amber-100'
                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100'
            }`}
          >
            {employee.status === 'Active' ? (
              <>
                <UserMinus2 className="w-3.5 h-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck2 className="w-3.5 h-3.5" />
                Activate
              </>
            )}
          </button>

          {/* Edit */}
          <button
            id="detail-edit-btn"
            onClick={() => onEdit(employee)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/65 transition-all cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>

          {/* Delete */}
          <button
            id="detail-delete-btn"
            onClick={() => onDelete(employee.id, employee.fullName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/40 border border-rose-150 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/65 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Profile Details Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Card / Avatar Column */}
        <div className="md:col-span-4 flex flex-col items-center text-center p-6 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/60 h-fit">
          <div className="relative">
            {employee.profilePicture ? (
              <img
                src={employee.profilePicture}
                alt={employee.fullName}
                className="w-32 h-32 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-500 shadow-inner">
                <User className="w-14 h-14" />
              </div>
            )}
            
            {/* Float Status pill */}
            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-xs border ${
              employee.status === 'Active'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-slate-400 text-white border-slate-300'
            }`}>
              {employee.status}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-5">
            {employee.fullName}
          </h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {employee.position}
          </p>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-950/35 px-2.5 py-1 rounded-md">
            {employee.department}
          </p>
        </div>

        {/* Detailed Information Column */}
        <div className="md:col-span-8 space-y-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800/50">
            Professional & Contact Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Employee ID */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Employee Code
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {employee.employeeId}
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Corporate Email
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 break-all">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${employee.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">{employee.email}</a>
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Contact Phone
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {employee.phoneNumber || 'N/A'}
              </p>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Division / Department
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {employee.department}
              </p>
            </div>

            {/* Position */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Current Position
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {employee.position}
              </p>
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Annual Compensation
              </span>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formattedSalary} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ Year</span>
              </p>
            </div>

            {/* Date of Joining */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Roster Engagement Date
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formattedJoinDate}
              </p>
            </div>

          </div>

          {/* Audit Trail Metadata */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 mt-8 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Roster Registration Audit Metadata
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Created On: {new Date(employee.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Modified: {new Date(employee.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
