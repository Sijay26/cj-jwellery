import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const { currentUser, currentAdmin } = useAuth();
  
  // Page state: 'auth' | 'home' | 'product' | 'admin'
  // Default first page is 'auth' (Login page) as required
  const [currentPage, setCurrentPage] = useState('auth');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Navigation handler that refreshes state on every page transition
  const handleNavigate = (page, param = null) => {
    // If navigating to product, record product ID
    if (page === 'product') {
      setSelectedProductId(param);
    } else {
      setSelectedProductId(null);
    }

    // Scroll to top on every page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  // Sync navigation if user logs in
  useEffect(() => {
    if (currentAdmin && currentPage === 'auth') {
      setCurrentPage('admin');
    }
  }, [currentAdmin, currentPage]);

  return (
    <div className="site-root">
      {/* Ambient background glows */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />

      {/* Navigation Header */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Content Area */}
      <main className="site-content">
        {currentPage === 'auth' && (
          <AuthPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {currentPage === 'product' && selectedProductId && (
          <ProductPage productId={selectedProductId} onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && (
          <AdminPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="relative z-10 border-t border-[rgba(212,175,55,0.2)] bg-[rgba(14,2,22,0.92)] backdrop-blur-xl py-8 mt-16 text-center text-xs text-purple-300">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-brand text-sm tracking-widest text-amber-200 uppercase font-semibold">
            Sri Jayam Jewellers • 916 Hallmark Purity
          </p>
          <p className="text-[11px] text-purple-400">
            Official Store • Customer Care & WhatsApp Orders: +91 6369058169
          </p>
          <p className="text-[10px] text-purple-500">
            © {new Date().getFullYear()} Sri Jayam Jewellers. All rights reserved. Registered with Bureau of Indian Standards (BIS).
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
