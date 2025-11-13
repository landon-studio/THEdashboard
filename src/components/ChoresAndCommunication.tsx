import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Coffee,
  Trash2,
  Bath,
  Home,
  Heart,
  Plus,
  Edit3,
  BarChart3
} from 'lucide-react';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';

interface ChoreAssignment {
  id: string;
  chore: string;
  assignee: string;
  frequency: string;
  lastCompleted?: string;
  dueDate: string;
  completed: boolean;
}

interface CommunicationRule {
  id: string;
  category: string;
  rule: string;
  examples?: string[];
}

export function ChoresAndCommunication() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chores, setChores] = useState<ChoreAssignment[]>([
    { id: '1', chore: 'Kitchen cleanup', assignee: 'Landon', frequency: 'Daily', dueDate: 'Ongoing', completed: false },
    { id: '2', chore: 'Bathroom cleaning', assignee: 'Rotating weekly', frequency: 'Weekly', dueDate: 'This Sunday', completed: false },
    { id: '3', chore: 'Living room tidying', assignee: 'Everyone', frequency: 'As needed', dueDate: 'Ongoing', completed: false },
    { id: '4', chore: 'Trash & recycling', assignee: 'Nick/Alex', frequency: 'Weekly', dueDate: 'Monday', completed: false },
    { id: '5', chore: 'Kepler care', assignee: 'Landon (primary)', frequency: 'Daily', dueDate: 'Ongoing', completed: false }
  ]);

  const [communicationRules] = useState<CommunicationRule[]>([
    {
      id: '1',
      category: 'Small Issues',
      rule: 'Address in person or via text message',
      examples: ['Dishes left out', 'Noise concerns', 'Schedule conflicts']
    },
    {
      id: '2',
      category: 'Big Issues',
      rule: 'Formal sit-down discussion, allow cool-off period if needed',
      examples: ['Serious boundary violations', 'Major household decisions', 'Relationship conflicts']
    },
    {
      id: '3',
      category: 'House Meetings',
      rule: 'Monthly check-ins, first Sunday of each month',
      examples: ['Review agreements', 'Address ongoing issues', 'Plan ahead']
    },
    {
      id: '4',
      category: 'Conflict Resolution',
      rule: 'Cool-off protocol: space and time apart, then structured discussion',
      examples: ['Take 24-48 hours if needed', 'Focus on solutions', 'Consider mediation if stuck']
    }
  ]);

  const [houseMeetingSchedule] = useState({
    frequency: 'Monthly',
    day: 'First Sunday of each month',
    time: 'TBD',
    nextMeeting: 'December 1, 2024'
  });

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const toggleChoreComplete = (choreId: string) => {
    setChores(prev => prev.map(chore => 
      chore.id === choreId 
        ? { 
            ...chore, 
            completed: !chore.completed,
            lastCompleted: !chore.completed ? new Date().toLocaleDateString() : chore.lastCompleted
          } 
        : chore
    ));
  };

  const getChoreIcon = (choreName: string) => {
    if (choreName.toLowerCase().includes('kitchen')) return <Coffee className="w-4 h-4 text-green-600" />;
    if (choreName.toLowerCase().includes('bathroom')) return <Bath className="w-4 h-4 text-blue-600" />;
    if (choreName.toLowerCase().includes('trash')) return <Trash2 className="w-4 h-4 text-orange-600" />;
    if (choreName.toLowerCase().includes('living')) return <Home className="w-4 h-4 text-purple-600" />;
    if (choreName.toLowerCase().includes('kepler')) return <Heart className="w-4 h-4 text-red-600" />;
    return <CheckCircle className="w-4 h-4 text-gray-600" />;
  };

  const getAssigneeColor = (assignee: string) => {
    if (assignee.includes('Landon')) return 'bg-purple-100 text-purple-700';
    if (assignee.includes('Nick')) return 'bg-blue-100 text-blue-700';
    if (assignee.includes('Alex')) return 'bg-teal-100 text-teal-700';
    if (assignee.includes('Rotating') || assignee.includes('Everyone')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Chores & Communication
          </h1>
          <p className="text-gray-600 mt-1">Shared responsibilities and conflict resolution guidelines.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30" style={glassStyle}>
            <span className="text-sm text-gray-700">
              Next meeting: {houseMeetingSchedule.nextMeeting}
            </span>
          </div>
        </div>
      </div>

      {/* Current Chores */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-purple-500" style={glassStyle}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl text-gray-800">Current Responsibilities</h3>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Chore
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chores.map(chore => (
            <div key={chore.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => toggleChoreComplete(chore.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    chore.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400 hover:border-purple-500'
                  }`}
                >
                  {chore.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getChoreIcon(chore.chore)}
                    <h4 className={`text-gray-800 ${chore.completed ? 'line-through opacity-60' : ''}`}>
                      {chore.chore}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getAssigneeColor(chore.assignee)}`}>
                      {chore.assignee}
                    </span>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{chore.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{chore.dueDate}</span>
                      </div>
                    </div>
                    {chore.lastCompleted && (
                      <div className="text-xs text-green-600">
                        Last completed: {chore.lastCompleted}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cleaning Standards */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <Home className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl text-gray-800">Cleaning Standards</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
            <h4 className="text-blue-800 mb-3">Daily Standards</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Clean as you go in kitchen</li>
              <li>• Put away personal items</li>
              <li>• Wipe down surfaces after use</li>
              <li>• Keep common areas tidy</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/30">
            <h4 className="text-green-800 mb-3">Weekly Deep Clean</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Bathroom thorough cleaning</li>
              <li>• Vacuum/sweep common areas</li>
              <li>• Take out trash and recycling</li>
              <li>• Kitchen deep clean</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50/30 rounded-lg border border-purple-200/30">
            <h4 className="text-purple-800 mb-3">Acceptable Level</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Lived-in but organized</li>
              <li>• Clean enough for surprise guests</li>
              <li>• No lingering messes</li>
              <li>• Functional and pleasant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Communication Guidelines */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-teal-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl text-gray-800">Communication & Conflict Resolution</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communicationRules.map(rule => (
            <div key={rule.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="text-gray-800 mb-2">{rule.category}</h4>
              <p className="text-sm text-gray-700 mb-3">{rule.rule}</p>
              {rule.examples && (
                <div>
                  <h5 className="text-xs text-gray-600 mb-1">Examples:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {rule.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* House Meeting Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h4 className="text-lg text-gray-800">House Meeting Schedule</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50/30 rounded-lg border border-orange-200/30">
              <span className="text-orange-700">Frequency</span>
              <span className="text-orange-800">{houseMeetingSchedule.frequency}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50/30 rounded-lg border border-orange-200/30">
              <span className="text-orange-700">When</span>
              <span className="text-orange-800">{houseMeetingSchedule.day}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50/30 rounded-lg border border-orange-200/30">
              <span className="text-orange-700">Time</span>
              <span className="text-orange-800">{houseMeetingSchedule.time}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50/30 rounded-lg border border-orange-200/30">
              <span className="text-orange-700">Next Meeting</span>
              <span className="text-orange-800">{houseMeetingSchedule.nextMeeting}</span>
            </div>
          </div>
        </div>

        {/* Specific Boundaries */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-red-600" />
            <h4 className="text-lg text-gray-800">Specific Boundaries</h4>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-50/30 rounded-lg border border-red-200/30">
              <h5 className="text-red-800 mb-2">Nick's Boundaries</h5>
              <p className="text-sm text-red-700">[From previous conflicts - to be documented]</p>
            </div>
            <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/30">
              <h5 className="text-blue-800 mb-2">Alex's Concerns</h5>
              <p className="text-sm text-blue-700">[What makes this easier for him - to be documented]</p>
            </div>
            <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/30">
              <h5 className="text-green-800 mb-2">Landon's Needs</h5>
              <p className="text-sm text-green-700">[Support and understanding during transition]</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Process */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-yellow-500" style={glassStyle}>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl text-gray-800">If We Fight - Resolution Protocol</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-600" />
              <h4 className="text-yellow-800">Cool-off Period</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Take 24-48 hours if needed</li>
              <li>• Space apart to process</li>
              <li>• No escalating during this time</li>
              <li>• Focus on self-care</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-yellow-600" />
              <h4 className="text-yellow-800">Resolution Discussion</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Schedule formal sit-down</li>
              <li>• Each person shares perspective</li>
              <li>• Focus on solutions, not blame</li>
              <li>• Identify specific actions</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200/30">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-yellow-600" />
              <h4 className="text-yellow-800">Third Party Help</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Consider therapist guidance</li>
              <li>• Trusted mutual friend mediation</li>
              <li>• Professional mediation if needed</li>
              <li>• Community resources</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-8">
          <AnalyticsDashboard type="chores" />
        </div>
      )}
    </div>
  );
}