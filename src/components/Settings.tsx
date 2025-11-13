import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  AlertTriangle,
  Phone,
  Heart,
  Brain,
  Calendar,
  FileText,
  MapPin,
  Clock,
  Users,
  Pill,
  Shield,
  Info,
  Edit3,
  Save,
  X,
  Mail,
  RefreshCw,
  Trash2,
  Bell
} from 'lucide-react';
import { MessageManager } from './MessageManager';
import { NotificationSettings } from './NotificationSettings';
import { DataBackupManager } from './DataBackupManager';
import { ErrorLogViewer } from './ErrorBoundary';
import { ProductionChecklist } from './ProductionChecklist';
import { resetOnboarding } from '../utils/onboarding';

interface CrisisPlan {
  id: string;
  type: string;
  description: string;
  contacts: { name: string; phone: string; role: string }[];
  steps: string[];
  resources: string[];
}

interface PracticalInfo {
  id: string;
  category: string;
  items: { label: string; value: string; editable?: boolean }[];
}

function SystemSettings() {
  const handleResetOnboarding = () => {
    if (window.confirm('Are you sure you want to reset the onboarding? This will require you to go through the setup process again.')) {
      resetOnboarding();
      window.location.reload();
    }
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  return (
    <div className="space-y-6">
      {/* Reset Onboarding */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl text-gray-800 dark:text-gray-200">Reset Onboarding</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Reset the dashboard setup and go through the onboarding process again. This will not delete your existing data like photos, notes, or expenses.
        </p>
        <button
          onClick={handleResetOnboarding}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Setup
        </button>
      </div>

      {/* Clear All Data */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-red-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h3 className="text-xl text-gray-800 dark:text-gray-200">Danger Zone</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          <strong>Warning:</strong> This will permanently delete all your data including photos, notes, expenses, check-ins, and all settings. This action cannot be undone.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you ABSOLUTELY sure? This will delete ALL data and cannot be undone.')) {
              if (window.confirm('Last chance! Click OK to permanently delete everything.')) {
                localStorage.clear();
                indexedDB.deleteDatabase('RoommateApp');
                window.location.reload();
              }
            }
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete All Data
        </button>
      </div>

      {/* App Information */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl text-gray-800 dark:text-gray-200">App Information</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Storage:</strong> Local Browser Storage (IndexedDB)</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<'crisis' | 'messages' | 'notifications' | 'backup' | 'errors' | 'production' | 'system'>('crisis');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [crisisPlans, setCrisisPlans] = useState<CrisisPlan[]>([
    {
      id: 'mental-health',
      type: 'Mental Health Crisis',
      description: 'When Landon is struggling with mental health challenges',
      contacts: [
        { name: 'Therapist', phone: '[To be provided]', role: 'Primary support' },
        { name: 'Crisis Line', phone: '988', role: 'Emergency' },
        { name: 'Trusted Friend in NY', phone: '[To be provided]', role: 'Secondary support' }
      ],
      steps: [
        'Recognize warning signs: withdrawal, mood changes, isolation',
        'Landon should reach out to therapist or crisis line (NOT roommates)',
        'Roommates can offer general support but are not primary caregivers',
        'If immediate danger, call 911'
      ],
      resources: ['988 Suicide & Crisis Lifeline', 'SFGH Crisis Services', 'Local crisis center']
    },
    {
      id: 'substance-emergency',
      type: 'Substance-Related Emergency',
      description: 'Signs of overdose or substance-related crisis',
      contacts: [
        { name: 'Emergency', phone: '911', role: 'Immediate emergency' },
        { name: 'Trusted Friend', phone: '[To be provided]', role: 'After emergency handled' }
      ],
      steps: [
        'Signs of overdose: difficulty breathing, blue lips/fingernails, unconsciousness, slow pulse',
        'Naloxone location: [Specific spot in house]',
        'Call 911 immediately if signs present',
        'Notify trusted friend after emergency is handled',
        'Nick/Alex are NOT primary support - crisis resources handle this'
      ],
      resources: ['Naloxone (location TBD)', 'Good Samaritan Law info', 'Local emergency services']
    },
    {
      id: 'kepler-emergency',
      type: 'Kepler Emergency',
      description: 'Pet emergency while Landon is away or unavailable',
      contacts: [
        { name: 'Emergency Vet', phone: '[To be provided]', role: 'Pet emergency' },
        { name: 'Landon', phone: '[To be provided]', role: 'Pet owner' }
      ],
      steps: [
        'Assess severity of situation',
        'Contact emergency vet if serious',
        'Call/text Landon immediately',
        'Follow specific care instructions provided'
      ],
      resources: ['Emergency vet contact info', 'Pet insurance info', 'Kepler\'s medical history']
    }
  ]);

  const [practicalInfo, setPracticalInfo] = useState<PracticalInfo[]>([
    {
      id: 'eviction-case',
      category: 'Landon\'s Legal Situation',
      items: [
        { label: 'Attorney Name', value: '[To be provided]', editable: true },
        { label: 'Attorney Phone', value: '[To be provided]', editable: true },
        { label: 'Court Dates', value: '[When Landon will be unavailable/stressed]', editable: true },
        { label: 'Mail Handling', value: '[Instructions for roommates]', editable: true }
      ]
    },
    {
      id: 'texas-trip',
      category: 'Texas Trip (Oct 14-21)',
      items: [
        { label: 'Landon\'s Availability', value: 'Different time zone, limited contact', editable: true },
        { label: 'Emergency Contact Only', value: 'When to actually reach out', editable: true },
        { label: 'Apartment Access', value: 'Do Nick/Alex need anything from his room?', editable: true },
        { label: 'Mail/Packages', value: 'Hold or forward instructions', editable: true }
      ]
    },
    {
      id: 'schedules',
      category: 'Important Schedules',
      items: [
        { label: 'Therapy', value: '[Landon\'s regular schedule]', editable: true },
        { label: 'Support Groups', value: 'Express Yourself Mondays, others TBD', editable: true },
        { label: 'Job Interviews', value: '[When Landon needs privacy/quiet]', editable: true },
        { label: 'Unemployment End Date', value: '[When benefits end]', editable: true }
      ]
    },
    {
      id: 'access-info',
      category: 'Access & Passwords',
      items: [
        { label: 'WiFi Password', value: '[If Landon contributing]', editable: true },
        { label: 'Streaming Services', value: '[What Landon is sharing]', editable: true },
        { label: 'Building Access', value: '[Keys, codes, mailbox]', editable: true },
        { label: 'Emergency Key Location', value: '[For emergencies]', editable: true }
      ]
    }
  ]);

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const startEdit = (category: string, itemIndex: number, currentValue: string) => {
    setEditingItem(`${category}-${itemIndex}`);
    setEditValue(currentValue);
  };

  const saveEdit = (category: string, itemIndex: number) => {
    setPracticalInfo(prev => prev.map(section => {
      if (section.id === category) {
        const newItems = [...section.items];
        newItems[itemIndex] = { ...newItems[itemIndex], value: editValue };
        return { ...section, items: newItems };
      }
      return section;
    }));
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const getCrisisIcon = (type: string) => {
    if (type.includes('Mental Health')) return <Brain className="w-5 h-5 text-blue-600" />;
    if (type.includes('Substance')) return <Pill className="w-5 h-5 text-red-600" />;
    if (type.includes('Kepler')) return <Heart className="w-5 h-5 text-purple-600" />;
    return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Legal')) return <FileText className="w-5 h-5 text-red-600" />;
    if (category.includes('Texas')) return <MapPin className="w-5 h-5 text-orange-600" />;
    if (category.includes('Schedules')) return <Calendar className="w-5 h-5 text-blue-600" />;
    if (category.includes('Access')) return <Shield className="w-5 h-5 text-green-600" />;
    return <Info className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Settings & Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Crisis plans, emergency info, and message management.</p>
        </div>
        <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30 dark:border-white/10" style={glassStyle}>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl p-2 shadow-xl" style={glassStyle}>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('crisis')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'crisis'
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <Shield className="w-5 h-5" />
            Crisis Plans & Info
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <Mail className="w-5 h-5" />
            Message Management
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-[#E8A587] to-[#D4956F] text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <Save className="w-5 h-5" />
            Data Backup
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'errors'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Errors
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'production'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <Shield className="w-5 h-5" />
            Production
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'system'
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            System
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' ? (
        <MessageManager />
      ) : activeTab === 'notifications' ? (
        <NotificationSettings />
      ) : activeTab === 'backup' ? (
        <DataBackupManager />
      ) : activeTab === 'errors' ? (
        <ErrorLogViewer />
      ) : activeTab === 'production' ? (
        <ProductionChecklist />
      ) : activeTab === 'system' ? (
        <SystemSettings />
      ) : (
        <div className="space-y-6">
          {/* Important Notice */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-red-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-xl text-gray-800">Important: Crisis Response Guidelines</h3>
        </div>
        <div className="bg-red-50/30 p-4 rounded-lg border border-red-200/30">
          <p className="text-red-700 mb-3">
            <strong>Nick and Alex are NOT primary crisis support for Landon.</strong> They are roommates providing housing, not caregivers or therapists.
          </p>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Landon has professional support systems in place</li>
            <li>• In emergencies, call professional resources (911, 988, therapist)</li>
            <li>• Roommates can offer general support but should not take on therapeutic roles</li>
            <li>• Everyone has clear boundaries and responsibilities</li>
          </ul>
        </div>
      </div>

      {/* Crisis Plans */}
      <div className="space-y-6">
        <h3 className="text-xl text-gray-800">Crisis Response Plans</h3>
        {crisisPlans.map(plan => (
          <div key={plan.id} className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
            <div className="flex items-center gap-3 mb-4">
              {getCrisisIcon(plan.type)}
              <h4 className="text-lg text-gray-800">{plan.type}</h4>
            </div>
            <p className="text-gray-700 mb-6">{plan.description}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Emergency Contacts */}
              <div>
                <h5 className="text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Emergency Contacts
                </h5>
                <div className="space-y-3">
                  {plan.contacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-blue-50/30 rounded-lg border border-blue-200/30">
                      <div className="text-sm">
                        <div className="text-blue-800 font-medium">{contact.name}</div>
                        <div className="text-blue-700">{contact.phone}</div>
                        <div className="text-blue-600 text-xs">{contact.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Steps */}
              <div>
                <h5 className="text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  Action Steps
                </h5>
                <div className="space-y-2">
                  {plan.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h5 className="text-gray-800 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Resources
                </h5>
                <div className="space-y-2">
                  {plan.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Practical Information */}
      <div className="space-y-6">
        <h3 className="text-xl text-gray-800">Practical Information</h3>
        {practicalInfo.map(section => (
          <div key={section.id} className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
            <div className="flex items-center gap-3 mb-4">
              {getCategoryIcon(section.category)}
              <h4 className="text-lg text-gray-800">{section.category}</h4>
            </div>
            
            <div className="space-y-3">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">{item.label}:</span>
                    {editingItem === `${section.id}-${index}` ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => saveEdit(section.id, index)}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-700">{item.value}</span>
                        {item.editable && (
                          <button
                            onClick={() => startEdit(section.id, index, item.value)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support Network */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-green-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-green-600" />
          <h4 className="text-lg text-gray-800">Landon's Support Network (NOT Roommates)</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/30">
            <h5 className="text-green-800 mb-2">Professional Support</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Therapist: [Name, emergency contact]</li>
              <li>• Support groups: Express Yourself Mondays</li>
              <li>• Crisis line: 988</li>
              <li>• Healthcare providers: [TBD]</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/30">
            <h5 className="text-green-800 mb-2">Personal Support</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Best friend in NY: [Name, phone]</li>
              <li>• Family members: [If applicable]</li>
              <li>• Other trusted friends: [TBD]</li>
              <li>• Peer support contacts: [TBD]</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
          <p className="text-sm text-yellow-700">
            <strong>Remember:</strong> Nick and Alex provide housing and general roommate support. 
            Professional and personal support networks handle crisis intervention and therapeutic needs.
          </p>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}