import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BackupData {
  version: string;
  timestamp: string;
  data: {
    localStorage: Record<string, any>;
    indexedDB: Record<string, any>;
  };
  metadata: {
    appVersion: string;
    userAgent: string;
    exportedBy: string;
  };
}

const CURRENT_VERSION = '1.0.0';

/**
 * Export all application data to JSON
 */
export async function exportAllData(): Promise<string> {
  try {
    const backupData: BackupData = {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        localStorage: {},
        indexedDB: {},
      },
      metadata: {
        appVersion: CURRENT_VERSION,
        userAgent: navigator.userAgent,
        exportedBy: localStorage.getItem('currentUser') || 'unknown',
      },
    };

    // Export localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            backupData.data.localStorage[key] = JSON.parse(value);
          }
        } catch {
          // If not JSON, store as string
          backupData.data.localStorage[key] = localStorage.getItem(key);
        }
      }
    }

    // Export IndexedDB
    try {
      const db = await openDB('RoommateDB', 1);
      const storeNames = Array.from(db.objectStoreNames);
      
      for (const storeName of storeNames) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const allData = await store.getAll();
        backupData.data.indexedDB[storeName] = allData;
      }
      
      db.close();
    } catch (error) {
      console.warn('IndexedDB export failed:', error);
    }

    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data: ' + (error as Error).message);
  }
}

/**
 * Download exported data as JSON file
 */
export function downloadBackup(data: string, filename?: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `roommate-dashboard-backup-${timestamp}.json`;
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import data from backup file
 */
export async function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const backupData: BackupData = JSON.parse(jsonString);

    // Validate backup structure
    if (!backupData.version || !backupData.data) {
      throw new Error('Invalid backup file format');
    }

    // Version compatibility check
    if (backupData.version !== CURRENT_VERSION) {
      console.warn('Backup version mismatch. Attempting migration...');
    }

    // Create backup of current data before importing
    const currentBackup = await exportAllData();
    sessionStorage.setItem('pre_import_backup', currentBackup);

    // Import localStorage
    if (backupData.data.localStorage) {
      Object.entries(backupData.data.localStorage).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
          console.error(`Failed to import localStorage key ${key}:`, error);
        }
      });
    }

    // Import IndexedDB
    if (backupData.data.indexedDB) {
      try {
        const db = await openDB('RoommateDB', 1);
        
        for (const [storeName, data] of Object.entries(backupData.data.indexedDB)) {
          if (Array.isArray(data) && db.objectStoreNames.contains(storeName)) {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            
            // Clear existing data
            await store.clear();
            
            // Import new data
            for (const item of data) {
              await store.add(item);
            }
          }
        }
        
        db.close();
      } catch (error) {
        console.error('IndexedDB import failed:', error);
        throw error;
      }
    }

    return {
      success: true,
      message: 'Data imported successfully. Please refresh the page.',
    };
  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      message: 'Failed to import data: ' + (error as Error).message,
    };
  }
}

/**
 * Restore from pre-import backup (if import fails)
 */
export async function restorePreImportBackup(): Promise<boolean> {
  try {
    const backup = sessionStorage.getItem('pre_import_backup');
    if (!backup) {
      return false;
    }

    await importData(backup);
    sessionStorage.removeItem('pre_import_backup');
    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
}

/**
 * Create automatic backup (can be called periodically)
 */
export async function createAutoBackup(): Promise<void> {
  try {
    const backupData = await exportAllData();
    const backupKey = `auto_backup_${Date.now()}`;
    
    // Store in sessionStorage (temporary) or IndexedDB for persistence
    sessionStorage.setItem('last_auto_backup', backupData);
    
    // Keep only last 5 auto backups in localStorage
    const autoBackups = JSON.parse(localStorage.getItem('auto_backups') || '[]');
    autoBackups.push({
      key: backupKey,
      timestamp: new Date().toISOString(),
    });
    
    if (autoBackups.length > 5) {
      const removed = autoBackups.shift();
      sessionStorage.removeItem(removed.key);
    }
    
    localStorage.setItem('auto_backups', JSON.stringify(autoBackups));
    console.log('Auto backup created successfully');
  } catch (error) {
    console.error('Auto backup failed:', error);
  }
}

/**
 * Validate backup file before import
 */
export function validateBackupFile(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!file.name.endsWith('.json')) {
      resolve({ valid: false, error: 'File must be a JSON file' });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      resolve({ valid: false, error: 'File size exceeds 50MB limit' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.version || !data.data) {
          resolve({ valid: false, error: 'Invalid backup file structure' });
          return;
        }

        resolve({ valid: true });
      } catch (error) {
        resolve({ valid: false, error: 'Failed to parse JSON file' });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}

/**
 * Get backup statistics
 */
export function getBackupStats(): {
  lastBackup: string | null;
  autoBackupCount: number;
  estimatedSize: string;
} {
  const autoBackups = JSON.parse(localStorage.getItem('auto_backups') || '[]');
  const lastBackup = autoBackups.length > 0 
    ? autoBackups[autoBackups.length - 1].timestamp 
    : null;

  // Estimate size of data
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      totalSize += (localStorage.getItem(key) || '').length;
    }
  }

  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);

  return {
    lastBackup,
    autoBackupCount: autoBackups.length,
    estimatedSize: `${sizeInMB} MB`,
  };
}
