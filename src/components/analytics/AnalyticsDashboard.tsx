import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Calendar, CheckCircle, DollarSign, Heart, Users, Clock } from 'lucide-react';
import { localStorageUtil } from '../../utils/localStorage';

interface AnalyticsProps {
  type: 'expenses' | 'checkins' | 'chores' | 'kepler';
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

export function AnalyticsDashboard({ type, timeRange = 'month' }: AnalyticsProps) {
  const [data, setData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>({});

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [type, timeRange]);

  const loadAnalyticsData = () => {
    switch (type) {
      case 'expenses':
        loadExpenseAnalytics();
        break;
      case 'checkins':
        loadCheckinAnalytics();
        break;
      case 'chores':
        loadChoreAnalytics();
        break;
      case 'kepler':
        loadKeplerAnalytics();
        break;
    }
  };

  const loadExpenseAnalytics = () => {
    const expenses = localStorageUtil.getDataByKey('expenses') || [];
    
    // Monthly spending trends
    const monthlyData = expenses.reduce((acc: any, expense: any) => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, total: 0, count: 0, categories: {} };
      }
      acc[month].total += expense.amount;
      acc[month].count += 1;
      acc[month].categories[expense.category] = (acc[month].categories[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Category spending over time
    const categoryTrends = expenses.reduce((acc: any, expense: any) => {
      const week = getWeekOfYear(new Date(expense.date));
      const key = `Week ${week}`;
      if (!acc[key]) {
        acc[key] = { week: key, groceries: 0, utilities: 0, household: 0, rent: 0, pet: 0, other: 0 };
      }
      acc[key][expense.category] += expense.amount;
      return acc;
    }, {});

    // Person spending comparison
    const personSpending = expenses.reduce((acc: any, expense: any) => {
      acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
      return acc;
    }, {});

    setData({
      monthly: Object.values(monthlyData),
      categoryTrends: Object.values(categoryTrends),
      personSpending: Object.entries(personSpending).map(([name, amount]) => ({ name, amount }))
    });

    setInsights({
      avgMonthlySpending: Object.values(monthlyData).reduce((sum: number, month: any) => sum + month.total, 0) / Object.keys(monthlyData).length,
      highestCategory: Object.entries(
        expenses.reduce((acc: any, expense: any) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {})
      ).sort((a: any, b: any) => b[1] - a[1])[0],
      totalTransactions: expenses.length
    });
  };

  const loadCheckinAnalytics = () => {
    const checkins = localStorageUtil.getDataByKey('checkins') || [];
    const nonTemplateCheckins = checkins.filter((c: any) => !c.isTemplate);

    // Mood trends over time
    const moodTrends = nonTemplateCheckins.map((checkin: any) => ({
      week: `Week ${checkin.week}`,
      positiveItems: checkin.wentWell?.length || 0,
      improvementItems: checkin.needsAdjustment?.length || 0,
      actionItems: checkin.actionItems?.length || 0,
      completedActions: checkin.actionItems?.filter((item: any) => item.completed).length || 0
    }));

    // Action item completion rate
    const allActionItems = nonTemplateCheckins.flatMap((c: any) => c.actionItems || []);
    const completionRate = allActionItems.length > 0 
      ? (allActionItems.filter((item: any) => item.completed).length / allActionItems.length) * 100 
      : 0;

    setData({
      moodTrends,
      completionRate,
      totalCheckins: nonTemplateCheckins.length
    });

    setInsights({
      avgPositiveItems: moodTrends.reduce((sum, week) => sum + week.positiveItems, 0) / moodTrends.length,
      avgImprovementItems: moodTrends.reduce((sum, week) => sum + week.improvementItems, 0) / moodTrends.length,
      actionItemCompletionRate: completionRate,
      totalActionItems: allActionItems.length
    });
  };

  const loadChoreAnalytics = () => {
    // For demo purposes, we'll generate some mock completion data
    // In a real app, you'd track chore completions over time
    const choreCompletionData = [
      { week: 'Week 1', completed: 28, total: 35, completionRate: 80 },
      { week: 'Week 2', completed: 32, total: 35, completionRate: 91.4 },
      { week: 'Week 3', completed: 25, total: 35, completionRate: 71.4 },
      { week: 'Week 4', completed: 30, total: 35, completionRate: 85.7 }
    ];

    const choreDistribution = [
      { assignee: 'Landon', count: 8, percentage: 40 },
      { assignee: 'Nick', count: 6, percentage: 30 },
      { assignee: 'Alex', count: 4, percentage: 20 },
      { assignee: 'Shared', count: 2, percentage: 10 }
    ];

    setData({
      completionTrends: choreCompletionData,
      choreDistribution
    });

    setInsights({
      avgCompletionRate: choreCompletionData.reduce((sum, week) => sum + week.completionRate, 0) / choreCompletionData.length,
      bestWeek: choreCompletionData.reduce((best, week) => week.completionRate > best.completionRate ? week : best),
      totalChores: 20
    });
  };

  const loadKeplerAnalytics = () => {
    // Mock Kepler care data
    const keplerData = [
      { day: 'Mon', walks: 3, feeding: 2, careScore: 95 },
      { day: 'Tue', walks: 2, feeding: 2, careScore: 85 },
      { day: 'Wed', walks: 3, feeding: 2, careScore: 95 },
      { day: 'Thu', walks: 3, feeding: 2, careScore: 95 },
      { day: 'Fri', walks: 2, feeding: 2, careScore: 85 },
      { day: 'Sat', walks: 4, feeding: 2, careScore: 100 },
      { day: 'Sun', walks: 3, feeding: 2, careScore: 95 }
    ];

    const caregiverData = [
      { name: 'Landon', tasks: 15, percentage: 60 },
      { name: 'Nick', tasks: 6, percentage: 24 },
      { name: 'Alex', tasks: 4, percentage: 16 }
    ];

    setData({
      dailyCare: keplerData,
      caregiverDistribution: caregiverData
    });

    setInsights({
      avgCareScore: keplerData.reduce((sum, day) => sum + day.careScore, 0) / keplerData.length,
      totalWalks: keplerData.reduce((sum, day) => sum + day.walks, 0),
      primaryCaregiver: caregiverData[0]
    });
  };

  const getWeekOfYear = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const renderExpenseAnalytics = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg text-gray-800">${insights.avgMonthlySpending?.toFixed(2) || 0}</h4>
              <p className="text-sm text-gray-600">Avg Monthly Spending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="text-lg text-gray-800 capitalize">{insights.highestCategory?.[0] || 'N/A'}</h4>
              <p className="text-sm text-gray-600">Top Category</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.totalTransactions || 0}</h4>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Monthly Spending Trends</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#8B5CF6" fill="url(#colorGradient)" />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Spending by Person</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.personSpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#14B8A6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderCheckinAnalytics = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.actionItemCompletionRate?.toFixed(1) || 0}%</h4>
              <p className="text-sm text-gray-600">Action Item Completion</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.avgPositiveItems?.toFixed(1) || 0}</h4>
              <p className="text-sm text-gray-600">Avg Positive Items</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="text-lg text-gray-800">{data.totalCheckins || 0}</h4>
              <p className="text-sm text-gray-600">Total Check-ins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
        <h4 className="text-lg text-gray-800 mb-4">Weekly Progress Trends</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.moodTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="positiveItems" stroke="#10B981" strokeWidth={2} name="Positive Items" />
            <Line type="monotone" dataKey="improvementItems" stroke="#F59E0B" strokeWidth={2} name="Improvement Items" />
            <Line type="monotone" dataKey="completedActions" stroke="#8B5CF6" strokeWidth={2} name="Completed Actions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderChoreAnalytics = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.avgCompletionRate?.toFixed(1) || 0}%</h4>
              <p className="text-sm text-gray-600">Avg Completion Rate</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.bestWeek?.week || 'N/A'}</h4>
              <p className="text-sm text-gray-600">Best Week</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.totalChores || 0}</h4>
              <p className="text-sm text-gray-600">Active Chores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Weekly Completion Trends</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.completionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completionRate" fill="#8B5CF6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Chore Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.choreDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                nameKey="assignee"
              >
                {data.choreDistribution?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderKeplerAnalytics = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.avgCareScore?.toFixed(1) || 0}%</h4>
              <p className="text-sm text-gray-600">Avg Care Score</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.totalWalks || 0}</h4>
              <p className="text-sm text-gray-600">Weekly Walks</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-lg" style={glassStyle}>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="text-lg text-gray-800">{insights.primaryCaregiver?.name || 'N/A'}</h4>
              <p className="text-sm text-gray-600">Primary Caregiver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Daily Care Activity</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dailyCare}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="walks" fill="#14B8A6" radius={4} name="Walks" />
              <Bar dataKey="feeding" fill="#8B5CF6" radius={4} name="Feedings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-6 shadow-lg" style={glassStyle}>
          <h4 className="text-lg text-gray-800 mb-4">Care Responsibility Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.caregiverDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="tasks"
                nameKey="name"
              >
                {data.caregiverDistribution?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={['#8B5CF6', '#14B8A6', '#3B82F6'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'expenses':
        return renderExpenseAnalytics();
      case 'checkins':
        return renderCheckinAnalytics();
      case 'chores':
        return renderChoreAnalytics();
      case 'kepler':
        return renderKeplerAnalytics();
      default:
        return <div>No analytics available</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl text-gray-800 capitalize">{type} Analytics</h3>
        <select 
          value={timeRange} 
          onChange={(e) => setInsights({ ...insights, timeRange: e.target.value })}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
      {renderContent()}
    </div>
  );
}