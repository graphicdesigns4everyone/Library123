import React, { useState } from 'react';
import { Plus, Search, Download, CreditCard, Calendar, Filter } from 'lucide-react';
import { FeeTransaction, Student } from '../types';

interface FeeManagementProps {
  transactions: FeeTransaction[];
  students: Student[];
  onAddTransaction: (transaction: Omit<FeeTransaction, 'id' | 'receiptNumber'>) => void;
}

const FeeManagement: React.FC<FeeManagementProps> = ({
  transactions,
  students,
  onAddTransaction,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.receiptNumber.includes(searchTerm);
    const matchesMode = filterMode === 'all' || transaction.paymentMode === filterMode;
    const matchesMonth = transaction.transactionDate.startsWith(selectedMonth);
    
    return matchesSearch && matchesMode && matchesMonth;
  });

  const monthlyStats = {
    total: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    online: filteredTransactions.filter(t => t.paymentMode === 'online').reduce((sum, t) => sum + t.amount, 0),
    offline: filteredTransactions.filter(t => t.paymentMode === 'offline').reduce((sum, t) => sum + t.amount, 0),
    count: filteredTransactions.length,
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const studentId = formData.get('studentId') as string;
    const student = students.find(s => s.id === studentId);
    
    if (!student) return;

    const transactionData = {
      studentId,
      studentName: student.name,
      amount: Number(formData.get('amount')),
      expiryDate: formData.get('expiryDate') as string,
      paymentMode: formData.get('paymentMode') as 'online' | 'offline',
      paymentMethod: formData.get('paymentMethod') as string,
      transactionDate: new Date().toISOString().split('T')[0],
    };

    onAddTransaction(transactionData);
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Student', 'Amount', 'Payment Mode', 'Method', 'Receipt'];
    const csvData = filteredTransactions.map(t => [
      t.transactionDate,
      t.studentName,
      t.amount,
      t.paymentMode,
      t.paymentMethod,
      t.receiptNumber
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-report-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Fee Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collection</p>
              <p className="text-2xl font-bold text-gray-900">₹{monthlyStats.total.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Payments</p>
              <p className="text-2xl font-bold text-green-600">₹{monthlyStats.online.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Payments</p>
              <p className="text-2xl font-bold text-blue-600">₹{monthlyStats.offline.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-purple-600">{monthlyStats.count}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or receipt number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as 'all' | 'online' | 'offline')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Payments</option>
            <option value="online">Online Only</option>
            <option value="offline">Cash Only</option>
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Payment Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Fee Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  name="studentId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.mobile}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  name="paymentMode"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Method</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.transactionDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.studentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.paymentMode === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.paymentMode}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{transaction.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.expiryDate).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;