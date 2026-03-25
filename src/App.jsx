import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Shops from './pages/Shops';
import Categories from './pages/Categories';
import Vendors from './pages/Vendors';
import Analytics from './pages/Analytics';
import OrderMonitor from './pages/Orders';
import ChangePassword from './pages/ChangePassword';
import AdminShell from './components/layout/AdminShell';

import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Admin Routes */}
            <Route path="/" element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="locations" element={<Locations />} />
              <Route path="shops" element={<Shops />} />
              <Route path="categories" element={<Categories />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="orders" element={<OrderMonitor />} />
              <Route path="settings/password" element={<ChangePassword />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
