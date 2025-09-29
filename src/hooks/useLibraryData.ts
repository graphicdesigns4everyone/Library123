import { useState, useEffect } from 'react';
import { Student, Seat, FeeTransaction, Notification, DashboardStats } from '../types';
import { fetchStudentsFromCSV } from '../services/csvService';
import { sendWhatsAppMessage, getFeeConfirmationMessage, logNotification } from '../services/notifications';
import { getCurrentUser } from '../services/authService';

interface ActivityLog {
  id: string;
  type: 'registration' | 'payment' | 'seat_assignment' | 'reminder';
  message: string;
  timestamp: string;
  studentName?: string;
}

// Local storage keys - now user-specific
const getUserStorageKey = (key: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // Return a default key when no user is authenticated
    // This should not happen in normal flow but prevents crashes
    return `${key}_guest`;
  }
  return `${key}_${currentUser.id}`;
};

const SEATS_STORAGE_KEY = 'library_seats';
const TRANSACTIONS_STORAGE_KEY = 'library_transactions';
const ACTIVITY_STORAGE_KEY = 'library_activity';
const STUDENTS_STORAGE_KEY = 'library_students';

export const useLibraryData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage (user-specific)
  const loadFromStorage = () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log('No authenticated user found, skipping storage load');
        return;
      }

      const savedSeats = localStorage.getItem(getUserStorageKey(SEATS_STORAGE_KEY));
      const savedTransactions = localStorage.getItem(getUserStorageKey(TRANSACTIONS_STORAGE_KEY));
      const savedActivity = localStorage.getItem(getUserStorageKey(ACTIVITY_STORAGE_KEY));
      const savedStudents = localStorage.getItem(getUserStorageKey(STUDENTS_STORAGE_KEY));

      if (savedSeats) {
        setSeats(JSON.parse(savedSeats));
      }
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      if (savedActivity) {
        setActivityLog(JSON.parse(savedActivity));
      }
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Save data to localStorage (user-specific)
  const saveToStorage = (key: string, data: any) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log('No authenticated user found, skipping storage save');
        return;
      }
      localStorage.setItem(getUserStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Starting to load student data from CSV...');
        
        // For new users or when no saved students exist, load demo data
        // Otherwise load from storage
        const savedStudents = localStorage.getItem(getUserStorageKey(STUDENTS_STORAGE_KEY));
        if (!savedStudents) {
          const studentsFromCSV = await fetchStudentsFromCSV();
          console.log('Loaded students from CSV:', studentsFromCSV.length);
          setStudents(studentsFromCSV);
          saveToStorage(STUDENTS_STORAGE_KEY, studentsFromCSV);
        }
        
        // Load saved data from localStorage
        loadFromStorage();
        
        // Initialize seats if not already loaded
        const savedSeats = localStorage.getItem(getUserStorageKey(SEATS_STORAGE_KEY));
        if (!savedSeats) {
          const initialSeats: Seat[] = Array.from({ length: 102 }, (_, i) => ({
            number: i + 1,
            isOccupied: false,
          }));
          setSeats(initialSeats);
          saveToStorage(SEATS_STORAGE_KEY, initialSeats);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
        
        // Set empty data if loading fails
        setStudents([]);
        const initialSeats: Seat[] = Array.from({ length: 102 }, (_, i) => ({
          number: i + 1,
          isOccupied: false,
        }));
        setSeats(initialSeats);
        setTransactions([]);
        setActivityLog([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedActivity = [newActivity, ...activityLog.slice(0, 49)]; // Keep only last 50 activities
    setActivityLog(updatedActivity);
    saveToStorage(ACTIVITY_STORAGE_KEY, updatedActivity);
  };

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      // Generate new ID
      const newId = `student-${Date.now()}`;
      
      const newStudent: Student = {
        ...studentData,
        id: newId,
      };
      
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      saveToStorage(STUDENTS_STORAGE_KEY, updatedStudents);
      
      // Add to activity log
      addActivity({
        type: 'registration',
        message: `New student ${newStudent.name} registered successfully`,
        studentName: newStudent.name,
      });
      
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const student = students.find(s => s.id === id);
      if (!student) return;
      
      const updatedStudents = students.map(s => 
        s.id === id ? { ...s, ...updates } : s
      );
      setStudents(updatedStudents);
      saveToStorage(STUDENTS_STORAGE_KEY, updatedStudents);
      
      // Add to activity log if status changed
      if (updates.status && updates.status !== student.status) {
        addActivity({
          type: 'registration',
          message: `Student ${student.name} status changed to ${updates.status}`,
          studentName: student.name,
        });
      }
      
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student?.seatNumber) {
      releaseSeat(student.seatNumber);
    }
    const updatedStudents = students.filter(student => student.id !== id);
    setStudents(updatedStudents);
    saveToStorage(STUDENTS_STORAGE_KEY, updatedStudents);
    
    if (student) {
      addActivity({
        type: 'registration',
        message: `Student ${student.name} removed from system`,
        studentName: student.name,
      });
    }
  };

  const assignSeat = (seatNumber: number, studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Update seat
    const updatedSeats = seats.map(seat => 
      seat.number === seatNumber 
        ? { 
            ...seat, 
            isOccupied: true, 
            studentId, 
            studentName: student.name,
            assignedDate: new Date().toISOString().split('T')[0]
          }
        : seat
    );
    setSeats(updatedSeats);
    saveToStorage(SEATS_STORAGE_KEY, updatedSeats);

    // Update student
    updateStudent(studentId, { seatNumber });
    
    // Add to activity log
    addActivity({
      type: 'seat_assignment',
      message: `Seat ${seatNumber} assigned to ${student.name}`,
      studentName: student.name,
    });
  };

  const releaseSeat = (seatNumber: number) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (!seat?.studentId) return;

    // Update seat
    const updatedSeats = seats.map(s => 
      s.number === seatNumber 
        ? { 
            ...s, 
            isOccupied: false, 
            studentId: undefined, 
            studentName: undefined,
            assignedDate: undefined
          }
        : s
    );
    setSeats(updatedSeats);
    saveToStorage(SEATS_STORAGE_KEY, updatedSeats);

    // Update student
    updateStudent(seat.studentId, { seatNumber: undefined });
    
    // Add to activity log
    const student = students.find(s => s.id === seat.studentId);
    if (student) {
      addActivity({
        type: 'seat_assignment',
        message: `Seat ${seatNumber} released from ${student.name}`,
        studentName: student.name,
      });
    }
  };

  const addTransaction = async (transactionData: Omit<FeeTransaction, 'id' | 'receiptNumber'>) => {
    const newTransaction: FeeTransaction = {
      ...transactionData,
      id: Date.now().toString(),
      receiptNumber: `RCP${String(transactions.length + 1).padStart(3, '0')}`,
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveToStorage(TRANSACTIONS_STORAGE_KEY, updatedTransactions);
    
    // Update student fee expiry and total paid
    const student = students.find(s => s.id === transactionData.studentId);
    const updatedTotalFees = (student?.totalFeesPaid || 0) + transactionData.amount;
    
    await updateStudent(transactionData.studentId, {
      feeExpiryDate: transactionData.expiryDate,
      lastFeePayment: transactionData.transactionDate,
      paymentMode: transactionData.paymentMode,
      totalFeesPaid: updatedTotalFees,
    });
    
    // Add to activity log
    addActivity({
      type: 'payment',
      message: `Fee payment of ₹${transactionData.amount} received from ${transactionData.studentName}`,
      studentName: transactionData.studentName,
    });
    
    // Send fee confirmation WhatsApp message
    if (student) {
      try {
        const message = getFeeConfirmationMessage(
          student.name, 
          transactionData.amount, 
          new Date(transactionData.expiryDate).toLocaleDateString('en-IN')
        );
        sendWhatsAppMessage(student.mobile, message);
        logNotification(student.id, student.name, student.mobile, 'fee_confirmation', message);
      } catch (error) {
        console.error('Error sending fee confirmation WhatsApp message:', error);
      }
    }
  };

  const getDashboardStats = (): DashboardStats => {
    const activeStudents = students.filter(s => s.status === 'active').length;
    const occupiedSeats = seats.filter(s => s.isOccupied).length;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTransactions = transactions.filter(t => t.transactionDate.startsWith(currentMonth));
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const expiringToday = students.filter(s => s.feeExpiryDate === today).length;
    const expiringThisWeek = students.filter(s => s.feeExpiryDate <= nextWeek && s.feeExpiryDate >= today).length;
    const pendingFees = students.filter(s => new Date(s.feeExpiryDate) < new Date()).length;

    return {
      totalStudents: students.length,
      activeStudents,
      occupiedSeats,
      availableSeats: 102 - occupiedSeats,
      monthlyRevenue,
      pendingFees,
      expiringToday,
      expiringThisWeek,
    };
  };

  const getRecentActivity = (limit: number = 10) => {
    return activityLog
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        timestamp: new Date(activity.timestamp).toLocaleString('en-IN'),
        studentName: activity.studentName,
      }));
  };

  return {
    students,
    seats,
    transactions,
    notifications,
    activityLog,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    assignSeat,
    releaseSeat,
    addTransaction,
    getDashboardStats,
    getRecentActivity,
    error,
  };
};