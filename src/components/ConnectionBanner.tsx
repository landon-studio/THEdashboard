import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, ExternalLink, X } from 'lucide-react';
import { utils } from '../utils/api';

interface ConnectionBannerProps {
  onRetry?: () => void;
}

export function ConnectionBanner({ onRetry }: ConnectionBannerProps) {
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const isConnected = await utils.testConnection();
      setShow(!isConnected);
      if (isConnected && onRetry) {
        onRetry();
      }
    } catch (error) {
      setShow(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!dismissed) {
      checkConnection();
      // Check every 10 seconds
      const interval = setInterval(checkConnection, 10000);
      return () => clearInterval(interval);
    }
  }, [dismissed]);

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Backend Server Offline</p>
              <p className="text-sm text-red-100">
                The Flask backend is not running. Some features may not work properly.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={checkConnection}
              disabled={checking}
              className="flex items-center gap-2 px-3 py-1 bg-red-700 hover:bg-red-800 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Retry'}
            </button>
            
            <a
              href="https://github.com/your-repo/roommate-app#quick-start"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-red-700 hover:bg-red-800 rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Help
            </a>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-red-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Quick Setup Instructions */}
        <div className="mt-3 p-3 bg-red-700/50 rounded-lg">
          <p className="text-sm font-medium text-red-100 mb-2">🔧 Quick Fix:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-red-100">
            <div>
              <strong>1. Open Terminal:</strong>
              <code className="block bg-red-800/50 px-2 py-1 rounded mt-1 font-mono text-xs">
                cd backend
              </code>
            </div>
            <div>
              <strong>2. Start Backend:</strong>
              <code className="block bg-red-800/50 px-2 py-1 rounded mt-1 font-mono text-xs">
                python start_server.py
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}