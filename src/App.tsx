import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Readings from './pages/Readings';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import PaymentPage from './pages/PaymentPage';
import { supabase } from './lib/supabase';
import './i18n'; // Import i18n configuration

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;