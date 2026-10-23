import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState({
    site_name: 'SRI JAYAM JEWELLERS',
    theme_color: '#220538',
    secondary_color: '#3b0d5c',
    accent_color: '#D4AF37',
    bg_image: '',
    bg_opacity: 0.25,
    logo: '',
  });
  const [loading, setLoading] = useState(true);

  // Helper to dynamically adjust secondary and dark tones from primary hex
  const calculateSecondaryAndDark = (hex) => {
    try {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);

      // Slightly lighter for secondary
      const r2 = Math.min(255, Math.round(r * 1.5 + 20));
      const g2 = Math.min(255, Math.round(g * 1.5 + 10));
      const b2 = Math.min(255, Math.round(b * 1.5 + 25));
      const secondaryHex = `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;

      // Deep dark for background
      const rDark = Math.max(5, Math.round(r * 0.35));
      const gDark = Math.max(3, Math.round(g * 0.35));
      const bDark = Math.max(8, Math.round(b * 0.35));
      const darkHex = `#${rDark.toString(16).padStart(2, '0')}${gDark.toString(16).padStart(2, '0')}${bDark.toString(16).padStart(2, '0')}`;

      return { secondary: secondaryHex, dark: darkHex };
    } catch {
      return { secondary: '#3b0d5c', dark: '#0d0217' };
    }
  };

  const applyThemeToDOM = useCallback((s) => {
    if (!s) return;
    const root = document.documentElement;
    const primary = s.theme_color || '#220538';
    const accent = s.accent_color || '#D4AF37';
    const { secondary, dark } = calculateSecondaryAndDark(primary);

    root.style.setProperty('--theme-color', primary);
    root.style.setProperty('--theme-secondary', secondary);
    root.style.setProperty('--theme-dark', dark);
    root.style.setProperty('--accent-gold', accent);

    // Dynamic gradient border & shadow based on accent
    root.style.setProperty('--gold-border', `${accent}40`);
    root.style.setProperty('--gold-glow', `0 0 25px ${accent}45`);
    root.style.setProperty('--gold-gradient', `linear-gradient(135deg, #FFF4CC 0%, ${accent} 50%, #8C6512 100%)`);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiRequest('/settings');
      if (res.settings) {
        setSettings(res.settings);
        applyThemeToDOM(res.settings);
      }
    } catch (err) {
      console.warn('Could not fetch settings from API, using default luxury theme:', err);
    } finally {
      setLoading(false);
    }
  }, [applyThemeToDOM]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettingsLive = (newSettings) => {
    setSettings(newSettings);
    applyThemeToDOM(newSettings);
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettingsLive,
      }}
    >
      {/* Background Image Overlay with customizable opacity */}
      {settings.bg_image && (
        <div
          className="site-bg-overlay"
          style={{
            backgroundImage: `url(${settings.bg_image})`,
            opacity: settings.bg_opacity !== undefined ? settings.bg_opacity : 0.25,
          }}
        />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
