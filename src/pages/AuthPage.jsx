import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../utils/api';
import { Diamond, ShieldCheck, User, Lock, Phone, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthPage({ onNavigate }) {
  const { loginCustomer, loginAdmin } = useAuth();
  const { settings } = useTheme();

  // Mode: 'customer' or 'admin'. Default is always 'customer'.
  const [roleMode, setRoleMode] = useState('customer');
  // Customer tabs: 'login' or 'register'. Default is 'login'.
  const [customerTab, setCustomerTab] = useState('login');

  // Customer Form Fields
  const [custMobile, setCustMobile] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custConfirmPassword, setCustConfirmPassword] = useState('');

  // Admin Form Fields
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // UI States
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingCustomerAuth, setPendingCustomerAuth] = useState(null);

  // Clear all entered state whenever switching between Customer and Admin or tabs
  const resetFormState = () => {
    setCustMobile('');
    setCustPassword('');
    setCustConfirmPassword('');
    setAdminMobile('');
    setAdminPassword('');
    setErrorMessage('');
    setFieldErrors({});
  };

  const handleRoleChange = (role) => {
    setRoleMode(role);
    resetFormState();
  };

  const handleTabChange = (tab) => {
    setCustomerTab(tab);
    resetFormState();
  };

  // -------------------------------------------------------------
  // CUSTOMER LOGIN
  // -------------------------------------------------------------
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const errors = {};

    const cleanMobile = custMobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Please enter your mobile number';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (!custPassword) {
      errors.password = 'Please enter your password';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mobile: cleanMobile, password: custPassword }),
      });
      loginCustomer(res.customer, res.token);
      resetFormState();
      onNavigate('home');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER REGISTER
  // -------------------------------------------------------------
  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const errors = {};

    const cleanMobile = custMobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be 10 digits';
    }

    if (!custPassword) {
      errors.password = 'Password is required';
    } else if (custPassword.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }

    if (!custConfirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (custPassword !== custConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          mobile: cleanMobile,
          password: custPassword,
          confirm_password: custConfirmPassword,
        }),
      });

      // Save credentials for the OK popup transition
      setPendingCustomerAuth({ customer: res.customer, token: res.token });
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OK button click after successful registration
  const handleSuccessOkClick = () => {
    setShowSuccessModal(false);
    if (pendingCustomerAuth) {
      loginCustomer(pendingCustomerAuth.customer, pendingCustomerAuth.token);
    }
    resetFormState();
    onNavigate('home');
  };

  // -------------------------------------------------------------
  // ADMIN LOGIN
  // -------------------------------------------------------------
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const errors = {};

    const cleanMobile = adminMobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Admin mobile number is required';
    }
    if (!adminPassword) {
      errors.password = 'Admin password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ mobile: cleanMobile, password: adminPassword }),
      });
      loginAdmin(res.admin, res.token);
      resetFormState();
      onNavigate('admin');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid admin credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-12">
      
      {/* Top Right Switch: Customer | Admin */}
      <div className="absolute top-6 right-6 z-30">
        <div className="p-1 rounded-full bg-[rgba(20,4,32,0.85)] border border-[rgba(212,175,55,0.4)] backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex items-center">
          <button
            onClick={() => handleRoleChange('customer')}
            className={`px-4 py-1.5 rounded-full text-xs font-brand tracking-wider font-semibold transition-all duration-300 ${
              roleMode === 'customer'
                ? 'bg-gradient-to-r from-[#FBF0B9] via-[#D4AF37] to-[#9A7217] text-[#140321] shadow-md'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className={`px-4 py-1.5 rounded-full text-xs font-brand tracking-wider font-semibold transition-all duration-300 ${
              roleMode === 'admin'
                ? 'bg-gradient-to-r from-[#FBF0B9] via-[#D4AF37] to-[#9A7217] text-[#140321] shadow-md'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Luxury Auth Card */}
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 relative overflow-hidden animate-fade-in border-[rgba(212,175,55,0.35)] shadow-[0_25px_60px_rgba(0,0,0,0.7)]">
        
        {/* Subtle decorative gold sparkle corners */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[var(--accent-gold)]/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[var(--accent-gold)]/20 to-transparent pointer-events-none" />

        {/* Card Header with Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[var(--accent-gold)] bg-[rgba(212,175,55,0.1)] mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            {roleMode === 'admin' ? (
              <ShieldCheck className="w-8 h-8 text-[var(--accent-gold)]" />
            ) : (
              <Diamond className="w-8 h-8 text-[var(--accent-gold)] animate-pulse" />
            )}
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide text-white">
            {roleMode === 'admin' ? 'Admin Portal' : 'Welcome to Luxury'}
          </h2>
          <p className="font-accent text-sm text-[var(--accent-gold)] mt-1 tracking-widest uppercase">
            {roleMode === 'admin'
              ? 'Authorized Management Access'
              : 'Pure 916 BIS Certified Gold & Jewels'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs sm:text-sm font-medium animate-fade-in flex items-start gap-2 shadow-lg">
            <span className="text-red-400 font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* CUSTOMER AUTHENTICATION FLOW */}
        {/* ============================================================== */}
        {roleMode === 'customer' ? (
          <div>
            {/* Tab Switcher: Login | Register */}
            <div className="flex border-b border-[rgba(212,175,55,0.25)] mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-3 text-sm font-brand tracking-wider font-semibold border-b-2 transition-all duration-300 ${
                  customerTab === 'login'
                    ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                    : 'border-transparent text-purple-300 hover:text-white'
                }`}
              >
                Customer Login
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-3 text-sm font-brand tracking-wider font-semibold border-b-2 transition-all duration-300 ${
                  customerTab === 'register'
                    ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                    : 'border-transparent text-purple-300 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Customer Login Form */}
            {customerTab === 'login' ? (
              <form onSubmit={handleCustomerLogin} autoComplete="off">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="tel"
                        maxLength="10"
                        value={custMobile}
                        onChange={(e) => {
                          setCustMobile(e.target.value.replace(/\D/g, ''));
                          setFieldErrors({ ...fieldErrors, mobile: null });
                        }}
                        placeholder="Enter 10-digit mobile number"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.mobile ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.mobile && (
                      <p className="error-text-msg">{fieldErrors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="password"
                        value={custPassword}
                        onChange={(e) => {
                          setCustPassword(e.target.value);
                          setFieldErrors({ ...fieldErrors, password: null });
                        }}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.password ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="error-text-msg">{fieldErrors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full mt-2"
                  >
                    {submitting ? 'Authenticating...' : 'Sign In to Luxury Portal'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('register')}
                      className="text-xs text-[var(--accent-gold)] hover:underline tracking-wide"
                    >
                      New customer? Create an account here →
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Customer Register Form */
              <form onSubmit={handleCustomerRegister} autoComplete="off">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="tel"
                        maxLength="10"
                        value={custMobile}
                        onChange={(e) => {
                          setCustMobile(e.target.value.replace(/\D/g, ''));
                          setFieldErrors({ ...fieldErrors, mobile: null });
                        }}
                        placeholder="10-digit mobile number"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.mobile ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.mobile && (
                      <p className="error-text-msg">{fieldErrors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="password"
                        value={custPassword}
                        onChange={(e) => {
                          setCustPassword(e.target.value);
                          setFieldErrors({ ...fieldErrors, password: null });
                        }}
                        placeholder="Create strong password"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.password ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="error-text-msg">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="password"
                        value={custConfirmPassword}
                        onChange={(e) => {
                          setCustConfirmPassword(e.target.value);
                          setFieldErrors({ ...fieldErrors, confirmPassword: null });
                        }}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.confirmPassword ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="error-text-msg">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full mt-2"
                  >
                    {submitting ? 'Registering...' : 'Register Customer'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('login')}
                      className="text-xs text-[var(--accent-gold)] hover:underline tracking-wide"
                    >
                      Already have an account? Sign In here →
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* ADMIN AUTHENTICATION FLOW */
          /* ============================================================== */
          <form onSubmit={handleAdminLogin} autoComplete="off">
            <div className="space-y-5">
              <div className="p-3 rounded-lg bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] text-xs text-purple-200">
                <span className="font-semibold text-[var(--accent-gold)]">Admin Credentials:</span> Mobile: 6369058169 | Password: sijay2606
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                  Admin Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                  <input
                    type="tel"
                    maxLength="10"
                    value={adminMobile}
                    onChange={(e) => {
                      setAdminMobile(e.target.value.replace(/\D/g, ''));
                      setFieldErrors({ ...fieldErrors, mobile: null });
                    }}
                    placeholder="6369058169"
                    autoComplete="new-password"
                    className={`lux-input pl-10 ${fieldErrors.mobile ? 'input-error-box' : ''}`}
                  />
                </div>
                {fieldErrors.mobile && (
                  <p className="error-text-msg">{fieldErrors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setFieldErrors({ ...fieldErrors, password: null });
                    }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`lux-input pl-10 ${fieldErrors.password ? 'input-error-box' : ''}`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="error-text-msg">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full mt-2"
              >
                {submitting ? 'Verifying...' : 'Admin Sign In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('customer')}
                  className="text-xs text-purple-300 hover:text-[var(--accent-gold)] tracking-wide"
                >
                  ← Return to Customer Store
                </button>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* ============================================================== */}
      {/* OK POPUP MODAL (AFTER SUCCESSFUL REGISTRATION) */}
      {/* ============================================================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel p-8 text-center border-2 border-[var(--accent-gold)] shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-modal">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Registration Successful!
            </h3>
            
            <p className="font-body text-sm text-purple-200 mb-6 leading-relaxed">
              Welcome to <span className="gold-text font-bold">{settings.site_name || 'Sri Jayam Jewellers'}</span>. Your luxury account is now active.
            </p>

            <button
              onClick={handleSuccessOkClick}
              className="btn-gold w-full text-base py-3"
            >
              OK — Enter Store
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
