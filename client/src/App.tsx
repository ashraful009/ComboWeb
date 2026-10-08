import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Invoice } from './pages/Invoice';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCombos } from './pages/admin/AdminCombos';
const NotFound = () => <div className="p-20 text-center text-2xl font-bold">404 Not Found</div>;

function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <SettingsProvider>
          <CartProvider>
            <CheckoutProvider>
              <AdminAuthProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                    </Route>
                    <Route path="/order/:token" element={<OrderConfirmation />} />
                    <Route path="/invoice/:token" element={<Invoice />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="combos" element={<AdminCombos />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </AdminAuthProvider>
            </CheckoutProvider>
          </CartProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}

export default App;
