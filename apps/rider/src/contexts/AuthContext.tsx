import React, { createContext, useContext, useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { authAPI } from '../api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = Taro.getStorageSync('access_token');
    const savedUser = Taro.getStorageSync('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const response: any = await authAPI.login(phone, password);

    if (response.code === 0) {
      const { access_token, user_id, phone: userPhone, roles } = response.data;

      // 骑手端仅允许 rider 角色登录（对齐 Web 端 fronted/Rider 的角色校验）
      if (!roles || !roles.includes('rider')) {
        throw new Error('该账号不是骑手账号');
      }

      const userData = { id: user_id, phone: userPhone, roles };

      setToken(access_token);
      setUser(userData);

      Taro.setStorageSync('access_token', access_token);
      Taro.setStorageSync('user', JSON.stringify(userData));
    } else {
      throw new Error(response.message || '登录失败');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Taro.removeStorageSync('access_token');
    Taro.removeStorageSync('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
