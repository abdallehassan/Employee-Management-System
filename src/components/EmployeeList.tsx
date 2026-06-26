import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  Download, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Building2, 
  UserCheck2,
  FileSpreadsheet,
  FileText,
  Building,
  RefreshCw,
  X
} from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface EmployeeListProps {
  onViewDetails: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string, name: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  authToken: string;
}

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Legal'
];

export default function EmployeeList({ onViewDetails, onEdit, onDelete, addToast, authToken }: EmployeeListProps) {
  // Query States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('employeeId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Fetch employees on changes
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        department,
        status,
        sortBy,
        sortOrder,
        page: String(page),
        limit: String(limit)
      });

      const response = await fetch(`/api/employees?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to load employees');

      setEmployees(data.employees || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      addToast(error.message || 'Error loading employee directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page to 1 when filters or search change to avoid empty screens
    setPage(1);
  }, [search, department, status]);

  useEffect(() => {
    fetchEmployees();
  }, [page, limit, search, department, status, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDepartment('');
    setStatus('');
    setSortBy('employeeId');
    setSortOrder('asc');
    setPage(1);
    addToast('Filters reset successfully.', 'info');
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      // Fetch ALL employees for export, ignoring current pagination limits
      const queryParams = new URLSearchParams({
        search,
        department,
        status,
        sortBy,
        sortOrder,
        page: '1',
        limit: '1000' // High limit to fetch all filtered rows
      });

      const response = await fetch(`/api/employees?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      const allEmps: Employee[] = data.employees || [];

      if (allEmps.length === 0) {
        addToast('No records available to export.', 'error');
        return;
      }

      // Format data for spreadsheet
      const sheetData = allEmps.map(emp => ({
        'Employee ID': emp.employeeId,
        'Full Name': emp.fullName,
        'Email Address': emp.email,
        'Phone Number': emp.phoneNumber || 'N/A',
        'Department': emp.department,
        'Job Position': emp.position,
        'Annual Salary ($)': emp.salary,
        'Joining Date': new Date(emp.dateOfJoining).toLocaleDateString(),
        'Status': emp.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');

      // Autofit columns logic
      const maxLens = Object.keys(sheetData[0]).map(key => {
        let maxLen = key.length;
        sheetData.forEach((row: any) => {
          const valStr = String(row[key] || '');
          if (valStr.length > maxLen) maxLen = valStr.length;
        });
        return { wch: maxLen + 3 };
      });
      worksheet['!cols'] = maxLens;

      XLSX.writeFile(workbook, 'Employee_Roster_Export.xlsx');
      addToast('Spreadsheet downloaded successfully!', 'success');
      setExportDropdownOpen(false);
    } catch (err) {
      addToast('Excel export failed.', 'error');
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const queryParams = new URLSearchParams({
        search,
        department,
        status,
        sortBy,
        sortOrder,
        page: '1',
        limit: '1000'
      });

      const response = await fetch(`/api/employees?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      const allEmps: Employee[] = data.employees || [];

      if (allEmps.length === 0) {
        addToast('No records available to export.', 'error');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Title & Branding Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('CORPORATE STAFF ROSTER', 14, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Exported On: ${new Date().toLocaleString()} | Filtered Count: ${allEmps.length} Employees`, 14, 24);

      // Simple Table Draw
      let startY = 32;
      const colWidths = { id: 25, name: 50, email: 55, dept: 40, pos: 50, date: 30, status: 20 };
      const tableHeaders = ['ID', 'Full Name', 'Email Address', 'Department', 'Position', 'Join Date', 'Status'];

      // Header Fill Colors
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(14, startY, 270, 8, 'F');

      // Header Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      
      let curX = 16;
      doc.text('ID', curX, startY + 5.5); curX += colWidths.id;
      doc.text('Full Name', curX, startY + 5.5); curX += colWidths.name;
      doc.text('Email Address', curX, startY + 5.5); curX += colWidths.email;
      doc.text('Department', curX, startY + 5.5); curX += colWidths.dept;
      doc.text('Position', curX, startY + 5.5); curX += colWidths.pos;
      doc.text('Join Date', curX, startY + 5.5); curX += colWidths.date;
      doc.text('Status', curX, startY + 5.5);

      startY += 8;
      
      // Rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      allEmps.forEach((emp, index) => {
        // Auto page break
        if (startY > 185) {
          doc.addPage();
          startY = 20;

          // Redraw Header
          doc.setFillColor(79, 70, 229);
          doc.rect(14, startY, 270, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          
          let headX = 16;
          doc.text('ID', headX, startY + 5.5); headX += colWidths.id;
          doc.text('Full Name', headX, startY + 5.5); headX += colWidths.name;
          doc.text('Email Address', headX, startY + 5.5); headX += colWidths.email;
          doc.text('Department', headX, startY + 5.5); headX += colWidths.dept;
          doc.text('Position', headX, startY + 5.5); headX += colWidths.pos;
          doc.text('Join Date', headX, startY + 5.5); headX += colWidths.date;
          doc.text('Status', headX, startY + 5.5);

          startY += 8;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        // Alternating background colors
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, startY, 270, 7.5, 'F');
        }

        let rX = 16;
        doc.text(emp.employeeId || 'N/A', rX, startY + 5); rX += colWidths.id;
        doc.text(emp.fullName || 'N/A', rX, startY + 5); rX += colWidths.name;
        doc.text(emp.email || 'N/A', rX, startY + 5); rX += colWidths.email;
        doc.text(emp.department || 'N/A', rX, startY + 5); rX += colWidths.dept;
        doc.text(emp.position || 'N/A', rX, startY + 5); rX += colWidths.pos;
        doc.text(new Date(emp.dateOfJoining).toLocaleDateString(), rX, startY + 5); rX += colWidths.date;
        doc.text(emp.status || 'Active', rX, startY + 5);

        // Thin divider line
        doc.setDrawColor(241, 245, 249);
        doc.line(14, startY + 7.5, 284, startY + 7.5);

        startY += 7.5;
      });

      doc.save('Employee_Roster_Export.pdf');
      addToast('PDF dossier generated successfully!', 'success');
      setExportDropdownOpen(false);
    } catch (err) {
      addToast('PDF export failed.', 'error');
    }
  };

  return (
    <div id="employee-list-tab" className="space-y-6 animate-fade-in">
      
      {/* Title Header with Export Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Staff Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Search, sort, filter, and export corporate roster records.
          </p>
        </div>

        {/* Export Dropdown Wrapper */}
        <div className="relative">
          <button
            id="export-options-btn"
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Records
          </button>
          
          {exportDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-15" 
                onClick={() => setExportDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-2 z-20 animate-scale-in">
                <button
                  id="export-excel-btn"
                  onClick={exportToExcel}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-500" />
                  Export to Excel (.xlsx)
                </button>
                <button
                  id="export-pdf-btn"
                  onClick={exportToPDF}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer font-medium"
                >
                  <FileText className="w-4.5 h-4.5 text-rose-500" />
                  Export to PDF (.pdf)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Toggle Filters Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="roster-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, email, or position..."
            className="block w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-indigo-500 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-900/40 transition-all text-sm shadow-xs"
          />
          {search && (
            <button
              id="clear-search-btn"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Clear Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all cursor-pointer ${
              showFilters || department || status
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-700 dark:text-indigo-400 font-semibold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {(department || status) ? '(Active)' : ''}
          </button>

          {(search || department || status || sortBy !== 'employeeId' || sortOrder !== 'asc') && (
            <button
              id="clear-filters-btn"
              onClick={handleClearFilters}
              className="px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter drawer */}
      {(showFilters || department || status) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800/60 animate-slide-down">
          {/* Dept Filter */}
          <div>
            <label htmlFor="filter-dept" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Filter by Department
            </label>
            <select
              id="filter-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="filter-status" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Filter by Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {/* Roster Data Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table id="roster-table" className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/80 text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-6">Staff Profile</th>
                <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('employeeId')}>
                  <div className="flex items-center gap-1.5">
                    Employee ID
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-1.5">
                    Department
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('position')}>
                  <div className="flex items-center gap-1.5">
                    Job Title
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors hidden md:table-cell" onClick={() => handleSort('dateOfJoining')}>
                  <div className="flex items-center gap-1.5">
                    Joining Date
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th scope="col" className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Searching records...
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                    No matching employee records found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                    
                    {/* Picture & Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {emp.profilePicture ? (
                          <img
                            src={emp.profilePicture}
                            alt={emp.fullName}
                            className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-100 dark:border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-500">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {emp.fullName}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal break-all max-w-[180px]">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Employee Code */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                        {emp.employeeId}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 font-semibold text-xs text-slate-800 dark:text-slate-300">
                      {emp.department}
                    </td>

                    {/* Position */}
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {emp.position}
                    </td>

                    {/* Date Of Joining */}
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                      {new Date(emp.dateOfJoining).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {emp.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`view-btn-${emp.id}`}
                          onClick={() => onViewDetails(emp)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all cursor-pointer"
                          title="View Profile Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-btn-${emp.id}`}
                          onClick={() => onEdit(emp)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-btn-${emp.id}`}
                          onClick={() => onDelete(emp.id, emp.fullName)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginator Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-150 dark:border-slate-800/80">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{total}</span> employees
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* Limit selector */}
              <select
                id="limit-selector"
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="py-1 px-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs rounded-lg focus:outline-hidden mr-2 cursor-pointer font-medium"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>

              <button
                id="prev-page-btn"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                Page {page} of {totalPages}
              </div>

              <button
                id="next-page-btn"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
