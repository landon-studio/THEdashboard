import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isOnboardingCompleted, setOnboardingCompleted, processOnboardingData, OnboardingData } from '../utils/onboarding';

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isEditMode: boolean;
  toggleEditMode: () => void;
  editingSection: string | null;
  setEditingSection: (section: string | null) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return isOnboardingCompleted();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      setEditingSection(null);
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    try {
      await processOnboardingData(data);
      setOnboardingCompleted();
      setIsOnboardingComplete(true);
      
      // Apply dark mode preference immediately
      if (data.preferences.darkMode !== isDarkMode) {
        setIsDarkMode(data.preferences.darkMode);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      isEditMode,
      toggleEditMode,
      editingSection,
      setEditingSection,
      isOnboardingComplete,
      completeOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
};