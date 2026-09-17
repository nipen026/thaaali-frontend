import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A support session opened from the Admin Panel's "Impersonate" action lands here with
    // ?impersonate_token=... — adopt it as the active session, then scrub it from the URL so
    // it doesn't linger in history/get shared accidentally.
    const params = new URLSearchParams(window.location.search);
    const impersonateToken = params.get('impersonate_token');
    if (impersonateToken) {
      localStorage.setItem('thaali_token', impersonateToken);
      params.delete('impersonate_token');
      const rest = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
    }

    const token = localStorage.getItem('thaali_token');
    if (token) {
      authAPI.me().then(r => { setUser(r.data); }).catch(() => { localStorage.removeItem('thaali_token'); }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const r = await authAPI.login(email, password);
    localStorage.setItem('thaali_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (data) => {
    const r = await authAPI.register(data);
    localStorage.setItem('thaali_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => { localStorage.removeItem('thaali_token'); setUser(null); };

  // Re-pulls /me so local state picks up server-side changes made without a fresh
  // login — e.g. verifying an email or changing a password from Settings.
  const refreshUser = async () => {
    const r = await authAPI.me();
    setUser(r.data);
    return r.data;
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
