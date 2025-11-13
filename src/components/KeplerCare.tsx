import React, { useState } from 'react';
import { 
  Heart, 
  Clock,
  MapPin,
  AlertTriangle,
  Phone,
  Pill,
  Home,
  X,
  CheckCircle,
  Calendar,
  Utensils,
  Activity,
  BarChart3
} from 'lucide-react';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { KeplerWalkTracker } from './KeplerWalkTracker';

interface DailyTask {
  id: string;
  task: string;
  time: string;
  assignee: string;
  completed: boolean;
}

export function KeplerCare() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: '1', task: 'Morning walk', time: '7:00 AM', assignee: 'Rotating', completed: false },
    { id: '2', task: 'Breakfast feeding', time: '7:30 AM', assignee: 'Nick/Alex', completed: false },
    { id: '3', task: 'Lunch feeding', time: '12:00 PM', assignee: 'Available person', completed: false },
    { id: '4', task: 'Afternoon walk', time: '3:00 PM', assignee: 'Landon (when home)', completed: false },
    { id: '5', task: 'Dinner feeding', time: '6:00 PM', assignee: 'Nick/Alex', completed: false },
    { id: '6', task: 'Evening walk', time: '8:00 PM', assignee: 'Rotating', completed: false }
  ]);

  const [texasTripNotes, setTexasTripNotes] = useState({
    dates: 'October 14-21, 2024',
    responsibilities: [
      'Morning and evening walks',
      'Feeding schedule (2x daily)',
      'Monitor for behavioral changes',
      'Emergency vet contact ready'
    ],
    emergencyVet: {
      name: 'To be provided',
      phone: 'To be provided',
      address: 'To be provided'
    }
  });

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const toggleTaskComplete = (taskId: string) => {
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const resetDailyTasks = () => {
    setDailyTasks(prev => prev.map(task => ({ ...task, completed: false })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Kepler's Care & Rules
          </h1>
          <p className="text-gray-600 mt-1">Everything about caring for our four-legged family member.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={resetDailyTasks}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Reset Daily Tasks
          </button>
          <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30" style={glassStyle}>
            <span className="text-sm text-gray-700">
              Today: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Walk Tracker - Featured Section */}
      <KeplerWalkTracker />

      {/* Daily Routine */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-purple-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl text-gray-800">Daily Routine</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailyTasks.map(task => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  task.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-400 hover:border-purple-500'
                }`}
              >
                {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
              </button>
              <div className="flex-1">
                <h4 className={`text-gray-800 ${task.completed ? 'line-through opacity-60' : ''}`}>
                  {task.task}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{task.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>{task.assignee}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
            <h4 className="text-blue-800 mb-2">Feeding Details</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Food location: [To be specified]</p>
              <p>• Amount: [To be specified]</p>
              <p>• Special dietary needs: [To be documented]</p>
            </div>
          </div>
          <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/30">
            <h4 className="text-green-800 mb-2">Sleep & Rest</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Bedtime location: [To be specified]</p>
              <p>• Favorite sleeping spots: [To be documented]</p>
              <p>• Night routine: [To be established]</p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-lg text-gray-800">Areas Kepler Can Access</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50/30 rounded-lg border border-green-200/30">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Landon's room</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50/30 rounded-lg border border-green-200/30">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Living room (TBD)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50/30 rounded-lg border border-green-200/30">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Kitchen (TBD)</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h4 className="text-lg text-gray-800">Off-Limits Areas</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50/30 rounded-lg border border-red-200/30">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-red-700">Nick & Alex's bedroom</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50/30 rounded-lg border border-red-200/30">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-red-700">Other restricted areas (TBD)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Texas Trip Care */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-orange-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl text-gray-800">While Landon is in Texas ({texasTripNotes.dates})</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-gray-800 mb-4">Nick & Alex Responsibilities</h4>
            <div className="space-y-3">
              {texasTripNotes.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50/30 rounded-lg border border-orange-200/30">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-orange-700">{responsibility}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg text-gray-800 mb-4">Emergency Information</h4>
            <div className="space-y-4">
              <div className="p-4 bg-red-50/30 rounded-lg border border-red-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  <h5 className="text-red-800">Emergency Vet</h5>
                </div>
                <div className="text-sm text-red-700 space-y-1">
                  <p>Name: {texasTripNotes.emergencyVet.name}</p>
                  <p>Phone: {texasTripNotes.emergencyVet.phone}</p>
                  <p>Address: {texasTripNotes.emergencyVet.address}</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <h5 className="text-blue-800">Health & Medications</h5>
                </div>
                <div className="text-sm text-blue-700">
                  <p>Medications: [To be documented]</p>
                  <p>Health issues: [To be documented]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Behavioral Issues & Solutions</h4>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
              <h5 className="text-yellow-800 mb-2">If Kepler barks excessively:</h5>
              <p className="text-sm text-yellow-700">[Solutions to be documented]</p>
            </div>
            <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
              <h5 className="text-yellow-800 mb-2">If accidents happen:</h5>
              <p className="text-sm text-yellow-700">
                Cleaning supplies location: [To be specified]<br/>
                Landon's responsibility to clean up
              </p>
            </div>
            <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
              <h5 className="text-yellow-800 mb-2">If Kepler seems anxious:</h5>
              <p className="text-sm text-yellow-700">[Calming techniques to be documented]</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Supplies & Storage</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">Food</span>
              </div>
              <span className="text-sm text-gray-600">[Location TBD]</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Leash & Harness</span>
              </div>
              <span className="text-sm text-gray-600">[Location TBD]</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Poop Bags</span>
              </div>
              <span className="text-sm text-gray-600">[Location TBD]</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                <span className="text-gray-700">Toys</span>
              </div>
              <span className="text-sm text-gray-600">[Location TBD]</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-teal-600" />
                <span className="text-gray-700">Cleaning Supplies</span>
              </div>
              <span className="text-sm text-gray-600">[Location TBD]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kepler's Personality */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-pink-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-600" />
          <h4 className="text-lg text-gray-800">Kepler's Quirks & Personality</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pink-50/30 rounded-lg border border-pink-200/30">
            <h5 className="text-pink-800 mb-2">Personality Traits</h5>
            <p className="text-sm text-pink-700">[To be documented by Landon]</p>
          </div>
          <div className="p-4 bg-pink-50/30 rounded-lg border border-pink-200/30">
            <h5 className="text-pink-800 mb-2">Fears & Triggers</h5>
            <p className="text-sm text-pink-700">[Important for Nick & Alex to know]</p>
          </div>
          <div className="p-4 bg-pink-50/30 rounded-lg border border-pink-200/30">
            <h5 className="text-pink-800 mb-2">Favorite Activities</h5>
            <p className="text-sm text-pink-700">[What makes Kepler happy]</p>
          </div>
          <div className="p-4 bg-pink-50/30 rounded-lg border border-pink-200/30">
            <h5 className="text-pink-800 mb-2">Special Needs</h5>
            <p className="text-sm text-pink-700">[Any special care requirements]</p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-8">
          <AnalyticsDashboard type="kepler" />
        </div>
      )}
    </div>
  );
}