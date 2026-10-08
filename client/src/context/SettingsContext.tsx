import React, { createContext, useContext, useEffect, useState } from 'react';
import { Settings } from '@freshagro/shared';
import { apiClient } from '../api/client';
import { useToast } from './ToastContext';

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadSettings = async () => {
    try {
      const data = await apiClient<Settings>('/settings/public');
      setSettings(data);
    } catch (error: unknown) {
      console.error('Failed to load settings:', error);
      showToast('Failed to load application settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
