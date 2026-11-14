import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { request, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (targetKey: string) => Promise<void>;
  updateUserLocation: (location: string) => Promise<void>;
}

// 3 Business Partners: AJMALSHA, ASHIQUE SALIM, SHANU
export const DEMO_USERS: Record<string, User> = {
  partner1: {
    _id: 'user_partner_1',
    name: 'AJMALSHA',
    email: 'ajmalsha@cartseven.com',
    role: 'admin',
    location: 'Central Office',
    phone: '+91 98201 44891',
    isActive: true,
  },
  partner2: {
    _id: 'user_partner_2',
    name: 'ASHIQUE SALIM',
    email: 'ashique@cartseven.com',
    role: 'accountant',
    location: 'Central Office',
    phone: '+91 98201 44892',
    isActive: true,
  },
  partner3: {
    _id: 'user_partner_3',
    name: 'SHANU',
    email: 'shanu@cartseven.com',
    role: 'manager',
    location: 'Central Office',
    phone: '+91 98201 44893',
    isActive: true,
  },
};

// Aliases for convenient lookups & backward compatibility
DEMO_USERS.ajmalsha = DEMO_USERS.partner1;
DEMO_USERS.ashique = DEMO_USERS.partner2;
DEMO_USERS.shanu = DEMO_USERS.partner3;
DEMO_USERS.admin = DEMO_USERS.partner1;
DEMO_USERS.accountant = DEMO_USERS.partner2;
DEMO_USERS.manager = DEMO_USERS.partner3;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setUser(DEMO_USERS.partner1);
        setLoading(false);
        return;
      }

      try {
        const res = await request<{ success: boolean; user: User }>('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setUser(DEMO_USERS.partner1);
        }
      } catch {
        const storedRole = localStorage.getItem('cartseven_role') || 'partner1';
        setUser(DEMO_USERS[storedRole] || DEMO_USERS.partner1);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string = 'password123'): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success) {
        setToken(res.token);
        setAuthToken(res.token);
        setUser(res.user);
        localStorage.setItem('cartseven_role', res.user.role);
        return true;
      }
      return false;
    } catch {
      // In offline mode / local mock login
      const matched = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        const mockToken = 'mock_jwt_' + matched.email;
        setToken(mockToken);
        setAuthToken(mockToken);
        setUser(matched);
        localStorage.setItem('cartseven_role', matched.role);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (targetKey: string) => {
    const target = DEMO_USERS[targetKey];
    if (target) {
      await login(target.email, 'password123');
    }
  };

  const updateUserLocation = async (location: string) => {
    if (!user) return;
    try {
      await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ location }),
      });
      setUser({ ...user, location });
    } catch {
      setUser({ ...user, location });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('cartseven_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        switchUser,
        updateUserLocation,
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
