import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Info, ExternalLink } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'critical' | 'important' | 'recommended';
  completed: boolean;
  checkFunction?: () => boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ProductionChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'error-boundaries',
      title: 'Error Boundaries Implemented',
      description: 'Error boundaries wrap all major components to prevent white screen crashes',
      category: 'critical',
      completed: true,
    },
    {
      id: 'data-backup',
      title: 'Data Backup System',
      description: 'Users can export and import their data for safekeeping',
      category: 'critical',
      completed: true,
    },
    {
      id: 'auto-save',
      title: 'Form Auto-Save',
      description: 'Forms automatically save drafts to prevent data loss',
      category: 'critical',
      completed: true,
    },
    {
      id: 'input-validation',
      title: 'Input Validation',
      description: 'All user inputs are validated and sanitized',
      category: 'critical',
      completed: true,
    },
    {
      id: 'loading-states',
      title: 'Loading States',
      description: 'Comprehensive loading indicators throughout the app',
      category: 'important',
      completed: true,
    },
    {
      id: 'rate-limiting',
      title: 'API Rate Limiting',
      description: 'Rate limiting prevents API abuse and quota exhaustion',
      category: 'important',
      completed: true,
    },
    {
      id: 'gemini-api-key',
      title: 'Gemini API Key Configured',
      description: 'AI features require a valid Gemini API key',
      category: 'important',
      completed: false,
      checkFunction: () => {
        return !!localStorage.getItem('gemini_api_key');
      },
    },
    {
      id: 'onboarding-complete',
      title: 'Onboarding Completed',
      description: 'Initial setup and roommate information configured',
      category: 'important',
      completed: false,
      checkFunction: () => {
        return !!localStorage.getItem('onboardingCompleted');
      },
    },
    {
      id: 'notifications-enabled',
      title: 'Browser Notifications',
      description: 'Enable browser notifications for real-time updates',
      category: 'recommended',
      completed: false,
      checkFunction: () => {
        return Notification.permission === 'granted';
      },
      action: {
        label: 'Enable Notifications',
        onClick: async () => {
          await Notification.requestPermission();
        },
      },
    },
    {
      id: 'auto-backup',
      title: 'Regular Data Backups',
      description: 'Create regular backups of your data',
      category: 'recommended',
      completed: false,
    },
    {
      id: 'dark-mode',
      title: 'Theme Preference Set',
      description: 'Choose your preferred color theme',
      category: 'recommended',
      completed: false,
      checkFunction: () => {
        return localStorage.getItem('darkMode') !== null;
      },
    },
  ]);

  // Check completion status on mount
  useEffect(() => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.checkFunction) {
          return { ...item, completed: item.checkFunction() };
        }
        return item;
      })
    );

    // Recheck periodically
    const interval = setInterval(() => {
      setItems(prevItems =>
        prevItems.map(item => {
          if (item.checkFunction) {
            return { ...item, completed: item.checkFunction() };
          }
          return item;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const criticalItems = items.filter(i => i.category === 'critical');
  const importantItems = items.filter(i => i.category === 'important');
  const recommendedItems = items.filter(i => i.category === 'recommended');

  const criticalComplete = criticalItems.filter(i => i.completed).length;
  const importantComplete = importantItems.filter(i => i.completed).length;
  const recommendedComplete = recommendedItems.filter(i => i.completed).length;

  const totalComplete = items.filter(i => i.completed).length;
  const totalItems = items.length;
  const completionPercentage = Math.round((totalComplete / totalItems) * 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700',
        };
      case 'important':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-700',
        };
      case 'recommended':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const renderCategorySection = (title: string, items: ChecklistItem[], completed: number) => {
    if (items.length === 0) return null;

    const colors = getCategoryColor(items[0].category);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs ${colors.badge}`}>
            {completed}/{items.length} Complete
          </span>
        </div>

        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${colors.border} ${colors.bg} flex items-start gap-3 transition-all`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                
                {item.action && !item.completed && (
                  <button
                    onClick={item.action.onClick}
                    className="mt-2 text-xs px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {item.action.label}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isProductionReady = criticalComplete === criticalItems.length && importantComplete === importantItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Production Readiness</h2>
        <p className="text-gray-600">
          Track the implementation status of critical features for production deployment
        </p>
      </div>

      {/* Overall Progress */}
      <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900">Overall Progress</h3>
          <span className="text-2xl text-gray-900">{completionPercentage}%</span>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E8A587] to-[#D4956F] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          {isProductionReady ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">All critical and important items complete!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">
                {criticalItems.length - criticalComplete + importantItems.length - importantComplete} items remaining
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isProductionReady && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-green-900 mb-1">Ready for Production!</h4>
            <p className="text-sm text-green-700">
              All critical and important features are implemented. Consider completing the recommended items for the best experience.
            </p>
          </div>
        </div>
      )}

      {/* Checklist Sections */}
      {renderCategorySection('Critical Features', criticalItems, criticalComplete)}
      {renderCategorySection('Important Features', importantItems, importantComplete)}
      {renderCategorySection('Recommended Features', recommendedItems, recommendedComplete)}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-blue-900 mb-2">About Production Readiness</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Critical:</strong> Must-have features for production safety</li>
            <li>• <strong>Important:</strong> Highly recommended for optimal operation</li>
            <li>• <strong>Recommended:</strong> Nice-to-have features for better UX</li>
          </ul>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
        <h3 className="text-gray-900 mb-4">Documentation</h3>
        <div className="space-y-2">
          <a
            href="/GEMINI_AI_SETUP.md"
            className="flex items-center gap-2 text-sm text-[#E8A587] hover:text-[#D4956F] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Gemini AI Setup Guide
          </a>
          <a
            href="/QUICK_START.md"
            className="flex items-center gap-2 text-sm text-[#E8A587] hover:text-[#D4956F] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Quick Start Guide
          </a>
        </div>
      </div>
    </div>
  );
};
