import React, { useState } from 'react';
import { MessageSquare, Send, Users, CheckCircle, Clock, User } from 'lucide-react';
import { Student } from '../types';
import { 
  sendWhatsAppMessage, 
  sendBulkWhatsAppMessages,
  getWelcomeMessage, 
  getFeeConfirmationMessage, 
  getFeeReminderMessage, 
  getGoodbyeMessage,
  getCustomMessage,
  logNotification,
  getNotificationLogs,
  NotificationLog
} from '../services/notifications';

interface NotificationSystemProps {
  students: Student[];
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ students }) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'welcome' | 'fee_confirmation' | 'fee_reminder' | 'goodbye' | 'custom'>('fee_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(getNotificationLogs());

  const handleSingleNotification = (student: Student, type: typeof messageType, customMsg?: string) => {
    let message = '';
    
    if (type === 'custom' && customMsg) {
      message = getCustomMessage(customMsg, student.name);
    } else {
      switch (type) {
        case 'welcome':
          message = getWelcomeMessage(student.name, student.seatNumber);
          break;
        case 'fee_confirmation':
          message = getFeeConfirmationMessage(
            student.name, 
            student.totalFeesPaid, 
            new Date(student.feeExpiryDate).toLocaleDateString('en-IN')
          );
          break;
        case 'fee_reminder':
          message = getFeeReminderMessage(
            student.name, 
            new Date(student.feeExpiryDate).toLocaleDateString('en-IN')
          );
          break;
        case 'goodbye':
          message = getGoodbyeMessage(student.name);
          break;
      }
    }

    // Log the notification
    const log = logNotification(student.id, student.name, student.mobile, type, message);
    setNotificationLogs(prev => [log, ...prev]);

    // Open WhatsApp
    sendWhatsAppMessage(student.mobile, message);
  };

  const handleBulkNotification = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    const selectedStudentData = students.filter(s => selectedStudents.includes(s.id));
    
    let messageTemplate = customMessage;
    if (!customMessage) {
      switch (messageType) {
        case 'welcome':
          messageTemplate = getWelcomeMessage('{name}');
          break;
        case 'fee_confirmation':
          messageTemplate = 'Dear {name}, your fee payment has been received successfully. Thank you!';
          break;
        case 'fee_reminder':
          messageTemplate = 'Dear {name}, please renew your library membership. Thank you!';
          break;
        case 'goodbye':
          messageTemplate = getGoodbyeMessage('{name}');
          break;
        case 'custom':
          messageTemplate = customMessage || 'Hello {name}!';
          break;
      }
    }

    // Log all notifications
    selectedStudentData.forEach(student => {
      const personalizedMessage = messageTemplate.replace(/{name}/g, student.name);
      const log = logNotification(student.id, student.name, student.mobile, messageType, personalizedMessage);
      setNotificationLogs(prev => [log, ...prev]);
    });

    // Send bulk WhatsApp messages
    const contacts = selectedStudentData.map(s => ({ mobile: s.mobile, name: s.name }));
    sendBulkWhatsAppMessages(contacts, messageTemplate);

    // Reset selections
    setSelectedStudents([]);
    setCustomMessage('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-green-100 text-green-800';
      case 'fee_confirmation':
        return 'bg-blue-100 text-blue-800';
      case 'fee_reminder':
        return 'bg-orange-100 text-orange-800';
      case 'goodbye':
        return 'bg-purple-100 text-purple-800';
      case 'custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp Notifications</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span>{notificationLogs.length} notifications sent</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">How it works</h3>
            <p className="text-sm text-blue-700 mt-1">
              Click "Send Notification" to open WhatsApp with pre-filled messages. You can then send them manually to your students.
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Send Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Bulk Notifications</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Students</label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(students.map(s => s.id));
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">Select All ({students.length})</span>
              </label>
              {students.map(student => (
                <label key={student.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(prev => [...prev, student.id]);
                      } else {
                        setSelectedStudents(prev => prev.filter(id => id !== student.id));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">{student.name} - {student.mobile}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="welcome">Welcome Message</option>
                <option value="fee_confirmation">Fee Confirmation</option>
                <option value="fee_reminder">Fee Reminder</option>
                <option value="goodbye">Goodbye Message</option>
                <option value="custom">Custom Message</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message {messageType === 'custom' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Use {name} to personalize the message. Leave empty to use default template."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Use {'{name}'} in your message to automatically insert student names
              </p>
            </div>

            <button
              onClick={handleBulkNotification}
              disabled={selectedStudents.length === 0 || (messageType === 'custom' && !customMessage)}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send to {selectedStudents.length} students</span>
            </button>
          </div>
        </div>
      </div>

      {/* Individual Student Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Individual Notifications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.mobile}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(student.feeExpiryDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSingleNotification(student, 'welcome')}
                        className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded"
                      >
                        Welcome
                      </button>
                      <button
                        onClick={() => handleSingleNotification(student, 'fee_reminder')}
                        className="text-orange-600 hover:text-orange-900 text-xs bg-orange-100 px-2 py-1 rounded"
                      >
                        Reminder
                      </button>
                      <button
                        onClick={() => handleSingleNotification(student, 'fee_confirmation')}
                        className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                      >
                        Confirm
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notificationLogs.slice(0, 20).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.studentName}</div>
                    <div className="text-sm text-gray-500">{log.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(log.type)}`}>
                      {log.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.sentAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={log.message}>
                      {log.message}
                    </div>
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

export default NotificationSystem;