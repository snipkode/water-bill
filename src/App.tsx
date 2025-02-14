import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Readings from './pages/Readings';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import PaymentPage from './pages/PaymentPage';
import MeterInfo from './pages/MeterInfo';
import { supabase } from './lib/supabase';
import './i18n'; // Import i18n configuration
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navigation onLogout={handleLogout} />}
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <Routes>
            <Route
              path="/auth"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/bills"
              element={isAuthenticated ? <Bills /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/readings"
              element={isAuthenticated ? <Readings /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/payment/:billId"
              element={isAuthenticated ? <PaymentPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/meter-info"
              element={isAuthenticated ? <MeterInfo /> : <Navigate to="/auth" replace />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;