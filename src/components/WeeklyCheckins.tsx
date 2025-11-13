import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar,
  CheckCircle,
  Edit3,
  Save,
  X,
  Clock,
  Users,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { localStorageUtil } from '../utils/localStorage';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';

interface CheckinItem {
  id: string;
  week: number;
  date: string;
  wentWell: string[];
  needsAdjustment: string[];
  comingWeek: string[];
  actionItems: { text: string; completed: boolean }[];
  isTemplate?: boolean;
}

export function WeeklyCheckins() {
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCheckin, setNewCheckin] = useState<Partial<CheckinItem>>({});

  useEffect(() => {
    const savedCheckins = localStorageUtil.getDataByKey('checkins') || [];
    if (savedCheckins.length === 0) {
      // Initialize with template
      const template = {
        id: 'template',
        week: 0,
        date: '',
        wentWell: ['Living together harmoniously', 'Keeping common areas clean'],
        needsAdjustment: ['Communication about schedules', 'Noise levels in evenings'],
        comingWeek: ['Nick has late work meetings Tuesday/Thursday', 'Alex traveling Friday-Sunday'],
        actionItems: [
          { text: 'Set up shared calendar for schedules', completed: false },
          { text: 'Discuss quiet hours policy', completed: false }
        ],
        isTemplate: true
      };
      setCheckins([template]);
      localStorageUtil.saveData('checkins', [template]);
    } else {
      setCheckins(savedCheckins);
    }
  }, []);

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const startNewCheckin = () => {
    const newWeek = Math.max(...checkins.filter(c => !c.isTemplate).map(c => c.week), 0) + 1;
    setNewCheckin({
      id: `week-${newWeek}`,
      week: newWeek,
      date: getCurrentDate(),
      wentWell: [''],
      needsAdjustment: [''],
      comingWeek: [''],
      actionItems: [{ text: '', completed: false }]
    });
    setEditingId(`week-${newWeek}`);
  };

  const saveCheckin = () => {
    if (newCheckin.id) {
      const updatedCheckins = [...checkins, newCheckin as CheckinItem];
      setCheckins(updatedCheckins);
      localStorageUtil.saveData('checkins', updatedCheckins);
      setNewCheckin({});
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setNewCheckin({});
    setEditingId(null);
  };

  const addArrayItem = (field: 'wentWell' | 'needsAdjustment' | 'comingWeek', checkin: CheckinItem) => {
    if (editingId === checkin.id) {
      setNewCheckin(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), '']
      }));
    }
  };

  const updateArrayItem = (field: 'wentWell' | 'needsAdjustment' | 'comingWeek', index: number, value: string) => {
    setNewCheckin(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addActionItem = () => {
    setNewCheckin(prev => ({
      ...prev,
      actionItems: [...(prev.actionItems || []), { text: '', completed: false }]
    }));
  };

  const updateActionItem = (index: number, text: string) => {
    setNewCheckin(prev => {
      const items = [...(prev.actionItems || [])];
      items[index] = { ...items[index], text };
      return { ...prev, actionItems: items };
    });
  };

  const toggleActionItem = (checkinId: string, itemIndex: number) => {
    const updatedCheckins = checkins.map(checkin => {
      if (checkin.id === checkinId) {
        const items = [...checkin.actionItems];
        items[itemIndex] = { ...items[itemIndex], completed: !items[itemIndex].completed };
        return { ...checkin, actionItems: items };
      }
      return checkin;
    });
    setCheckins(updatedCheckins);
    localStorageUtil.saveData('checkins', updatedCheckins);
  };

  const renderEditableSection = (title: string, field: 'wentWell' | 'needsAdjustment' | 'comingWeek', checkin: CheckinItem | Partial<CheckinItem>, icon: React.ReactNode) => {
    if (!checkin || !checkin.id) return null;
    
    const items = editingId === checkin.id ? (newCheckin[field] || []) : (checkin[field] || []);
    const isEditing = editingId === checkin.id;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-gray-800">{title}</h4>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
              {isEditing ? (
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem(field, index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Add ${title.toLowerCase()} item...`}
                />
              ) : (
                <p className="text-gray-700">{item}</p>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => addArrayItem(field, checkin as CheckinItem)}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add item
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Weekly Check-ins
          </h1>
          <p className="text-gray-600 mt-1">Track progress and maintain open communication.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={startNewCheckin}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Check-in
          </button>
        </div>
      </div>

      {/* Template Section */}
      {checkins.length > 0 && checkins[0] && (
        <div className="rounded-2xl p-6 shadow-xl border-l-4 border-purple-500" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg text-gray-800">Weekly Check-in Template</h3>
              <p className="text-sm text-gray-600">Standard format for all check-ins</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderEditableSection(
                "What went well", 
                "wentWell", 
                checkins[0], 
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {renderEditableSection(
                "What needs adjustment", 
                "needsAdjustment", 
                checkins[0], 
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            <div className="space-y-4">
              {renderEditableSection(
                "Coming week", 
                "comingWeek", 
                checkins[0], 
                <Calendar className="w-4 h-4 text-blue-600" />
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h4 className="text-gray-800">Action items</h4>
                </div>
                <div className="space-y-2">
                  {checkins[0]?.actionItems?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleActionItem(checkins[0].id, index)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className={`text-gray-700 ${item.completed ? 'line-through opacity-60' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {checkins.length === 0 && (
        <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading check-in template...</p>
        </div>
      )}

      {/* New/Editing Check-in */}
      {editingId && (
        <div className="rounded-2xl p-6 shadow-xl border-l-4 border-blue-500" style={glassStyle}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-gray-800">Week {newCheckin.week} Check-in</h3>
                <p className="text-sm text-gray-600">{newCheckin.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveCheckin}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderEditableSection(
                "What went well", 
                "wentWell", 
                newCheckin, 
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {renderEditableSection(
                "What needs adjustment", 
                "needsAdjustment", 
                newCheckin, 
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            <div className="space-y-4">
              {renderEditableSection(
                "Coming week", 
                "comingWeek", 
                newCheckin, 
                <Calendar className="w-4 h-4 text-blue-600" />
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h4 className="text-gray-800">Action items</h4>
                </div>
                <div className="space-y-2">
                  {(newCheckin.actionItems || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => {
                          const items = [...(newCheckin.actionItems || [])];
                          items[index] = { ...items[index], completed: e.target.checked };
                          setNewCheckin(prev => ({ ...prev, actionItems: items }));
                        }}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateActionItem(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Add action item..."
                      />
                    </div>
                  ))}
                  <button
                    onClick={addActionItem}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add action item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Check-ins */}
      <div className="space-y-4">
        <h3 className="text-xl text-gray-800">Previous Check-ins</h3>
        {checkins.filter(c => !c.isTemplate && c.id !== editingId).length === 0 ? (
          <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg text-gray-600 mb-2">No check-ins yet</h3>
            <p className="text-gray-500">Start your first weekly check-in to track progress.</p>
          </div>
        ) : (
          checkins
            .filter(c => !c.isTemplate && c.id !== editingId)
            .sort((a, b) => b.week - a.week)
            .map(checkin => (
              <div key={checkin.id} className="rounded-2xl p-6 shadow-xl border-l-4 border-gray-400" style={glassStyle}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm">{checkin.week}</span>
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-800">Week {checkin.week} Check-in</h3>
                      <p className="text-sm text-gray-600">{checkin.date}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {renderEditableSection(
                      "What went well", 
                      "wentWell", 
                      checkin, 
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {renderEditableSection(
                      "What needs adjustment", 
                      "needsAdjustment", 
                      checkin, 
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="space-y-4">
                    {renderEditableSection(
                      "Coming week", 
                      "comingWeek", 
                      checkin, 
                      <Calendar className="w-4 h-4 text-blue-600" />
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <h4 className="text-gray-800">Action items</h4>
                      </div>
                      <div className="space-y-2">
                        {checkin.actionItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleActionItem(checkin.id, index)}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className={`text-gray-700 ${item.completed ? 'line-through opacity-60' : ''}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-8">
          <AnalyticsDashboard type="checkins" />
        </div>
      )}
    </div>
  );
}