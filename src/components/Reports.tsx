import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, BookOpen, DollarSign, Filter, FileText } from 'lucide-react';
import { Student, FeeTransaction } from '../types';

interface ReportsProps {
  students: Student[];
  transactions: FeeTransaction[];
}

const Reports: React.FC<ReportsProps> = ({ students, transactions }) => {
  const [selectedReport, setSelectedReport] = useState<'monthly' | 'student' | 'seat' | 'revenue'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Monthly Fee Report Data
  const monthlyTransactions = transactions.filter(t => t.transactionDate.startsWith(selectedMonth));
  const monthlyStats = {
    totalCollection: monthlyTransactions.reduce((sum, t) => sum + t.amount, 0),
    onlineCollection: monthlyTransactions.filter(t => t.paymentMode === 'online').reduce((sum, t) => sum + t.amount, 0),
    offlineCollection: monthlyTransactions.filter(t => t.paymentMode === 'offline').reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: monthlyTransactions.length,
    onlineTransactions: monthlyTransactions.filter(t => t.paymentMode === 'online').length,
    offlineTransactions: monthlyTransactions.filter(t => t.paymentMode === 'offline').length,
  };

  // Student Activity Report Data
  const yearlyStudents = students.filter(s => s.registrationDate.startsWith(selectedYear));
  const studentStats = {
    newRegistrations: yearlyStudents.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    inactiveStudents: students.filter(s => s.status === 'inactive').length,
    expiredStudents: students.filter(s => s.status === 'expired').length,
    studentsWithSeats: students.filter(s => s.seatNumber).length,
  };

  // Seat Utilization Report Data
  const seatStats = {
    totalSeats: 102,
    occupiedSeats: students.filter(s => s.seatNumber).length,
    availableSeats: 102 - students.filter(s => s.seatNumber).length,
    utilizationRate: Math.round((students.filter(s => s.seatNumber).length / 102) * 100),
  };

  // Revenue Analytics Data
  const yearlyTransactions = transactions.filter(t => t.transactionDate.startsWith(selectedYear));
  const revenueStats = {
    yearlyRevenue: yearlyTransactions.reduce((sum, t) => sum + t.amount, 0),
    averageMonthlyRevenue: Math.round(yearlyTransactions.reduce((sum, t) => sum + t.amount, 0) / 12),
    averageTransactionValue: Math.round(yearlyTransactions.reduce((sum, t) => sum + t.amount, 0) / yearlyTransactions.length) || 0,
    totalTransactions: yearlyTransactions.length,
  };

  const exportToCSV = (reportType: string, data: any[]) => {
    let headers: string[] = [];
    let csvData: any[][] = [];

    switch (reportType) {
      case 'monthly':
        headers = ['Date', 'Student', 'Amount', 'Payment Mode', 'Method', 'Receipt'];
        csvData = monthlyTransactions.map(t => [
          t.transactionDate,
          t.studentName,
          t.amount,
          t.paymentMode,
          t.paymentMethod,
          t.receiptNumber
        ]);
        break;
      case 'student':
        headers = ['Name', 'Mobile', 'Registration Date', 'Status', 'Seat', 'Total Fees Paid'];
        csvData = yearlyStudents.map(s => [
          s.name,
          s.mobile,
          s.registrationDate,
          s.status,
          s.seatNumber || 'Not Assigned',
          s.totalFeesPaid
        ]);
        break;
      case 'seat':
        headers = ['Seat Number', 'Status', 'Student Name', 'Assigned Date'];
        csvData = Array.from({ length: 102 }, (_, i) => {
          const seatNumber = i + 1;
          const student = students.find(s => s.seatNumber === seatNumber);
          return [
            seatNumber,
            student ? 'Occupied' : 'Available',
            student?.name || '-',
            student?.registrationDate || '-'
          ];
        });
        break;
      case 'revenue':
        headers = ['Month', 'Revenue', 'Transactions', 'Average Transaction'];
        // Generate monthly breakdown for the year
        csvData = Array.from({ length: 12 }, (_, i) => {
          const month = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
          const monthTransactions = transactions.filter(t => t.transactionDate.startsWith(month));
          const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
          return [
            month,
            monthRevenue,
            monthTransactions.length,
            monthTransactions.length ? Math.round(monthRevenue / monthTransactions.length) : 0
          ];
        });
        break;
    }

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${selectedMonth || selectedYear}.csv`;
    a.click();
  };

  const renderMonthlyReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collection</p>
              <p className="text-2xl font-bold text-gray-900">₹{monthlyStats.totalCollection.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Collection</p>
              <p className="text-2xl font-bold text-green-600">₹{monthlyStats.onlineCollection.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Collection</p>
              <p className="text-2xl font-bold text-blue-600">₹{monthlyStats.offlineCollection.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Mode Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Online Payments</h4>
              <p className="text-2xl font-bold text-green-600">₹{monthlyStats.onlineCollection.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{monthlyStats.onlineTransactions} transactions</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Cash Payments</h4>
              <p className="text-2xl font-bold text-blue-600">₹{monthlyStats.offlineCollection.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{monthlyStats.offlineTransactions} transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{studentStats.newRegistrations}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-green-600">{studentStats.activeStudents}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Seats</p>
              <p className="text-2xl font-bold text-purple-600">{studentStats.studentsWithSeats}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{studentStats.expiredStudents}</p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeatReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Seats</p>
              <p className="text-2xl font-bold text-gray-900">{seatStats.totalSeats}</p>
            </div>
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-green-600">{seatStats.occupiedSeats}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-blue-600">{seatStats.availableSeats}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
              <p className="text-2xl font-bold text-purple-600">{seatStats.utilizationRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yearly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{revenueStats.yearlyRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
              <p className="text-2xl font-bold text-blue-600">₹{revenueStats.averageMonthlyRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
              <p className="text-2xl font-bold text-purple-600">₹{revenueStats.averageTransactionValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-600">{revenueStats.totalTransactions}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <button
          onClick={() => exportToCSV(selectedReport, [])}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedReport('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedReport === 'monthly'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly Fee Report
            </button>
            <button
              onClick={() => setSelectedReport('student')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedReport === 'student'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Student Activity
            </button>
            <button
              onClick={() => setSelectedReport('seat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedReport === 'seat'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Seat Utilization
            </button>
            <button
              onClick={() => setSelectedReport('revenue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedReport === 'revenue'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Revenue Analytics
            </button>
          </div>
          
          <div className="flex space-x-2">
            {(selectedReport === 'monthly') && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            {(selectedReport === 'student' || selectedReport === 'revenue') && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'monthly' && renderMonthlyReport()}
      {selectedReport === 'student' && renderStudentReport()}
      {selectedReport === 'seat' && renderSeatReport()}
      {selectedReport === 'revenue' && renderRevenueReport()}
    </div>
  );
};

export default Reports;