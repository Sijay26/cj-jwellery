import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, LogOut, ShieldCheck, Diamond, Sparkles, X, ChevronRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { formatINR } from '../utils/currency';

export default function Navbar({ onNavigate, currentPage }) {
  const { currentUser, currentAdmin, logout } = useAuth();
  const { settings } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiRequest(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        if (res.products) {
          setSuggestions(res.products.slice(0, 6));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    setSearchQuery('');
    onNavigate('product', productId);
  };

  const handleLogout = () => {
    logout();
    onNavigate('auth');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(18,4,30,0.85)] border-b border-[rgba(212,175,55,0.22)] shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Name */}
          <div
            onClick={() => onNavigate(currentAdmin ? 'admin' : 'home')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Brand Logo"
                className="h-12 w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-[var(--accent-gold)] flex items-center justify-center bg-[rgba(212,175,55,0.1)]">
                  <Diamond className="w-5 h-5 text-[var(--accent-gold)] animate-pulse" />
                </div>
                <div>
                  <h1 className="font-brand text-lg sm:text-xl font-bold tracking-widest gold-text">
                    {settings.site_name || 'SRI JAYAM'}
                  </h1>
                  <p className="font-accent text-xs tracking-wider text-[var(--accent-gold)] opacity-85">
                    LUXURY JEWELLERS
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar with live dropdown (available on Customer view) */}
          {!currentAdmin && (
            <div ref={searchRef} className="relative flex-1 max-w-lg mx-2 sm:mx-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  placeholder="Search rings, arams, bangles, gold chains..."
                  autoComplete="off"
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[rgba(28,7,44,0.7)] border border-[rgba(212,175,55,0.3)] text-white text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] placeholder-purple-200/40 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[rgba(22,5,35,0.96)] backdrop-blur-2xl border border-[var(--accent-gold)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden z-50 animate-modal">
                  <div className="p-2 border-b border-[rgba(212,175,55,0.15)] flex justify-between items-center text-xs text-purple-300 px-3">
                    <span className="font-brand tracking-wider text-[var(--accent-gold)]">JEWELLERY SUGGESTIONS</span>
                    <span>{suggestions.length} items found</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(212,175,55,0.1)]">
                    {suggestions.map((jewel) => (
                      <div
                        key={jewel.id}
                        onClick={() => handleSelectProduct(jewel.id)}
                        className="flex items-center gap-3 p-3 hover:bg-[rgba(212,175,55,0.15)] cursor-pointer transition-colors"
                      >
                        <img
                          src={jewel.image}
                          alt={jewel.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[rgba(212,175,55,0.3)] bg-purple-950 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-heading text-white truncate font-medium">
                            {jewel.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--accent-gold)] font-bold">{formatINR(jewel.price)}</span>
                            <span className="text-purple-300">•</span>
                            <span className="text-purple-300">{jewel.grams} g</span>
                            <span className="text-purple-400 text-[10px] uppercase tracking-wider bg-purple-900/60 px-1.5 py-0.5 rounded">
                              {jewel.model_number}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--accent-gold)] opacity-70" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {currentAdmin ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(212,175,55,0.15)] border border-[var(--accent-gold)] text-[var(--accent-gold)] text-xs font-brand tracking-wider font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> ADMIN ACTIVE
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-outline-gold text-xs px-3 py-1.5"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-purple-300 font-body">Customer</span>
                  <span className="text-xs font-semibold text-[var(--accent-gold)] font-mono">
                    {currentUser.mobile}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline-gold text-xs px-3 py-1.5"
                  title="Logout Customer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="btn-gold text-xs px-4 py-2"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
