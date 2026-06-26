import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  ToggleLeft, 
  Upload, 
  Image as ImageIcon,
  X,
  FileImage,
  AlertCircle
} from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';

interface EmployeeFormProps {
  employee: Employee | null; // Null if creating, Employee if updating
  onSave: (employeeData: any) => Promise<void>;
  onCancel: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
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

export default function EmployeeForm({ employee, onSave, onCancel, addToast }: EmployeeFormProps) {
  const isEdit = !!employee;
  
  // Form States
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [profilePicture, setProfilePicture] = useState('');
  
  // UI States
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form if editing
  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employeeId || '');
      setFullName(employee.fullName || '');
      setEmail(employee.email || '');
      setPhoneNumber(employee.phoneNumber || '');
      setDepartment(employee.department || '');
      setPosition(employee.position || '');
      setSalary(employee.salary ? String(employee.salary) : '');
      setDateOfJoining(employee.dateOfJoining ? employee.dateOfJoining.substring(0, 10) : '');
      setStatus(employee.status || 'Active');
      setProfilePicture(employee.profilePicture || '');
    } else {
      // Set default date of joining to today's date in local time YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setDateOfJoining(today);
      setStatus('Active');
    }
  }, [employee]);

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!department) {
      newErrors.department = 'Please select a department';
    }

    if (!position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!salary) {
      newErrors.salary = 'Salary is required';
    } else {
      const numSalary = Number(salary);
      if (isNaN(numSalary) || numSalary <= 0) {
        newErrors.salary = 'Please enter a valid salary above 0';
      }
    }

    if (!dateOfJoining) {
      newErrors.dateOfJoining = 'Date of joining is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert File to Base64 String
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    // Limit size to 2.5MB to keep base64 storage optimized
    if (file.size > 2.5 * 1024 * 1024) {
      addToast('Image is too large. Please upload an image under 2.5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePicture(reader.result);
        addToast('Profile photo attached successfully.', 'success');
      }
    };
    reader.onerror = () => {
      addToast('Failed to process image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const removeProfilePicture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfilePicture('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Profile photo removed.', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        employeeId: employeeId.trim() || undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        department,
        position: position.trim(),
        salary: Number(salary),
        dateOfJoining,
        status,
        profilePicture
      };

      await onSave(payload);
    } catch (err: any) {
      addToast(err.message || 'Error occurred while saving employee record.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="employee-form-tab" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Back Button and Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          id="form-back-btn"
          onClick={onCancel}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEdit ? 'Modify Employee Profile' : 'Register New Employee'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEdit ? `Update records for ${employee.fullName}` : 'Register a new profile to the staff portal directory'}
          </p>
        </div>
      </div>

      <form id="employee-profile-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Picture Upload Zone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Profile Picture
          </label>
          
          <div
            id="drag-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' 
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
            }`}
          >
            <input
              id="profile-picture-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {profilePicture ? (
              <div className="relative group">
                <img
                  src={profilePicture}
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-850"
                  referrerPolicy="no-referrer"
                />
                <button
                  id="remove-photo-btn"
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-transform scale-95 group-hover:scale-100 cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg shadow-xs mb-3">
                  <Upload className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Drag & Drop profile image here, or <span className="text-indigo-600 dark:text-indigo-400">browse file</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Supports PNG, JPG, or WEBP up to 2.5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Employee ID */}
          <div>
            <label htmlFor="form-emp-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Employee ID <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-sm font-bold text-slate-400">ID</span>
              </div>
              <input
                id="form-emp-id"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-101 (Leave empty to auto-generate)"
                disabled={isEdit}
                className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 focus:ring-indigo-500 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm disabled:opacity-60"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Custom format or auto-numbered string.</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="form-full-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="form-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={`block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border ${
                  errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.fullName}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="form-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="form-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@company.com"
                className={`block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="form-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="form-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 focus:ring-indigo-500 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="form-dept" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <select
                id="form-dept"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border ${
                  errors.department ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                } rounded-lg text-slate-900 dark:text-white placeholder-slate-450 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            {errors.department && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.department}</p>}
          </div>

          {/* Position / Title */}
          <div>
            <label htmlFor="form-pos" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Job Position <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="form-pos"
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Senior Product Designer"
                className={`block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border ${
                  errors.position ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
              />
            </div>
            {errors.position && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.position}</p>}
          </div>

          {/* Salary */}
          <div>
            <label htmlFor="form-salary" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Annual Salary ($) <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="form-salary"
                type="number"
                required
                min="1"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="95000"
                className={`block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border ${
                  errors.salary ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
              />
            </div>
            {errors.salary && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.salary}</p>}
          </div>

          {/* Date of Joining */}
          <div>
            <label htmlFor="form-joining-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date of Joining <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="form-joining-date"
                type="date"
                required
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border ${
                  errors.dateOfJoining ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
              />
            </div>
            {errors.dateOfJoining && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.dateOfJoining}</p>}
          </div>

          {/* Status Select */}
          <div>
            <label htmlFor="form-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Roster Status <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ToggleLeft className="h-4 w-4 text-slate-400" />
              </div>
              <select
                id="form-status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 focus:ring-indigo-500 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

        </div>

        {/* Actions Button Panel */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800/60">
          <button
            id="form-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="form-save-btn"
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm px-5 py-2 rounded-lg hover:shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isEdit ? (
              'Save Profile Changes'
            ) : (
              'Register Employee'
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
