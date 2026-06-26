import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { User } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-ems-key-2026';

// Support large payloads for base64 profile pictures
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Extend Express Request type to include user context
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Authentication Middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.user = decoded as User;
    next();
  });
};

// --- API ROUTES ---

// Auth Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Sign JWT Token
    const payload: User = {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Log Activity
    db.addActivity({
      userId: user.id,
      userEmail: user.email,
      type: 'login',
      description: `User ${user.fullName} logged in.`
    });

    res.json({
      token,
      user: payload
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    db.addActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      type: 'logout',
      description: `User ${req.user.fullName} logged out.`
    });
  }
  res.json({ success: true, message: 'Successfully logged out' });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Dashboard Analytics Route
app.get('/api/dashboard/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
});

// Employee Routes
app.get('/api/employees', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      search = '', 
      department = '', 
      status = '', 
      sortBy = 'fullName', 
      sortOrder = 'asc',
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    let employees = db.getEmployees();

    // 1. Search filter (search term matches Name, Department, or Position)
    const query = (search as string).toLowerCase().trim();
    if (query) {
      employees = employees.filter(emp => 
        emp.fullName.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query)
      );
    }

    // 2. Department filter
    if (department) {
      employees = employees.filter(emp => emp.department === department);
    }

    // 3. Status filter
    if (status) {
      employees = employees.filter(emp => emp.status === status);
    }

    // 4. Sorting
    employees.sort((a: any, b: any) => {
      let valA = a[sortBy as string];
      let valB = b[sortBy as string];

      // Handle string comparisons
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 5. Pagination
    const total = employees.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedEmployees = employees.slice(startIndex, startIndex + limitNum);

    res.json({
      employees: paginatedEmployees,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve employees' });
  }
});

app.get('/api/employees/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = db.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve employee details' });
  }
});

app.post('/api/employees', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      employeeId, 
      fullName, 
      email, 
      phoneNumber, 
      department, 
      position, 
      salary, 
      dateOfJoining, 
      status, 
      profilePicture 
    } = req.body;

    // Validation
    if (!fullName || !email || !department || !position || !dateOfJoining || !status) {
      return res.status(400).json({ error: 'Please provide all required fields (Name, Email, Department, Position, Date of Joining, and Status).' });
    }

    const numSalary = Number(salary) || 0;

    const newEmployee = db.createEmployee({
      employeeId: employeeId || '',
      fullName,
      email,
      phoneNumber: phoneNumber || '',
      department,
      position,
      salary: numSalary,
      dateOfJoining,
      status: status as any,
      profilePicture: profilePicture || ''
    }, req.user!);

    res.status(201).json(newEmployee);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create employee profile' });
  }
});

app.put('/api/employees/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateEmployee(req.params.id, req.body, req.user!);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const softDelete = req.query.soft !== 'false'; // defaults to true unless explicitly queried with soft=false
    const result = db.deleteEmployee(req.params.id, softDelete, req.user!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete employee' });
  }
});

// Serve frontend assets in production / development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Employee Management Server running on port ${PORT}`);
  });
}

startServer();
