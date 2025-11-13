import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Filter,
  Download,
  Upload,
  CalendarCheck,
  ExternalLink,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Eye,
  Grid,
  List
} from 'lucide-react';
import { calendarAPI, googleCalendarAPI, utils } from '../utils/api';
import { useAppContext } from '../contexts/AppContext';
import { toast } from 'sonner@2.0.3';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  type: 'roommate' | 'kepler' | 'chore' | 'social' | 'google_sync' | 'google_calendar';
  created_by: string;
  attendees: string[];
  location: string;
  source?: 'local' | 'google';
}

type ViewMode = 'day' | 'week' | '2weeks' | 'month' | 'year';

export function SharedCalendar() {
  const { isEditMode } = useAppContext();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'roommate',
    created_by: 'Landon',
    attendees: [],
    description: '',
    location: ''
  });

  const residents = ['Nick', 'Alex', 'Landon'];
  const eventTypes = [
    { value: 'roommate', label: 'Roommate Event', color: 'purple' },
    { value: 'kepler', label: 'Kepler Care', color: 'orange' },
    { value: 'chore', label: 'Chore', color: 'green' },
    { value: 'social', label: 'Social', color: 'blue' },
    { value: 'google_sync', label: 'Google Sync', color: 'red' }
  ];

  const viewModes = [
    { value: 'day', label: 'Day', icon: Clock },
    { value: 'week', label: 'Week', icon: Calendar },
    { value: '2weeks', label: '2 Weeks', icon: Grid },
    { value: 'month', label: 'Month', icon: Calendar },
    { value: 'year', label: 'Year', icon: List }
  ];

  // Glassmorphism styles
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  useEffect(() => {
    loadEvents();
    checkConnections();
  }, [viewMode, currentDate]);

  const checkConnections = async () => {
    const isConnected = await utils.testConnection();
    setConnected(isConnected);
    
    if (isConnected) {
      try {
        const googleStatus = await googleCalendarAPI.getAuthStatus();
        setGoogleConnected(googleStatus.authenticated);
      } catch (error) {
        setGoogleConnected(false);
      }
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      const fetchedEvents = await calendarAPI.getAll({
        view: viewMode,
        start_date: start.toISOString(),
        end_date: end.toISOString()
      });
      
      setEvents(fetchedEvents);
      setConnected(true);
    } catch (error) {
      console.error('Failed to load events:', error);
      setConnected(false);
      toast.error(utils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const response = await googleCalendarAPI.getAuthUrl();
      window.open(response.auth_url, '_blank', 'width=500,height=600');
      
      // Listen for auth completion
      const checkAuth = setInterval(async () => {
        try {
          const status = await googleCalendarAPI.getAuthStatus();
          if (status.authenticated) {
            setGoogleConnected(true);
            clearInterval(checkAuth);
            toast.success('Google Calendar connected successfully!');
            await syncGoogleCalendar();
          }
        } catch (error) {
          // Continue checking
        }
      }, 2000);
      
      // Stop checking after 5 minutes
      setTimeout(() => clearInterval(checkAuth), 300000);
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      toast.error(utils.handleError(error));
    }
  };

  const syncGoogleCalendar = async () => {
    try {
      await googleCalendarAPI.sync();
      await loadEvents();
      toast.success('Google Calendar synced successfully!');
    } catch (error) {
      console.error('Failed to sync Google Calendar:', error);
      toast.error(utils.handleError(error));
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case '2weeks':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 13);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }

    return { start, end };
  };

  const addEvent = async () => {
    if (newEvent.title && newEvent.start_date) {
      try {
        await calendarAPI.create({
          title: newEvent.title,
          description: newEvent.description || '',
          start_date: newEvent.start_date,
          end_date: newEvent.end_date,
          type: newEvent.type || 'roommate',
          created_by: newEvent.created_by || 'Landon',
          attendees: newEvent.attendees || [],
          location: newEvent.location || ''
        });
        
        await loadEvents();
        setNewEvent({
          type: 'roommate',
          created_by: 'Landon',
          attendees: [],
          description: '',
          location: ''
        });
        setShowAddEvent(false);
        toast.success('Event created successfully!');
      } catch (error) {
        console.error('Failed to create event:', error);
        toast.error(utils.handleError(error));
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await calendarAPI.delete(eventId);
      await loadEvents();
      setSelectedEvent(null);
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error(utils.handleError(error));
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case '2weeks':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    switch (viewMode) {
      case 'day':
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
      case '2weeks':
        const { start, end } = getDateRange();
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  const getTypeColor = (type: string) => {
    const typeData = eventTypes.find(t => t.value === type);
    const color = typeData?.color || 'purple';
    
    const colors = {
      purple: 'border-purple-500 bg-purple-50',
      orange: 'border-orange-500 bg-orange-50',
      green: 'border-green-500 bg-green-50',
      blue: 'border-blue-500 bg-blue-50',
      red: 'border-red-500 bg-red-50'
    };
    
    return colors[color as keyof typeof colors] || colors.purple;
  };

  const filteredEvents = events.filter(event => 
    filterType === 'all' || event.type === filterType
  );

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
      case '2weeks':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };

  const renderDayView = () => {
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === currentDate.toDateString();
    });

    return (
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          dayEvents.map(event => (
            <div
              key={event.id}
              className={`p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${getTypeColor(event.type)}`}
              style={glassStyle}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg text-gray-800">{event.title}</h3>
                <span className="text-xs text-gray-600 capitalize">{event.type}</span>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(event.start_date).toLocaleTimeString()}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.attendees.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees.length} attendees</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const { start } = getDateRange();
    const days = [];
    const numDays = viewMode === '2weeks' ? 14 : 7;
    
    for (let i = 0; i < numDays; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.toDateString() === day.toDateString();
          });

          return (
            <div key={day.toISOString()} className="min-h-32">
              <div className="rounded-xl p-3 h-full" style={glassStyle}>
                <div className="text-center mb-2">
                  <div className="text-xs text-gray-600">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-lg text-gray-800">{day.getDate()}</div>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`p-1 rounded text-xs cursor-pointer ${getTypeColor(event.type)}`}
                      onClick={() => setSelectedEvent(event)}
                      title={event.title}
                    >
                      <div className="truncate">{event.title}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const { start } = getDateRange();
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return (
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            const dayEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.start_date);
              return eventDate.toDateString() === day.toDateString();
            });

            return (
              <div key={day.toISOString()} className="min-h-24">
                <div 
                  className={`rounded-xl p-2 h-full ${isCurrentMonth ? '' : 'opacity-50'} ${isToday ? 'ring-2 ring-purple-500' : ''}`} 
                  style={glassStyle}
                >
                  <div className="text-sm text-gray-800 mb-1">{day.getDate()}</div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`p-1 rounded text-xs cursor-pointer ${getTypeColor(event.type)}`}
                        onClick={() => setSelectedEvent(event)}
                        title={event.title}
                      >
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentDate.getFullYear(), i, 1);
      months.push(month);
    }

    return (
      <div className="grid grid-cols-3 gap-6">
        {months.map(month => {
          const monthEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.getMonth() === month.getMonth() && 
                   eventDate.getFullYear() === month.getFullYear();
          });

          return (
            <div 
              key={month.getMonth()} 
              className="rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-200" 
              style={glassStyle}
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <h3 className="text-lg text-gray-800 mb-3">{month.toLocaleDateString('en-US', { month: 'long' })}</h3>
              
              <div className="space-y-2">
                {monthEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="text-xs text-gray-600 truncate">
                    {event.title}
                  </div>
                ))}
                {monthEvents.length > 5 && (
                  <div className="text-xs text-gray-500">+{monthEvents.length - 5} more events</div>
                )}
                {monthEvents.length === 0 && (
                  <div className="text-xs text-gray-400">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl bg-gradient-to-r from-[#676767] to-[#E8A587] bg-clip-text text-transparent">
              Shared Calendar
            </h1>
            {connected ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Wifi className="w-3 h-3" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                <WifiOff className="w-3 h-3" />
                Offline
              </div>
            )}
            {googleConnected && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <CalendarCheck className="w-3 h-3" />
                Google Calendar
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">Keep track of roommate events, chores, and Kepler care.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {!googleConnected && connected && (
            <button
              onClick={connectGoogleCalendar}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              Connect Google
            </button>
          )}
          
          {googleConnected && (
            <button
              onClick={syncGoogleCalendar}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Google
            </button>
          )}
          
          <button
            onClick={loadEvents}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-700 rounded-xl hover:bg-white/20 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E8A587] to-[#C99A82] text-white rounded-xl hover:shadow-lg transition-all duration-200"
            disabled={!connected}
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        {/* View Mode Selector */}
        <div className="flex gap-2 p-2 rounded-xl" style={glassStyle}>
          {viewModes.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as ViewMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === mode.value 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-700 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter and Navigation */}
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Events</option>
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 bg-white/10 text-gray-700 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-4 py-2 bg-white/10 rounded-lg text-gray-800 min-w-48 text-center">
              {formatDate(currentDate)}
            </div>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 bg-white/10 text-gray-700 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {eventTypes.slice(0, 4).map(type => {
          const count = events.filter(e => e.type === type.value).length;
          return (
            <div key={type.value} className="rounded-xl p-4 shadow-lg" style={glassStyle}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 capitalize">{type.label}</span>
              </div>
              <div className="text-2xl text-gray-800">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      )}

      {/* Calendar View */}
      {!loading && (
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          {renderCalendarView()}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={glassStyle}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-gray-800">Add New Event</h2>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Event title..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Event description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.start_date || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={newEvent.end_date || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {eventTypes.slice(0, 4).map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Created By</label>
                    <select
                      value={newEvent.created_by}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, created_by: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {residents.map(resident => (
                        <option key={resident} value={resident}>{resident}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Event location..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Attendees</label>
                  <div className="flex flex-wrap gap-2">
                    {residents.map(resident => (
                      <label key={resident} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newEvent.attendees?.includes(resident) || false}
                          onChange={(e) => {
                            const attendees = newEvent.attendees || [];
                            if (e.target.checked) {
                              setNewEvent(prev => ({ ...prev, attendees: [...attendees, resident] }));
                            } else {
                              setNewEvent(prev => ({ ...prev, attendees: attendees.filter(a => a !== resident) }));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{resident}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addEvent}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#E8A587] to-[#C99A82] text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  disabled={!newEvent.title || !newEvent.start_date}
                >
                  Add Event
                </button>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-xl max-w-md w-full" style={glassStyle}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl text-gray-800">{selectedEvent.title}</h2>
                <div className="flex gap-2">
                  {isEditMode && (
                    <button
                      onClick={() => deleteEvent(selectedEvent.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{selectedEvent.type}</span>
                </div>

                {selectedEvent.description && (
                  <p className="text-gray-700">{selectedEvent.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(selectedEvent.start_date).toLocaleString()}</span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.attendees.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{selectedEvent.attendees.join(', ')}</span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Created by {selectedEvent.created_by}
                  {selectedEvent.source === 'google' && ' • Synced from Google Calendar'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}