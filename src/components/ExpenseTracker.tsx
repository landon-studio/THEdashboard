import React, { useState, useEffect } from 'react';
import { 
  DollarSign,
  Plus,
  Receipt,
  Users,
  TrendingUp,
  Calendar,
  Edit3,
  Trash2,
  Download,
  Upload,
  PieChart,
  CreditCard,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { localStorageUtil } from '../utils/localStorage';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'groceries' | 'utilities' | 'household' | 'rent' | 'pet' | 'personal' | 'other';
  paidBy: string;
  splitWith: string[];
  date: string;
  receipt?: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'groceries',
    paidBy: 'Landon',
    splitWith: ['Everyone'],
    date: new Date().toISOString().split('T')[0]
  });

  const residents = ['Nick', 'Alex', 'Landon', 'Everyone'];
  
  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  useEffect(() => {
    const savedExpenses = localStorageUtil.getDataByKey('expenses') || [];
    setExpenses(savedExpenses);
  }, []);

  const saveExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    localStorageUtil.saveData('expenses', updatedExpenses);
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense: Expense = {
        id: `expense-${Date.now()}`,
        description: newExpense.description,
        amount: newExpense.amount,
        category: newExpense.category || 'other',
        paidBy: newExpense.paidBy || 'Landon',
        splitWith: newExpense.splitWith || ['Everyone'],
        date: newExpense.date || new Date().toISOString().split('T')[0]
      };
      
      saveExpenses([...expenses, expense]);
      setNewExpense({
        category: 'groceries',
        paidBy: 'Landon',
        splitWith: ['Everyone'],
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
    }
  };

  const deleteExpense = (expenseId: string) => {
    saveExpenses(expenses.filter(e => e.id !== expenseId));
  };

  const calculateSplits = (): Settlement[] => {
    const balances: { [person: string]: number } = {
      'Nick': 0,
      'Alex': 0,
      'Landon': 0
    };

    expenses.forEach(expense => {
      const splitCount = expense.splitWith.includes('Everyone') ? 3 : expense.splitWith.length;
      const splitAmount = expense.amount / splitCount;
      
      // Add to payer's balance
      if (expense.paidBy !== 'Everyone') {
        balances[expense.paidBy] += expense.amount;
      }
      
      // Subtract each person's share
      if (expense.splitWith.includes('Everyone')) {
        Object.keys(balances).forEach(person => {
          balances[person] -= splitAmount;
        });
      } else {
        expense.splitWith.forEach(person => {
          if (person !== 'Everyone') {
            balances[person] -= splitAmount;
          }
        });
      }
    });

    // Calculate settlements
    const settlements: Settlement[] = [];
    const debtors = Object.entries(balances).filter(([_, balance]) => balance < 0);
    const creditors = Object.entries(balances).filter(([_, balance]) => balance > 0);

    debtors.forEach(([debtor, debt]) => {
      let remainingDebt = Math.abs(debt);
      
      creditors.forEach(([creditor, credit]) => {
        if (remainingDebt > 0 && credit > 0) {
          const settlementAmount = Math.min(remainingDebt, credit);
          settlements.push({
            from: debtor,
            to: creditor,
            amount: settlementAmount
          });
          remainingDebt -= settlementAmount;
          balances[creditor] -= settlementAmount;
        }
      });
    });

    return settlements;
  };

  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    const colors = ['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#6366F1'];
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount,
      color: colors[index % colors.length]
    }));
  };

  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });

    return Object.entries(monthlyTotals).map(([month, total]) => ({
      month,
      total
    }));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'groceries': return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'utilities': return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'household': return <Receipt className="w-4 h-4 text-purple-600" />;
      case 'pet': return <Users className="w-4 h-4 text-red-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const settlements = calculateSplits();
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[#676767] to-[#E8A587] bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="text-gray-600 mt-1">Track shared expenses and settle balances fairly.</p>
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
            onClick={() => localStorageUtil.exportData()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E8A587] to-[#C99A82] text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl text-gray-800">${getTotalExpenses().toFixed(2)}</h3>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl text-gray-800">{expenses.length}</h3>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl text-gray-800">{settlements.length}</h3>
              <p className="text-sm text-gray-600">Pending Settlements</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl text-gray-800">${(getTotalExpenses() / 3).toFixed(2)}</h3>
              <p className="text-sm text-gray-600">Per Person Average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <h3 className="text-lg text-gray-800 mb-6">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}: ${item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No expenses yet</p>
            </div>
          )}
        </div>

        {/* Monthly Spending */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <h3 className="text-lg text-gray-800 mb-6">Monthly Spending</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="total" fill="#8B5CF6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No monthly data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="rounded-2xl p-6 shadow-xl border-l-4 border-orange-500" style={glassStyle}>
          <h3 className="text-lg text-gray-800 mb-4">Who Owes What</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settlements.map((settlement, index) => (
              <div key={index} className="p-4 bg-orange-50/30 rounded-lg border border-orange-200/30">
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">{settlement.from}</span>
                  <span className="text-orange-600">→</span>
                  <span className="text-orange-700">{settlement.to}</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg text-orange-800">${settlement.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg text-gray-800">Recent Expenses</h3>
          <span className="text-sm text-gray-600">{expenses.length} total</span>
        </div>
        
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.slice(-10).reverse().map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                  {getCategoryIcon(expense.category)}
                  <div>
                    <h4 className="text-gray-800">{expense.description}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Paid by {expense.paidBy}</span>
                      <span>Split with {expense.splitWith.join(', ')}</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg text-gray-800">${expense.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 capitalize">{expense.category}</div>
                  </div>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 text-red-600 hover:bg-red-50/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No expenses recorded yet</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 shadow-xl max-w-md w-full" style={glassStyle}>
            <h3 className="text-lg text-gray-800 mb-6">Add New Expense</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newExpense.description || ''}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What was this expense for?"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="groceries">Groceries</option>
                  <option value="utilities">Utilities</option>
                  <option value="household">Household Items</option>
                  <option value="rent">Rent</option>
                  <option value="pet">Pet Expenses</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Paid By</label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {residents.filter(r => r !== 'Everyone').map(resident => (
                    <option key={resident} value={resident}>{resident}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Split With</label>
                <select
                  value={newExpense.splitWith?.[0] || 'Everyone'}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, splitWith: [e.target.value] }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {residents.map(resident => (
                    <option key={resident} value={resident}>{resident}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addExpense}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-8">
          <AnalyticsDashboard type="expenses" />
        </div>
      )}
    </div>
  );
}