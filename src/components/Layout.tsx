import React, { useState } from 'react';
import { BookOpen, Users, CreditCard, Bell, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'seats', label: 'Seats', icon: BookOpen },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Library Management</h1>
                {currentUser && (
                  <p className="text-sm text-gray-600">{currentUser.libraryName}</p>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Info and Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* User Info - Hidden on small screens */}
              {currentUser && (
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                    <p className="text-xs text-gray-600">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              
              {/* Mobile User Info and Logout */}
              {currentUser && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                    <p className="text-xs text-gray-600">{currentUser.email}</p>
                    <p className="text-xs text-gray-600">{currentUser.libraryName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;