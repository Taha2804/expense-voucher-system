import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_PROFILES } from '../lib/initialData';

interface DecodedJwtToken {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  employeeId?: string;
  iat: number;
  exp: number;
  iss?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  jwtToken: string | null;
  decodedJwt: DecodedJwtToken | null;
  isTokenValid: boolean;
  switchDemoUser: (idOrRole: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string, name?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUserSignature: (signatureUrl: string) => void;
  verifyCurrentToken: () => Promise<{ valid: boolean; payload?: any; error?: string }>;
  demoProfiles: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'abccompany_active_user_id';
const JWT_STORAGE_KEY = 'abccompany_jwt_token';

// In-browser helper to parse JWT payload without external library
function parseJwtPayload(token: string): DecodedJwtToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Generate client-side cryptographic simulation token if backend is restarting
function generateClientJwt(user: UserProfile): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const nowSec = Math.floor(Date.now() / 1000);
  const payloadData: DecodedJwtToken = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    employeeId: user.employeeId,
    iat: nowSec,
    exp: nowSec + 86400, // 24 hours
    iss: 'ABC Company Expense Auth Server',
  };
  const payload = btoa(JSON.stringify(payloadData)).replace(/=/g, '');
  const signature = btoa('abc_hmac_sha256_mock_sig_' + user.id).replace(/=/g, '');
  return `${header}.${payload}.${signature}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedId) {
      const found = DEMO_PROFILES.find((p) => p.id === savedId);
      if (found) return found;
    }
    return DEMO_PROFILES[0];
  });

  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    return localStorage.getItem(JWT_STORAGE_KEY);
  });

  const [profiles, setProfiles] = useState<UserProfile[]>(DEMO_PROFILES);

  const decodedJwt = jwtToken ? parseJwtPayload(jwtToken) : null;
  const isTokenValid = Boolean(decodedJwt && decodedJwt.exp * 1000 > Date.now());

  // Issue real JWT token via /api/auth/login endpoint
  const requestJwtToken = useCallback(async (user: UserProfile) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          role: user.role,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setJwtToken(data.token);
          localStorage.setItem(JWT_STORAGE_KEY, data.token);
          return;
        }
      }
    } catch (err) {
      console.warn('API server call fallback to local JWT:', err);
    }

    // Fallback: client token
    const fallbackToken = generateClientJwt(user);
    setJwtToken(fallbackToken);
    localStorage.setItem(JWT_STORAGE_KEY, fallbackToken);
  }, []);

  // Sync token whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, currentUser.id);
      requestJwtToken(currentUser);
    }
  }, [currentUser, requestJwtToken]);

  const switchDemoUser = async (idOrRole: string) => {
    const found = profiles.find((p) => p.id === idOrRole || p.role === idOrRole);
    if (found) {
      setCurrentUser(found);
      await requestJwtToken(found);
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    const found = profiles.find((p) => p.role === role);
    if (found) {
      setCurrentUser(found);
      await requestJwtToken(found);
    }
  };

  const loginWithEmail = async (email: string, name?: string, role: UserRole = 'employee') => {
    const existing = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      await requestJwtToken(existing);
      return;
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role,
      department:
        role === 'director'
          ? 'Executive Management'
          : role === 'accounts'
          ? 'Finance & Accounts'
          : 'Engineering',
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setCurrentUser(newProfile);
    await requestJwtToken(newProfile);
  };

  const logout = () => {
    setCurrentUser(null);
    setJwtToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(JWT_STORAGE_KEY);
  };

  const updateUserSignature = (signatureUrl: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, savedSignature: signatureUrl };
    setCurrentUser(updated);
    setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? updated : p)));
  };

  const verifyCurrentToken = async (): Promise<{ valid: boolean; payload?: any; error?: string }> => {
    if (!jwtToken) {
      return { valid: false, error: 'No active JWT token found' };
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: jwtToken }),
      });

      if (res.ok) {
        const data = await res.json();
        return { valid: data.valid, payload: data.payload };
      } else {
        const errData = await res.json();
        return { valid: false, error: errData.error || 'Token verification failed' };
      }
    } catch (e: any) {
      // Local fallback validation
      if (decodedJwt && decodedJwt.exp * 1000 > Date.now()) {
        return { valid: true, payload: decodedJwt };
      }
      return { valid: false, error: 'Token expired or invalid signature' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        jwtToken,
        decodedJwt,
        isTokenValid,
        switchDemoUser,
        loginAsDemo,
        loginWithEmail,
        logout,
        updateUserSignature,
        verifyCurrentToken,
        demoProfiles: profiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
