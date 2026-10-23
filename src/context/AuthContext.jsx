import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cjjweel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cjjweel_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginCustomer = (customerData, token) => {
    const userObj = { ...customerData, token, role: 'customer' };
    setCurrentUser(userObj);
    sessionStorage.setItem('cjjweel_user', JSON.stringify(userObj));
  };

  const loginAdmin = (adminData, token) => {
    const adminObj = { ...adminData, token, role: 'admin' };
    setCurrentAdmin(adminObj);
    sessionStorage.setItem('cjjweel_admin', JSON.stringify(adminObj));
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentAdmin(null);
    sessionStorage.removeItem('cjjweel_user');
    sessionStorage.removeItem('cjjweel_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentAdmin,
        isLoggedIn: !!currentUser,
        isAdmin: !!currentAdmin,
        loginCustomer,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
