import React, { useEffect, useState } from 'react';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { getTimeAgo } from '../hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error?: string | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  lastSaved,
  error,
  className = '',
}) => {
  const [timeAgo, setTimeAgo] = useState(() => getTimeAgo(lastSaved));

  // Update time ago every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(lastSaved));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaved]);

  // Update immediately when lastSaved changes
  useEffect(() => {
    setTimeAgo(getTimeAgo(lastSaved));
  }, [lastSaved]);

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Save failed</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <Check className="w-4 h-4" />
        <span>Saved {timeAgo}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-400 ${className}`}>
      <Save className="w-4 h-4" />
      <span>Not saved</span>
    </div>
  );
};

// Recovery banner component
interface RecoveryBannerProps {
  onAccept: () => void;
  onReject: () => void;
  timestamp?: string;
}

export const RecoveryBanner: React.FC<RecoveryBannerProps> = ({
  onAccept,
  onReject,
  timestamp,
}) => {
  const timeAgo = timestamp ? getTimeAgo(new Date(timestamp)) : 'recently';

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Save className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      
      <div className="flex-1">
        <h4 className="text-gray-900 mb-1">Draft Found</h4>
        <p className="text-sm text-gray-600 mb-3">
          We found a draft that was saved {timeAgo}. Would you like to restore it?
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Restore Draft
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};
