import React, { useState } from 'react';
import { 
  Home, 
  Users,
  Clock,
  Volume2,
  Cigarette,
  Bed,
  ChefHat,
  Tv,
  Bath,
  Shirt,
  Edit3,
  Save,
  X,
  Plus
} from 'lucide-react';

interface RoomRule {
  id: string;
  name: string;
  rules: string[];
  accessHours?: string;
  cleanupExpectations?: string;
  specialNotes?: string;
}

export function HouseRules() {
  const [rooms, setRooms] = useState<RoomRule[]>([
    {
      id: 'nick-alex-bedroom',
      name: "Nick & Alex's Bedroom",
      rules: ['Private space - knock and ask before entering', 'No access without permission'],
      specialNotes: 'Respect privacy and personal space'
    },
    {
      id: 'landon-bedroom',
      name: "Landon's Bedroom",
      rules: ['Private space - others need permission to enter', 'Personal items storage area'],
      specialNotes: 'Temporary residence with full privacy rights'
    },
    {
      id: 'kitchen',
      name: "Kitchen",
      rules: ['Clean as you cook', 'Put dishes away after washing', 'Wipe down counters after use'],
      accessHours: '24/7 access',
      cleanupExpectations: 'Immediate cleanup required',
      specialNotes: 'Each person has designated shelf space'
    },
    {
      id: 'living-room',
      name: "Living Room",
      rules: ['Shared space for all residents', 'Clean up after use', 'Ask before having guests over'],
      accessHours: 'Shared use - be considerate',
      specialNotes: 'TV use on first-come basis, discuss for longer sessions'
    },
    {
      id: 'bathroom',
      name: "Bathroom",
      rules: ['Keep clean after use', 'Replace toilet paper when empty', 'Don\'t leave personal items'],
      cleanupExpectations: 'Clean after each use',
      specialNotes: 'Cleaning rotation schedule TBD'
    },
    {
      id: 'laundry',
      name: "Laundry Area",
      rules: ['Remove clothes promptly after cycles', 'Clean lint trap', 'Don\'t move others\' clothes'],
      specialNotes: 'Supplies shared unless otherwise agreed'
    }
  ]);

  const [quietHours, setQuietHours] = useState("10 PM - 8 AM on weekdays, 11 PM - 9 AM on weekends");
  const [guestPolicy, setGuestPolicy] = useState({
    dayGuests: "Yes, with heads up",
    overnightGuests: "Ask first, 24hr notice preferred",
    notice: "Few hours for day guests, 24hrs for overnight"
  });
  const [smokingPolicy, setSmoking] = useState("No smoking/vaping inside. Outside areas designated TBD.");
  
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string>('');

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const getRoomIcon = (roomId: string) => {
    switch (roomId) {
      case 'nick-alex-bedroom':
      case 'landon-bedroom':
        return <Bed className="w-5 h-5 text-purple-600" />;
      case 'kitchen':
        return <ChefHat className="w-5 h-5 text-green-600" />;
      case 'living-room':
        return <Tv className="w-5 h-5 text-blue-600" />;
      case 'bathroom':
        return <Bath className="w-5 h-5 text-teal-600" />;
      case 'laundry':
        return <Shirt className="w-5 h-5 text-orange-600" />;
      default:
        return <Home className="w-5 h-5 text-gray-600" />;
    }
  };

  const startEditingRoom = (roomId: string) => {
    setEditingRoom(roomId);
  };

  const saveRoomEdit = () => {
    setEditingRoom(null);
  };

  const cancelRoomEdit = () => {
    setEditingRoom(null);
  };

  const addRuleToRoom = (roomId: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, rules: [...room.rules, ''] };
      }
      return room;
    }));
  };

  const updateRoomRule = (roomId: string, ruleIndex: number, newRule: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const newRules = [...room.rules];
        newRules[ruleIndex] = newRule;
        return { ...room, rules: newRules };
      }
      return room;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            House Rules & Spaces
          </h1>
          <p className="text-gray-600 mt-1">Guidelines for shared living and space management.</p>
        </div>
        <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30" style={glassStyle}>
          <span className="text-sm text-gray-700">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Room Rules */}
      <div className="space-y-4">
        <h3 className="text-xl text-gray-800">Room & Space Guidelines</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getRoomIcon(room.id)}
                  <h4 className="text-lg text-gray-800">{room.name}</h4>
                </div>
                <button
                  onClick={() => startEditingRoom(room.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                {room.accessHours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Access: {room.accessHours}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h5 className="text-sm text-gray-700">Rules:</h5>
                  {room.rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                      {editingRoom === room.id ? (
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => updateRoomRule(room.id, index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-700 text-sm">{rule}</p>
                      )}
                    </div>
                  ))}
                  
                  {editingRoom === room.id && (
                    <button
                      onClick={() => addRuleToRoom(room.id)}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add rule
                    </button>
                  )}
                </div>

                {room.cleanupExpectations && (
                  <div className="text-sm">
                    <span className="text-gray-600">Cleanup: </span>
                    <span className="text-gray-700">{room.cleanupExpectations}</span>
                  </div>
                )}

                {room.specialNotes && (
                  <div className="text-sm bg-blue-50/30 p-3 rounded-lg border border-blue-200/30">
                    <span className="text-blue-700">{room.specialNotes}</span>
                  </div>
                )}

                {editingRoom === room.id && (
                  <div className="flex gap-2 pt-3 border-t border-white/20">
                    <button
                      onClick={saveRoomEdit}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={cancelRoomEdit}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiet Hours */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg text-gray-800">Quiet Hours</h4>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700">{quietHours}</p>
            <div className="text-sm bg-yellow-50/30 p-3 rounded-lg border border-yellow-200/30">
              <span className="text-yellow-700">
                When residents need quiet time and minimal presence from others
              </span>
            </div>
          </div>
        </div>

        {/* Guest Policy */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h4 className="text-lg text-gray-800">Guest Policy</h4>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Day guests: </span>
              <span className="text-gray-700">{guestPolicy.dayGuests}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Overnight guests: </span>
              <span className="text-gray-700">{guestPolicy.overnightGuests}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Notice required: </span>
              <span className="text-gray-700">{guestPolicy.notice}</span>
            </div>
          </div>
        </div>

        {/* Smoking Policy */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Cigarette className="w-5 h-5 text-red-600" />
            <h4 className="text-lg text-gray-800">Smoking/Vaping</h4>
          </div>
          <p className="text-gray-700">{smokingPolicy}</p>
        </div>

        {/* Quick Reference */}
        <div className="rounded-2xl p-6 shadow-xl border-l-4 border-purple-500" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg text-gray-800">Quick Reference</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Residents:</span>
              <span className="text-gray-700">Nick, Alex, Landon, Kepler</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Private spaces:</span>
              <span className="text-gray-700">Both bedrooms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shared spaces:</span>
              <span className="text-gray-700">Kitchen, living room, bathroom</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency contact:</span>
              <span className="text-gray-700">TBD</span>
            </div>
          </div>
        </div>
      </div>

      {/* House Guidelines Summary */}
      <div className="rounded-2xl p-6 shadow-xl border-l-4 border-teal-500" style={glassStyle}>
        <h4 className="text-lg text-gray-800 mb-4">Core Living Principles</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h5 className="text-gray-800 mb-1">Respect</h5>
            <p className="text-sm text-gray-600">Honor each other's space, time, and boundaries</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Home className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h5 className="text-gray-800 mb-1">Cleanliness</h5>
            <p className="text-sm text-gray-600">Keep shared spaces clean and organized</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Volume2 className="w-8 h-8 mx-auto mb-2 text-teal-600" />
            <h5 className="text-gray-800 mb-1">Communication</h5>
            <p className="text-sm text-gray-600">Address issues openly and respectfully</p>
          </div>
        </div>
      </div>
    </div>
  );
}