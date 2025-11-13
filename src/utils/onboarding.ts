/**
 * Onboarding utilities for managing setup state and initial data
 */

export interface OnboardingData {
  houseInfo: {
    name: string;
    address: string;
    moveInDate: string;
  };
  roommates: {
    name: string;
    email: string;
    isApproved: boolean;
  }[];
  pet: {
    name: string;
    type: string;
    breed: string;
    age: string;
    notes: string;
  };
  initialRules: string[];
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    autoSyncCalendar: boolean;
  };
}

const ONBOARDING_STORAGE_KEY = 'roommate_onboarding_completed';
const ONBOARDING_DATA_KEY = 'roommate_onboarding_data';

/**
 * Check if onboarding has been completed
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 */
export function setOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding completion status:', error);
  }
}

/**
 * Save onboarding data to localStorage
 */
export function saveOnboardingData(data: OnboardingData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving onboarding data:', error);
  }
}

/**
 * Get saved onboarding data
 */
export function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(ONBOARDING_DATA_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error retrieving onboarding data:', error);
    return null;
  }
}

/**
 * Reset onboarding (for testing or re-setup)
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_DATA_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}

/**
 * Process onboarding data and save to backend/IndexedDB
 */
export async function processOnboardingData(data: OnboardingData): Promise<void> {
  try {
    // Save house rules
    if (data.initialRules.length > 0) {
      const houseRulesData = {
        rules: data.initialRules.map((rule, index) => ({
          id: `rule-${index + 1}`,
          text: rule,
          category: 'General',
          created_at: new Date().toISOString(),
          created_by: 'Setup'
        })),
        last_updated: new Date().toISOString()
      };
      
      localStorage.setItem('house_rules', JSON.stringify(houseRulesData));
    }

    // Save house information
    const houseInfoData = {
      ...data.houseInfo,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('house_info', JSON.stringify(houseInfoData));

    // Save roommates information
    const roommatesData = {
      roommates: data.roommates.filter(r => r.name.trim() && r.email.trim()),
      last_updated: new Date().toISOString()
    };
    localStorage.setItem('roommates_info', JSON.stringify(roommatesData));

    // Save pet information
    if (data.pet.name.trim()) {
      const petData = {
        ...data.pet,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('pet_info', JSON.stringify(petData));
    }

    // Apply preferences immediately
    if (data.preferences.darkMode) {
      localStorage.setItem('darkMode', 'true');
      document.documentElement.classList.add('dark');
    }

    // Create some sample data for demonstration
    createSampleData();
    
    console.log('✅ Onboarding data processed successfully');
  } catch (error) {
    console.error('❌ Error processing onboarding data:', error);
    throw error;
  }
}

/**
 * Create initial sample data for demo purposes
 */
export function createSampleData(): void {
  try {
    // Sample welcome message
    const existingMessages = localStorage.getItem('dashboard_messages');
    if (!existingMessages) {
      const welcomeMessage = {
        id: 'welcome-message',
        text: '🎉 Welcome to your new roommate dashboard! Everything is set up and ready to go.',
        author: 'System',
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      localStorage.setItem('dashboard_messages', JSON.stringify([welcomeMessage]));
    }

    // Sample quick note
    const existingNotes = localStorage.getItem('notes');
    if (!existingNotes) {
      const welcomeNote = {
        id: 'welcome-note-1',
        content: 'Welcome! 👋\n\nYour dashboard is ready! Start by exploring the different sections and adding your first entries.',
        color: 'bg-gradient-to-br from-purple-400 to-pink-400',
        x: 100,
        y: 100,
        author: 'System',
        timestamp: new Date().toISOString(),
        reactions: []
      };
      localStorage.setItem('notes', JSON.stringify([welcomeNote]));
    }

    console.log('📝 Sample data created');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}