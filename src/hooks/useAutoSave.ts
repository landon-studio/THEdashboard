import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

interface AutoSaveOptions {
  key: string;
  delay?: number;
  onSave?: (data: any) => Promise<void> | void;
  onRestore?: (data: any) => void;
  showToast?: boolean;
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasDraft: boolean;
}

/**
 * Hook for automatic form saving and recovery
 * @param data - The data to auto-save
 * @param options - Configuration options
 */
export function useAutoSave<T>(data: T, options: AutoSaveOptions) {
  const {
    key,
    delay = 2000,
    onSave,
    onRestore,
    showToast = true,
    enabled = true,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasDraft: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const saveCountRef = useRef(0);

  const storageKey = `autosave_${key}`;
  const metadataKey = `autosave_metadata_${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      const metadata = localStorage.getItem(metadataKey);
      
      if (savedData && metadata) {
        setState(prev => ({ ...prev, hasDraft: true }));
        
        if (onRestore) {
          const parsed = JSON.parse(savedData);
          const parsedMetadata = JSON.parse(metadata);
          
          // Only restore if draft is recent (within 7 days)
          const draftAge = Date.now() - new Date(parsedMetadata.timestamp).getTime();
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          
          if (draftAge < maxAge) {
            onRestore(parsed);
          } else {
            // Clear old draft
            clearDraft();
          }
        }
      }
    } catch (error) {
      console.error('Failed to check for draft:', error);
    }
  }, [storageKey, metadataKey, onRestore]);

  // Save function
  const save = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isSaving: true }));
    saveCountRef.current += 1;
    const currentSaveCount = saveCountRef.current;

    try {
      // Save to localStorage
      const serialized = JSON.stringify(dataToSave);
      const metadata = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        saveCount: currentSaveCount,
      };

      localStorage.setItem(storageKey, serialized);
      localStorage.setItem(metadataKey, JSON.stringify(metadata));

      // Call custom save handler if provided
      if (onSave) {
        await onSave(dataToSave);
      }

      // Only update state if this is still the latest save
      if (currentSaveCount === saveCountRef.current) {
        setState({
          isSaving: false,
          lastSaved: new Date(),
          hasDraft: true,
        });

        if (showToast && currentSaveCount > 1) {
          toast.success('Draft saved', {
            duration: 1500,
            position: 'bottom-right',
          });
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      
      if (showToast) {
        toast.error('Failed to save draft');
      }
    }
  }, [enabled, storageKey, metadataKey, onSave, showToast]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (!hasChanged) return;

    previousDataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(metadataKey);
      setState(prev => ({ ...prev, hasDraft: false }));
      
      if (showToast) {
        toast.success('Draft cleared');
      }
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [storageKey, metadataKey, showToast]);

  // Get saved draft
  const getDraft = useCallback((): T | null => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Failed to get draft:', error);
    }
    return null;
  }, [storageKey]);

  // Force save immediately
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return save(data);
  }, [data, save]);

  return {
    ...state,
    clearDraft,
    getDraft,
    saveNow,
  };
}

/**
 * Hook for form recovery notification
 */
export function useFormRecovery(formKey: string) {
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);

  useEffect(() => {
    const storageKey = `autosave_${formKey}`;
    const metadataKey = `autosave_metadata_${formKey}`;
    
    try {
      const savedData = localStorage.getItem(storageKey);
      const metadata = localStorage.getItem(metadataKey);
      
      if (savedData && metadata) {
        const parsedMetadata = JSON.parse(metadata);
        const draftAge = Date.now() - new Date(parsedMetadata.timestamp).getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (draftAge < maxAge) {
          setRecoveryData(JSON.parse(savedData));
          setShowRecovery(true);
        } else {
          // Clear old draft
          localStorage.removeItem(storageKey);
          localStorage.removeItem(metadataKey);
        }
      }
    } catch (error) {
      console.error('Failed to check for recovery:', error);
    }
  }, [formKey]);

  const acceptRecovery = useCallback(() => {
    setShowRecovery(false);
    return recoveryData;
  }, [recoveryData]);

  const rejectRecovery = useCallback(() => {
    const storageKey = `autosave_${formKey}`;
    const metadataKey = `autosave_metadata_${formKey}`;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(metadataKey);
    setShowRecovery(false);
    setRecoveryData(null);
  }, [formKey]);

  return {
    showRecovery,
    recoveryData,
    acceptRecovery,
    rejectRecovery,
  };
}

/**
 * Get time ago string for last saved
 */
export function getTimeAgo(date: Date | null): string {
  if (!date) return 'Never';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
