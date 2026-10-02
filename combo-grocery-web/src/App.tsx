import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/common/AuthGuard';
import { AdminGuard } from './components/common/AdminGuard';
import { Home } from './pages/Home/Home';
import { ComboDetail } from './pages/ComboDetail/ComboDetail';
import { Cart } from './pages/Cart/Cart';
import { Checkout } from './pages/checkout/Checkout';
import { OrderSuccess } from './pages/OrderSuccess/OrderSuccess';
import { AdminLayout } from './components/AdminLayout/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard/AdminDashboard';
import { ComboBuilder } from './pages/admin/ComboBuilder/ComboBuilder';
import { InvestorKYC } from './pages/admin/InvestorKYC/InvestorKYC';
import { AccountDashboard } from './pages/account/AccountDashboard/AccountDashboard';
import { InvestorDashboard } from './pages/account/InvestorDashboard/InvestorDashboard';
import { InvestmentApplication } from './pages/InvestmentApplication/InvestmentApplication';
import { OrderTracking } from './pages/account/OrderTracking/OrderTracking';
import { AddressBook } from './pages/account/AddressBook/AddressBook';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { CategoryManagement } from './pages/admin/CategoryManagement/CategoryManagement';
import { ComboList } from './pages/admin/ComboList/ComboList';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/combos/:id" element={<ComboDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
        <Route path="/order-success" element={<AuthGuard><OrderSuccess /></AuthGuard>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Account Routes */}
        <Route path="/account" element={<AuthGuard><AccountDashboard /></AuthGuard>} />
        <Route path="/account/investor" element={<AuthGuard><InvestorDashboard /></AuthGuard>} />
        <Route path="/account/orders/:orderNumber/track" element={<AuthGuard><OrderTracking /></AuthGuard>} />
        <Route path="/account/address" element={<AuthGuard><AddressBook /></AuthGuard>} />
        <Route path="/invest/apply" element={<AuthGuard><InvestmentApplication /></AuthGuard>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>} />
        <Route path="/admin/combos" element={<AdminGuard><ComboList /></AdminGuard>} />
        <Route path="/admin/combos/new" element={<AdminGuard><ComboBuilder /></AdminGuard>} />
        <Route path="/admin/combos/edit/:id" element={<AdminGuard><ComboBuilder /></AdminGuard>} />
        <Route path="/admin/categories" element={<AdminGuard><CategoryManagement /></AdminGuard>} />
        <Route path="/admin/investors/review" element={<AdminGuard><InvestorKYC /></AdminGuard>} />
      </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;