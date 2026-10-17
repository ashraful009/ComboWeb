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

export const defaultSettings: Settings = {
  delivery_charge_inside_dhaka: 60,
  delivery_charge_outside_dhaka: 120,
  free_delivery_min_amount: 5000,
  site_phone: '01609663345',
  site_whatsapp: '+8801609663345',
  site_email: 'freshagrosupport@gmail.com',
  site_address_bn: 'মধ্য বাড্ডা, ঢাকা ১২১২',
  site_address_en: 'Middle Budda, Dhaka 1212',
  bkash_number: '',
  nagad_number: '',
  hero_image_url: '',
  hero_title_bn: '',
  hero_title_en: '',
  hero_subtitle_bn: '',
  hero_subtitle_en: '',
  invoice_policy_note_bn: '',
  invoice_policy_note_en: '',
  delivery_time_slots: [],
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadSettings = async () => {
    try {
      const data = await apiClient<Settings>('/settings/public');
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
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
