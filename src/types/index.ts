export interface Student {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  parentName: string;
  parentMobile: string;
  address?: string;
  vehicleNumber?: string;
  photo?: string;
  seatNumber?: number;
  registrationDate: string;
  feeExpiryDate: string;
  lastFeePayment?: string;
  status: 'active' | 'inactive' | 'expired';
  paymentMode?: 'online' | 'offline';
  totalFeesPaid: number;
}

export interface Seat {
  number: number;
  isOccupied: boolean;
  studentId?: string;
  studentName?: string;
  assignedDate?: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMode: 'online' | 'offline';
  paymentMethod: string; // 'UPI', 'Cash', 'Card', etc.
  transactionDate: string;
  expiryDate: string;
  receiptNumber: string;
}

export interface Notification {
  id: string;
  studentId: string;
  type: 'welcome' | 'fee_confirmation' | 'fee_reminder' | 'goodbye';
  message: string;
  sentDate: string;
  status: 'sent' | 'pending' | 'failed';
  channel: 'sms' | 'whatsapp' | 'email';
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  occupiedSeats: number;
  availableSeats: number;
  monthlyRevenue: number;
  pendingFees: number;
  expiringToday: number;
  expiringThisWeek: number;
}