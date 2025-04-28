import React, { useState } from 'react';
import { useAppSettings } from '../../utils/useAppSettings';

function ExpenseTracker({ tripExpenses, updateTripExpenses }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get currency formatter from app settings
  const { currency } = useAppSettings();
  
  const addExpense = () => {
    if (amount && description) {
      const newExpense = {
        id: Date.now(),
        amount: Number(amount),
        description,
        category,
        date
      };
      
      updateTripExpenses([...tripExpenses, newExpense]);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('food');
    }
  };
  
  const removeExpense = (id) => {
    updateTripExpenses(tripExpenses.filter(expense => expense.id !== id));
  };
  
  // Calculate totals
  const totalSpent = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by category
  const expensesByCategory = tripExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Trip Expense Tracker</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add New Expense */}
        <div>
          <h4 className="font-semibold mb-3">Add New Expense</h4>
          
          <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What did you spend on?"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="food">Food</option>
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
                <option value="activities">Activities</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <button
              onClick={addExpense}
              disabled={!amount || !description}
              className={`w-full py-2 rounded ${
                !amount || !description
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Add Expense
            </button>
          </div>
        </div>
        
        {/* Expense Summary */}
        <div>
          <h4 className="font-semibold mb-3">Expense Summary</h4>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <p className="text-gray-700">Total Spent</p>
              <p className="text-3xl font-bold text-blue-700">{currency(totalSpent)}</p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">Breakdown by Category:</h5>
              
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between">
                  <span className="capitalize">{cat}:</span>
                  <span className="font-medium">{currency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <h4 className="font-semibold text-yellow-800">Expense Tracking Tips:</h4>
            <ul className="mt-1 ml-4 list-disc text-yellow-800">
              <li>Track expenses as they occur to stay on budget</li>
              <li>Save receipts and take photos for reference</li>
              <li>Set daily spending limits for better control</li>
              <li>Consider using local payment methods to avoid fees</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Expense List */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">Recent Expenses</h4>
        
        {tripExpenses.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-left">Category</th>
                  <th className="py-2 px-4 border-b text-right">Amount</th>
                  <th className="py-2 px-4 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {tripExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{expense.date}</td>
                    <td className="py-2 px-4 border-b">{expense.description}</td>
                    <td className="py-2 px-4 border-b capitalize">{expense.category}</td>
                    <td className="py-2 px-4 border-b text-right">{currency(expense.amount)}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <button
                        onClick={() => removeExpense(expense.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;