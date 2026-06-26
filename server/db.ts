import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Employee, RecentActivity, User, DashboardStats } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Schema {
  users: UserWithPassword[];
  employees: Employee[];
  activities: RecentActivity[];
}

interface UserWithPassword extends User {
  passwordHash: string;
}

// Initial seed data
const DEFAULT_ADMIN_EMAIL = 'admin@company.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP-001',
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@company.com',
    phoneNumber: '+1 (555) 019-2834',
    department: 'Engineering',
    position: 'Lead Frontend Engineer',
    salary: 115000,
    dateOfJoining: '2023-03-15',
    status: 'Active',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2023-03-15T09:00:00Z').toISOString(),
    updatedAt: new Date('2023-03-15T09:00:00Z').toISOString()
  },
  {
    id: 'emp-2',
    employeeId: 'EMP-002',
    fullName: 'Michael Chen',
    email: 'm.chen@company.com',
    phoneNumber: '+1 (555) 014-9921',
    department: 'Engineering',
    position: 'Senior Backend Engineer',
    salary: 125000,
    dateOfJoining: '2022-11-01',
    status: 'Active',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2022-11-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2022-11-01T10:00:00Z').toISOString()
  },
  {
    id: 'emp-3',
    employeeId: 'EMP-003',
    fullName: 'Elena Rostova',
    email: 'elena.r@company.com',
    phoneNumber: '+1 (555) 017-3849',
    department: 'Design',
    position: 'Product Designer',
    salary: 95000,
    dateOfJoining: '2024-01-10',
    status: 'Active',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2024-01-10T08:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-10T08:30:00Z').toISOString()
  },
  {
    id: 'emp-4',
    employeeId: 'EMP-004',
    fullName: 'Marcus Thompson',
    email: 'marcus.t@company.com',
    phoneNumber: '+1 (555) 012-7743',
    department: 'Marketing',
    position: 'Growth Marketing Manager',
    salary: 88000,
    dateOfJoining: '2023-06-20',
    status: 'Active',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2023-06-20T09:15:00Z').toISOString(),
    updatedAt: new Date('2023-06-20T09:15:00Z').toISOString()
  },
  {
    id: 'emp-5',
    employeeId: 'EMP-005',
    fullName: 'Amanda Vance',
    email: 'amanda.v@company.com',
    phoneNumber: '+1 (555) 015-8822',
    department: 'HR',
    position: 'HR Director',
    salary: 105000,
    dateOfJoining: '2021-04-05',
    status: 'Active',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2021-04-05T09:00:00Z').toISOString(),
    updatedAt: new Date('2021-04-05T09:00:00Z').toISOString()
  },
  {
    id: 'emp-6',
    employeeId: 'EMP-006',
    fullName: 'David Kojo',
    email: 'd.kojo@company.com',
    phoneNumber: '+1 (555) 018-4411',
    department: 'Sales',
    position: 'Account Executive',
    salary: 78000,
    dateOfJoining: '2024-02-15',
    status: 'Active',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2024-02-15T11:00:00Z').toISOString(),
    updatedAt: new Date('2024-02-15T11:00:00Z').toISOString()
  },
  {
    id: 'emp-7',
    employeeId: 'EMP-007',
    fullName: 'Sophia Martinez',
    email: 's.martinez@company.com',
    phoneNumber: '+1 (555) 011-3399',
    department: 'Finance',
    position: 'Senior Financial Analyst',
    salary: 110000,
    dateOfJoining: '2023-09-01',
    status: 'Inactive',
    profilePicture: '',
    isDeleted: false,
    createdAt: new Date('2023-09-01T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-05-30T17:00:00Z').toISOString()
  }
];

const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act-1',
    userId: 'admin-1',
    userEmail: 'admin@company.com',
    type: 'create',
    description: 'System seeded 7 initial employee profiles.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
  },
  {
    id: 'act-2',
    userId: 'admin-1',
    userEmail: 'admin@company.com',
    type: 'login',
    description: 'Admin user logged into the system.',
    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  }
];

function initDb(): Schema {
  const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  const defaultAdmin: UserWithPassword = {
    id: 'admin-1',
    email: DEFAULT_ADMIN_EMAIL,
    fullName: 'System Administrator',
    passwordHash: hash
  };

  const initialData: Schema = {
    users: [defaultAdmin],
    employees: INITIAL_EMPLOYEES,
    activities: INITIAL_ACTIVITIES
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

export function loadDb(): Schema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initDb();
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading database, re-initializing...', error);
    return initDb();
  }
}

export function saveDb(data: Schema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// DB Operations
export const db = {
  // Users
  getUsers: (): UserWithPassword[] => loadDb().users,
  
  createUser: (user: Omit<User, 'id'>, passwordHash: string): User => {
    const data = loadDb();
    const newUser: UserWithPassword = {
      id: `user-${Date.now()}`,
      ...user,
      passwordHash
    };
    data.users.push(newUser);
    saveDb(data);
    
    // Return sanitized User
    const { passwordHash: _, ...sanitized } = newUser;
    return sanitized;
  },

  findUserByEmail: (email: string): UserWithPassword | undefined => {
    return loadDb().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Employees
  getEmployees: (includeDeleted = false): Employee[] => {
    const data = loadDb();
    return data.employees.filter(emp => includeDeleted || !emp.isDeleted);
  },

  getEmployeeById: (id: string): Employee | undefined => {
    const emps = db.getEmployees();
    return emps.find(e => e.id === id);
  },

  createEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>, adminUser: User): Employee => {
    const data = loadDb();
    
    // Verify custom employee ID is unique
    let empId = emp.employeeId;
    if (!empId) {
      const activeEmpsCount = data.employees.length;
      empId = `EMP-${String(activeEmpsCount + 1).padStart(3, '0')}`;
    } else {
      const exists = data.employees.some(e => e.employeeId.toLowerCase() === empId.toLowerCase() && !e.isDeleted);
      if (exists) {
        throw new Error(`Employee ID ${empId} already exists.`);
      }
    }

    // Verify email is unique
    const emailExists = data.employees.some(e => e.email.toLowerCase() === emp.email.toLowerCase() && !e.isDeleted);
    if (emailExists) {
      throw new Error(`Employee with email ${emp.email} already exists.`);
    }

    const newEmp: Employee = {
      ...emp,
      employeeId: empId,
      id: `emp-${Date.now()}`,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.employees.push(newEmp);
    
    // Log Activity
    const newAct: RecentActivity = {
      id: `act-${Date.now()}`,
      userId: adminUser.id,
      userEmail: adminUser.email,
      type: 'create',
      description: `Created employee profile for ${newEmp.fullName} (${newEmp.employeeId})`,
      timestamp: new Date().toISOString()
    };
    data.activities.unshift(newAct);
    if (data.activities.length > 50) data.activities.pop(); // Cap activity history

    saveDb(data);
    return newEmp;
  },

  updateEmployee: (id: string, updates: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>>, adminUser: User): Employee => {
    const data = loadDb();
    const idx = data.employees.findIndex(e => e.id === id && !e.isDeleted);
    if (idx === -1) {
      throw new Error('Employee not found');
    }

    const original = data.employees[idx];

    // Check unique employeeId if updated
    if (updates.employeeId && updates.employeeId !== original.employeeId) {
      const exists = data.employees.some(e => e.id !== id && e.employeeId.toLowerCase() === updates.employeeId!.toLowerCase() && !e.isDeleted);
      if (exists) {
        throw new Error(`Employee ID ${updates.employeeId} already exists.`);
      }
    }

    // Check unique email if updated
    if (updates.email && updates.email.toLowerCase() !== original.email.toLowerCase()) {
      const exists = data.employees.some(e => e.id !== id && e.email.toLowerCase() === updates.email!.toLowerCase() && !e.isDeleted);
      if (exists) {
        throw new Error(`Employee with email ${updates.email} already exists.`);
      }
    }

    const updatedEmp: Employee = {
      ...original,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    data.employees[idx] = updatedEmp;

    // Log Activity
    let activityDesc = `Updated employee profile for ${updatedEmp.fullName} (${updatedEmp.employeeId})`;
    let activityType: RecentActivity['type'] = 'update';

    if (updates.status && updates.status !== original.status) {
      activityDesc = `Changed status of ${updatedEmp.fullName} (${updatedEmp.employeeId}) to ${updates.status}`;
      activityType = 'status_change';
    }

    const newAct: RecentActivity = {
      id: `act-${Date.now()}`,
      userId: adminUser.id,
      userEmail: adminUser.email,
      type: activityType,
      description: activityDesc,
      timestamp: new Date().toISOString()
    };
    data.activities.unshift(newAct);
    if (data.activities.length > 50) data.activities.pop();

    saveDb(data);
    return updatedEmp;
  },

  deleteEmployee: (id: string, softDelete = true, adminUser: User): { success: boolean } => {
    const data = loadDb();
    const idx = data.employees.findIndex(e => e.id === id && !e.isDeleted);
    if (idx === -1) {
      throw new Error('Employee not found');
    }

    const emp = data.employees[idx];

    if (softDelete) {
      data.employees[idx].isDeleted = true;
      data.employees[idx].updatedAt = new Date().toISOString();
    } else {
      data.employees.splice(idx, 1);
    }

    // Log Activity
    const newAct: RecentActivity = {
      id: `act-${Date.now()}`,
      userId: adminUser.id,
      userEmail: adminUser.email,
      type: 'delete',
      description: `Soft-deleted employee profile for ${emp.fullName} (${emp.employeeId})`,
      timestamp: new Date().toISOString()
    };
    data.activities.unshift(newAct);
    if (data.activities.length > 50) data.activities.pop();

    saveDb(data);
    return { success: true };
  },

  // Activities
  getActivities: (): RecentActivity[] => {
    return loadDb().activities;
  },

  addActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp'>): RecentActivity => {
    const data = loadDb();
    const newAct: RecentActivity = {
      id: `act-${Date.now()}`,
      ...activity,
      timestamp: new Date().toISOString()
    };
    data.activities.unshift(newAct);
    if (data.activities.length > 50) data.activities.pop();
    saveDb(data);
    return newAct;
  },

  // Analytics Dashboard
  getStats: (): DashboardStats => {
    const emps = db.getEmployees();
    const activities = db.getActivities().slice(0, 8); // Top 8 recent activities

    const totalEmployees = emps.length;
    const activeEmployees = emps.filter(e => e.status === 'Active').length;

    // Get unique departments
    const departments = Array.from(new Set(emps.map(e => e.department).filter(Boolean)));
    const departmentsCount = departments.length;

    // Breakdown for Chart
    const deptDistributionMap: Record<string, number> = {};
    const statusDistributionMap: Record<string, number> = { Active: 0, Inactive: 0 };

    emps.forEach(emp => {
      // Dept
      const dept = emp.department || 'Other';
      deptDistributionMap[dept] = (deptDistributionMap[dept] || 0) + 1;
      // Status
      statusDistributionMap[emp.status] = (statusDistributionMap[emp.status] || 0) + 1;
    });

    const departmentDistribution = Object.keys(deptDistributionMap).map(name => ({
      name,
      count: deptDistributionMap[name]
    }));

    const statusDistribution = Object.keys(statusDistributionMap).map(name => ({
      name,
      count: statusDistributionMap[name]
    }));

    return {
      totalEmployees,
      activeEmployees,
      departmentsCount,
      recentActivities: activities,
      departmentDistribution,
      statusDistribution
    };
  }
};
