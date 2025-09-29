import { Users, MapPin, DollarSign, AlertTriangle, UserPlus, CreditCard, Wheat as Seat, Bell } from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  recentActivity: Array<{
    id: string;
    type: 'registration' | 'payment' | 'fee_payment' | 'seat_assignment' | 'reminder';
    message: string;
    timestamp: string;
    studentName?: string;
  }>;
  onQuickAction: (action: 'add-student' | 'record-payment' | 'assign-seat' | 'send-reminders') => void;
}

export default function Dashboard({ stats, recentActivity, onQuickAction }: DashboardProps) {
  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Students',
      value: stats.activeStudents,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Occupied Seats',
      value: `${stats.occupiedSeats}/102`,
      icon: MapPin,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pending Fees',
      value: stats.pendingFees,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Expiring This Week',
      value: stats.expiringThisWeek,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Student',
      description: 'Register a new student',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: 'add-student' as const
    },
    {
      title: 'Record Fee Payment',
      description: 'Process fee payment',
      icon: CreditCard,
      color: 'bg-green-500 hover:bg-green-600',
      action: 'record-payment' as const
    },
    {
      title: 'Assign Seat',
      description: 'Allocate seat to student',
      icon: Seat,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: 'assign-seat' as const
    },
    {
      title: 'Send Reminders',
      description: 'Send fee reminders',
      icon: Bell,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: 'send-reminders' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction(action.action)}
                className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 text-left`}
              >
                <IconComponent className="h-8 w-8 mb-2" />
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <p className="text-xs opacity-90">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {(activity.type === 'registration' || activity.type === 'seat_assignment') && (
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  {(activity.type === 'payment' || activity.type === 'fee_payment') && (
                    <div className="bg-green-100 p-2 rounded-full">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'reminder' && (
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Bell className="h-4 w-4 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}