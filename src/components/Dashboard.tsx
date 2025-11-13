import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock,
  Home,
  Heart,
  CheckCircle,
  AlertTriangle,
  Phone,
  Shield,
  Zap,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { EditableSection } from './EditableSection';
import { loadData, saveData } from '../utils/mockBackend';
import { QuickInsights } from './analytics/QuickInsights';

interface Resident {
  id: string;
  name: string;
  role: string;
  status: string;
  avatar: string;
  isPet?: boolean;
}

interface ImportantDate {
  id: string;
  title: string;
  description: string;
  date: string;
  color: string;
}

export function Dashboard() {
  const { isEditMode, editingSection, setEditingSection } = useAppContext();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // Editable data state
  const [residents, setResidents] = useState<Resident[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [houseInfo, setHouseInfo] = useState({
    totalResidents: 4,
    reviewSchedule: 'Monthly',
    reviewDate: 'First Sunday of each month',
    houseRulesStatus: 'Active',
    houseRulesDescription: 'Established & documented'
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await loadData('dashboard');
      if (dashboardData) {
        setResidents(dashboardData.residents || getDefaultResidents());
        setImportantDates(dashboardData.importantDates || getDefaultImportantDates());
        setHouseInfo(dashboardData.houseInfo || houseInfo);
      } else {
        // Set default data
        setResidents(getDefaultResidents());
        setImportantDates(getDefaultImportantDates());
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setResidents(getDefaultResidents());
      setImportantDates(getDefaultImportantDates());
    }
  };

  const getDefaultResidents = (): Resident[] => [
    {
      id: '1',
      name: 'Nick',
      role: 'Original resident',
      status: 'Permanent',
      avatar: 'N'
    },
    {
      id: '2',
      name: 'Alex',
      role: 'Partner resident',
      status: 'Permanent',
      avatar: 'A'
    },
    {
      id: '3',
      name: 'Landon',
      role: 'Temporary resident',
      status: 'Temporary',
      avatar: 'L'
    },
    {
      id: '4',
      name: 'Kepler',
      role: 'The dog - family member',
      status: 'Pet',
      avatar: '🐕',
      isPet: true
    }
  ];

  const getDefaultImportantDates = (): ImportantDate[] => [
    {
      id: '1',
      title: 'Move-in Date',
      description: "Landon's arrival",
      date: getCurrentDate(),
      color: 'blue'
    },
    {
      id: '2',
      title: 'Agreement Date',
      description: 'House rules established',
      date: 'TBD',
      color: 'green'
    },
    {
      id: '3',
      title: 'Next Review',
      description: 'Monthly check-in',
      date: getNextSunday(),
      color: 'purple'
    },
    {
      id: '4',
      title: 'Texas Trip',
      description: 'Landon away (Oct 14-21)',
      date: 'Oct 14-21',
      color: 'orange'
    }
  ];

  const saveDashboardData = async () => {
    try {
      await saveData('dashboard', {
        residents,
        importantDates,
        houseInfo
      });
    } catch (error) {
      console.error('Error saving dashboard data:', error);
    }
  };
  
  // Glassmorphism styles with dark mode support
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getNextSunday = () => {
    const today = new Date();
    const nextSunday = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7;
    nextSunday.setDate(today.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    return nextSunday.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[#676767] to-[#E8A587] bg-clip-text text-transparent">
            Home Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Roommate life organizer for a harmonious living space.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <button
              onClick={() => setEditingSection(editingSection === 'dashboard' ? null : 'dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                editingSection === 'dashboard'
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-white/10 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-black/30'
              }`}
            >
              {editingSection === 'dashboard' ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editingSection === 'dashboard' ? 'Save' : 'Edit'}
            </button>
          )}
          <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30 dark:border-white/10" style={glassStyle}>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Last updated: {getCurrentDate()}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <QuickInsights />

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in cursor-pointer" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E8A587] to-[#D4A895] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl text-gray-800 dark:text-gray-200">4</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Residents Total</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Nick, Alex, Landon & Kepler</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C99A82] to-[#B89181] rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-blue-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Set</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg text-gray-800 dark:text-gray-200">Monthly</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review Schedule</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">First Sunday of each month</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A88D7D] to-[#8B7A6E] rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg text-gray-800">House Rules</h3>
            <p className="text-sm text-gray-600 mt-1">Agreement Status</p>
            <p className="text-xs text-gray-500 mt-1">Established & documented</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4A895] to-[#C77A5F] rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-orange-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Soon</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg text-gray-800">Next Review</h3>
            <p className="text-sm text-gray-600 mt-1">Upcoming Check-in</p>
            <p className="text-xs text-gray-500 mt-1">{getNextSunday()}</p>
          </div>
        </div>
      </div>

      {/* Resident Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EditableSection
          sectionId="residents"
          onSave={saveDashboardData}
          editComponent={<ResidentsEditForm residents={residents} setResidents={setResidents} />}
        >
          <div className="rounded-2xl p-6 shadow-xl animate-fade-in" style={glassStyle}>
            <h3 className="text-lg text-gray-800 dark:text-gray-200 mb-6">Residents</h3>
            <div className="space-y-4">
              {residents.map((resident) => {
                const getAvatarGradient = (name: string) => {
                  const gradients = {
                    'Nick': 'from-[#E8A587] to-[#D4A895]',
                    'Alex': 'from-[#C99A82] to-[#B89181]',
                    'Landon': 'from-[#A88D7D] to-[#8B7A6E]',
                    'Kepler': 'from-[#D4A895] to-[#C77A5F]'
                  };
                  return gradients[name as keyof typeof gradients] || 'from-gray-400 to-gray-500';
                };

                const getStatusColor = (status: string) => {
                  const colors = {
                    'Permanent': 'bg-green-100 text-green-700',
                    'Temporary': 'bg-yellow-100 text-yellow-700',
                    'Pet': 'bg-purple-100 text-purple-700'
                  };
                  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
                };

                return (
                  <div key={resident.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarGradient(resident.name)} rounded-xl flex items-center justify-center`}>
                      {resident.isPet ? (
                        <Heart className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white text-sm font-medium">{resident.avatar}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-800 dark:text-gray-200">{resident.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{resident.role}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(resident.status)}`}>
                      {resident.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </EditableSection>

        {/* Key Dates */}
        <EditableSection
          sectionId="important-dates"
          onSave={saveDashboardData}
          editComponent={<ImportantDatesEditForm importantDates={importantDates} setImportantDates={setImportantDates} />}
        >
          <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
            <h3 className="text-lg text-gray-800 dark:text-gray-200 mb-6">Important Dates</h3>
            <div className="space-y-4">
              {importantDates.map((date) => {
                const getColorClass = (color: string) => {
                  const colors = {
                    'blue': 'bg-blue-500',
                    'green': 'bg-green-500',
                    'purple': 'bg-purple-500',
                    'orange': 'bg-orange-500',
                    'red': 'bg-red-500',
                    'teal': 'bg-teal-500'
                  };
                  return colors[color as keyof typeof colors] || 'bg-gray-500';
                };

                return (
                  <div key={date.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${getColorClass(date.color)} rounded-full`}></div>
                      <div>
                        <h4 className="text-gray-800 dark:text-gray-200">{date.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{date.description}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{date.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </EditableSection>
      </div>

      {/* Emergency Quick Access */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-red-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-red-600" />
          <h3 className="text-lg text-gray-800">Emergency Quick Access</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-3 p-4 bg-red-100/50 border border-red-200/50 rounded-xl hover:bg-red-200/50 transition-colors"
          >
            <Phone className="w-6 h-6 text-red-600" />
            <div className="text-left">
              <div className="text-red-800">Emergency Contacts</div>
              <div className="text-sm text-red-600">911, Crisis Line, Vet</div>
            </div>
          </button>
          <button 
            onClick={() => window.open('tel:988')}
            className="flex items-center gap-3 p-4 bg-blue-100/50 border border-blue-200/50 rounded-xl hover:bg-blue-200/50 transition-colors"
          >
            <Zap className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <div className="text-blue-800">Crisis Line</div>
              <div className="text-sm text-blue-600">988 - Call Now</div>
            </div>
          </button>
          <button 
            onClick={() => window.open('tel:911')}
            className="flex items-center gap-3 p-4 bg-orange-100/50 border border-orange-200/50 rounded-xl hover:bg-orange-200/50 transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <div className="text-orange-800">Emergency Services</div>
              <div className="text-sm text-orange-600">911 - Emergency</div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <h3 className="text-lg text-gray-800 mb-6">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-700">Weekly Check-ins</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Home className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-700">House Rules</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Heart className="w-6 h-6 text-red-600" />
            <span className="text-sm text-gray-700">Kepler Care</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Users className="w-6 h-6 text-teal-600" />
            <span className="text-sm text-gray-700">Chores</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <span className="text-sm text-gray-700">Crisis Plans</span>
          </button>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 shadow-xl max-w-md w-full" style={glassStyle}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-red-800">Emergency Contacts</h3>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ❌
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50/30 rounded-lg border border-red-200/30">
                <h4 className="text-red-800 mb-2">Emergency Services</h4>
                <button 
                  onClick={() => window.open('tel:911')}
                  className="w-full text-left text-red-700 hover:text-red-800"
                >
                  📞 911 - Police, Fire, Medical
                </button>
              </div>
              
              <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
                <h4 className="text-blue-800 mb-2">Crisis Support</h4>
                <button 
                  onClick={() => window.open('tel:988')}
                  className="w-full text-left text-blue-700 hover:text-blue-800"
                >
                  📞 988 - Crisis Lifeline
                </button>
              </div>
              
              <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/30">
                <h4 className="text-green-800 mb-2">Pet Emergency</h4>
                <p className="text-green-700 text-sm">Emergency Vet: [To be added]</p>
              </div>
              
              <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
                <h4 className="text-yellow-800 mb-2">Poison Control</h4>
                <button 
                  onClick={() => window.open('tel:18002221222')}
                  className="w-full text-left text-yellow-700 hover:text-yellow-800"
                >
                  📞 1-800-222-1222
                </button>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-red-50/30 rounded-lg border border-red-200/30">
              <p className="text-sm text-red-700">
                <strong>Remember:</strong> For mental health or substance crises, Landon should contact professional support first, not roommates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit form components
function ResidentsEditForm({ residents, setResidents }: { residents: Resident[], setResidents: (residents: Resident[]) => void }) {
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const addNewResident = () => {
    const newResident: Resident = {
      id: Date.now().toString(),
      name: '',
      role: '',
      status: 'Permanent',
      avatar: ''
    };
    setEditingResident(newResident);
    setIsAddingNew(true);
  };

  const saveResident = () => {
    if (!editingResident || !editingResident.name.trim()) return;

    if (isAddingNew) {
      setResidents([...residents, { ...editingResident, avatar: editingResident.name.charAt(0).toUpperCase() }]);
    } else {
      setResidents(residents.map(r => r.id === editingResident.id ? editingResident : r));
    }
    
    setEditingResident(null);
    setIsAddingNew(false);
  };

  const deleteResident = (id: string) => {
    setResidents(residents.filter(r => r.id !== id));
  };

  const cancelEdit = () => {
    setEditingResident(null);
    setIsAddingNew(false);
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-gray-800 dark:text-gray-200">Edit Residents</h3>
        <button
          onClick={addNewResident}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Resident
        </button>
      </div>

      <div className="space-y-4">
        {residents.map((resident) => (
          <div key={resident.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex-1">
              <h4 className="text-gray-800 dark:text-gray-200">{resident.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{resident.role}</p>
              <span className="text-xs text-gray-500 dark:text-gray-500">{resident.status}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingResident(resident)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {!resident.isPet && (
                <button
                  onClick={() => deleteResident(resident.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingResident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 shadow-xl max-w-md w-full" style={glassStyle}>
            <h4 className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              {isAddingNew ? 'Add New Resident' : 'Edit Resident'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editingResident.name}
                  onChange={(e) => setEditingResident({ ...editingResident, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <input
                  type="text"
                  value={editingResident.role}
                  onChange={(e) => setEditingResident({ ...editingResident, role: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Original resident, Partner resident"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={editingResident.status}
                  onChange={(e) => setEditingResident({ ...editingResident, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Pet">Pet</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveResident}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImportantDatesEditForm({ importantDates, setImportantDates }: { importantDates: ImportantDate[], setImportantDates: (dates: ImportantDate[]) => void }) {
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const addNewDate = () => {
    const newDate: ImportantDate = {
      id: Date.now().toString(),
      title: '',
      description: '',
      date: '',
      color: 'blue'
    };
    setEditingDate(newDate);
    setIsAddingNew(true);
  };

  const saveDate = () => {
    if (!editingDate || !editingDate.title.trim()) return;

    if (isAddingNew) {
      setImportantDates([...importantDates, editingDate]);
    } else {
      setImportantDates(importantDates.map(d => d.id === editingDate.id ? editingDate : d));
    }
    
    setEditingDate(null);
    setIsAddingNew(false);
  };

  const deleteDate = (id: string) => {
    setImportantDates(importantDates.filter(d => d.id !== id));
  };

  const cancelEdit = () => {
    setEditingDate(null);
    setIsAddingNew(false);
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-gray-800 dark:text-gray-200">Edit Important Dates</h3>
        <button
          onClick={addNewDate}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Date
        </button>
      </div>

      <div className="space-y-4">
        {importantDates.map((date) => (
          <div key={date.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className={`w-3 h-3 bg-${date.color}-500 rounded-full`}></div>
            <div className="flex-1">
              <h4 className="text-gray-800 dark:text-gray-200">{date.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{date.description}</p>
              <span className="text-xs text-gray-500 dark:text-gray-500">{date.date}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingDate(date)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteDate(date.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 shadow-xl max-w-md w-full" style={glassStyle}>
            <h4 className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              {isAddingNew ? 'Add New Date' : 'Edit Important Date'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={editingDate.title}
                  onChange={(e) => setEditingDate({ ...editingDate, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={editingDate.description}
                  onChange={(e) => setEditingDate({ ...editingDate, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="text"
                  value={editingDate.date}
                  onChange={(e) => setEditingDate({ ...editingDate, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter date (e.g., Oct 14-21, TBD)"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <select
                  value={editingDate.color}
                  onChange={(e) => setEditingDate({ ...editingDate, color: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="red">Red</option>
                  <option value="teal">Teal</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveDate}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}