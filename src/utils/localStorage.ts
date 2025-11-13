/**
 * Local Storage utility for persisting home management data
 */

export interface StoredData {
  checkins: any[];
  chores: any[];
  expenses: any[];
  notes: any[];
  photos: any[];
  lastUpdated: string;
}

const STORAGE_KEY = 'home-manager-data';

export const localStorageUtil = {
  // Get all stored data
  getData: (): Partial<StoredData> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {};
    }
  },

  // Save specific data type
  saveData: (key: keyof StoredData, data: any) => {
    try {
      const currentData = localStorageUtil.getData();
      const updatedData = {
        ...currentData,
        [key]: data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get specific data type
  getDataByKey: (key: keyof StoredData) => {
    const data = localStorageUtil.getData();
    return data[key] || [];
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Export data for backup
  exportData: () => {
    const data = localStorageUtil.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import data from backup
  importData: (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};