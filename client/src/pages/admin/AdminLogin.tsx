import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Lock } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const AdminLogin: React.FC = () => {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Checking authentication...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
          <p className="text-slate-500">freshagro.farm management</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
            <input 
              required
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="pill-input rounded-xl" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pill-input rounded-xl" 
            />
          </div>
          <Button type="submit" className="w-full py-3 mt-4" isLoading={isLoading}>
            Login
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
