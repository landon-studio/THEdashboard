import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Home, 
  Heart, 
  MessageSquare, 
  Settings,
  Users,
  Calendar,
  DollarSign,
  StickyNote,
  Camera,
  Info,
  Moon,
  Sun,
  Edit3,
  Save,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { isDarkMode, toggleDarkMode, isEditMode, toggleEditMode } = useAppContext();
  
  const menuItems = [
    { id: 'dashboard', label: 'AI Assistant', icon: Sparkles },
    { id: 'traditional', label: 'Traditional Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics & Insights', icon: TrendingUp },
    { id: 'checkins', label: 'Weekly Check-ins', icon: CheckSquare },
    { id: 'rules', label: 'House Rules', icon: Home },
    { id: 'kepler', label: 'Kepler\'s Care', icon: Heart },
    { id: 'chores', label: 'Chores & Communication', icon: MessageSquare },
    { id: 'calendar', label: 'Shared Calendar', icon: Calendar },
    { id: 'expenses', label: 'Expense Tracker', icon: DollarSign },
    { id: 'notes', label: 'Notes Board', icon: StickyNote },
    { id: 'photos', label: 'Photo Gallery', icon: Camera },
    { id: 'settings', label: 'Crisis Plans & Info', icon: Settings },
  ];

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(20px)',
    background: isDarkMode 
      ? 'rgba(15, 23, 42, 0.85)' 
      : 'rgba(255, 255, 255, 0.15)',
    border: isDarkMode 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: isDarkMode 
      ? '0 12px 40px rgba(0, 0, 0, 0.5)' 
      : '0 12px 40px rgba(31, 38, 135, 0.2)'
  };

  return (
    <aside className="w-64 shadow-2xl" style={glassStyle}>
      {/* Header */}
      <div className="p-6 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E8A587] to-[#C99A82] rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg text-gray-800 dark:text-gray-200">Home Manager</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Roommate Life Organizer</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200 hover:scale-105"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>
          
          <button
            onClick={toggleEditMode}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isEditMode 
                ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                : 'bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 text-gray-600 dark:text-gray-400'
            }`}
            title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          >
            {isEditMode ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2 rounded-[57px]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-[#E8A587] to-[#C99A82] text-white transform translate-x-1 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/20 hover:translate-x-1'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Status */}
      <div className="p-4 mt-auto space-y-2">
        {isEditMode && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 animate-pulse">
            <Edit3 className="w-4 h-4" />
            <span>Edit Mode Active</span>
          </div>
        )}
      </div>
    </aside>
  );
}