import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'abc-company-voucher-secure-jwt-secret-key-2026';

app.use(express.json({ limit: '15mb' }));

// ---------------------------------------------------------------------------
// In-Memory Seed Users for Demo
// ---------------------------------------------------------------------------
const USERS = [
  {
    id: 'emp-rahul-01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@abccompany.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP-ENG-402',
    department: 'Engineering',
  },
  {
    id: 'emp-ananya-02',
    name: 'Ananya Patel',
    email: 'ananya.patel@abccompany.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP-PRD-108',
    department: 'Product & Design',
  },
  {
    id: 'dir-sarah-01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@abccompany.com',
    password: 'password123',
    role: 'director',
    employeeId: 'DIR-EXEC-001',
    department: 'Executive Management',
  },
  {
    id: 'acc-michael-01',
    name: 'Michael Chang',
    email: 'michael.chang@abccompany.com',
    password: 'password123',
    role: 'accounts',
    employeeId: 'ACC-FIN-204',
    department: 'Finance & Accounts',
  },
];

// Extend Express Request for JWT Decoded User
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'employee' | 'director' | 'accounts';
    department: string;
    employeeId?: string;
  };
}

// ---------------------------------------------------------------------------
// JWT Verification Middleware
// ---------------------------------------------------------------------------
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing. JWT token required.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Malformed authorization header. Expected "Bearer <token>"' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'JWT token has expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid or forged JWT token signature.' });
  }
}

// ---------------------------------------------------------------------------
// Auth API Endpoints
// ---------------------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email or by role (for 1-click test switcher)
  let user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user && role) {
    user = USERS.find(u => u.role === role);
  }

  // If new email provided, auto-create profile
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      password: password || 'defaultpass',
      role: (role as any) || 'employee',
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      department: role === 'director' ? 'Executive Management' : role === 'accounts' ? 'Finance & Accounts' : 'Engineering',
    };
    USERS.push(user);
  }

  // Generate JWT Token
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    employeeId: user.employeeId,
    iss: 'ABC Company Expense Auth Server',
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });

  return res.json({
    message: 'Authentication successful. JWT token issued.',
    token,
    tokenType: 'Bearer',
    expiresIn: '24h',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
    },
  });
});

// GET /api/auth/me (Protected Route with JWT)
app.get('/api/auth/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    authenticated: true,
    user: req.user,
  });
});

// POST /api/auth/verify (Decodes and validates JWT token with detailed diagnostics)
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { complete: true });
    return res.json({
      valid: true,
      header: decoded.header,
      payload: decoded.payload,
      algorithm: decoded.header.alg,
      expiresAt: (decoded.payload as any).exp
        ? new Date((decoded.payload as any).exp * 1000).toISOString()
        : null,
    });
  } catch (err: any) {
    return res.status(400).json({
      valid: false,
      error: err.message,
      expired: err.name === 'TokenExpiredError',
    });
  }
});

// ---------------------------------------------------------------------------
// Health check route
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    jwtConfigured: true,
    service: 'Expense Voucher Management System Backend',
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Vite Dev Server or Production Static Serving
// ---------------------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Backend + Vite] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[JWT Auth] JWT Authentication endpoint active at /api/auth/login and /api/auth/me`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
