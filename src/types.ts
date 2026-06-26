export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  salary: number;
  dateOfJoining: string;
  status: EmployeeStatus;
  profilePicture: string; // base64 representation
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'create' | 'update' | 'delete' | 'status_change' | 'login' | 'logout';

export interface RecentActivity {
  id: string;
  userId: string;
  userEmail: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  recentActivities: RecentActivity[];
  departmentDistribution: { name: string; count: number }[];
  statusDistribution: { name: string; count: number }[];
}
