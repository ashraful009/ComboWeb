import React from 'react';
import { useFetch, apiClient } from '../../api/client';
import { GlassCard } from '../../components/GlassCard';
import { Combo, Order } from '@freshagro/shared';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeCombos: number;
  recentOrders: Order[];
  combosList: Combo[];
}

export const AdminDashboard: React.FC = () => {
  const { data: stats, loading, error, refetch } = useFetch<DashboardStats>('/admin/stats');

  const toggleComboStatus = async (id: number, isActive: boolean) => {
    try {
      await apiClient(`/admin/combos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive ? 1 : 0 })
      });
      refetch();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update combo');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (error || !stats) return <div className="p-10 text-center text-red-500">Failed to load dashboard data.</div>;

  const statCards = [
    { title: "Today's Orders", value: stats.todayOrders, icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-blue-500' },
    { title: "Today's Revenue", value: formatCurrency(stats.todayRevenue), icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-500' },
    { title: "Pending Orders", value: stats.pendingOrders, icon: <DollarSign className="w-6 h-6" />, color: 'bg-orange-500' },
    { title: "Active Combos", value: stats.activeCombos, icon: <Package className="w-6 h-6" />, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <GlassCard key={i} className="p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-${stat.color}/30`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">{stat.title}</div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-sm">
                    <th className="pb-3 px-2">Order ID</th>
                    <th className="pb-3 px-2">Customer</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Total</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} className="text-sm text-slate-700">
                      <td className="py-3 px-2 font-bold"><Link to={`/admin/orders/${order.id}`} className="hover:text-primary">#{order.order_no}</Link></td>
                      <td className="py-3 px-2">{order.customer_name}</td>
                      <td className="py-3 px-2">{format(new Date(order.created_at), 'dd MMM, hh:mm a')}</td>
                      <td className="py-3 px-2 font-bold">৳{order.grand_total.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          order.order_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-slate-400">No recent orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Quick Combos Toggle */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Combo Toggle</h2>
            <div className="space-y-4">
              {stats.combosList.map(combo => (
                <div key={combo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{combo.name_en}</div>
                    <div className="text-xs text-slate-500">৳{combo.price}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!!combo.is_active} 
                      onChange={(e) => toggleComboStatus(combo.id, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
