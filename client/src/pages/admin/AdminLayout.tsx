import React from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Ticket, 
  ShoppingCart, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, logout, loading } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/admin/combos', icon: <Package className="w-5 h-5" />, label: 'Combos' },
    { to: '/admin/coupons', icon: <Ticket className="w-5 h-5" />, label: 'Coupons' },
    { to: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders' },
    { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full p-4 hidden lg:block">
        <GlassCard className="h-full flex flex-col p-4 border-slate-200">
          <div className="mb-8 px-4 flex items-center gap-2 text-primary font-bold text-xl">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            Admin Panel
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </GlassCard>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
