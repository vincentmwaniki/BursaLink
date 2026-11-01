export type UserRole = 'student' | 'admin' | 'super_admin' | 'public';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export interface StudentProfile {
  userId: string;
  idNumber: string;
  school: string;
  incomeLevel: 'low' | 'medium' | 'high';
  orphanStatus: boolean;
  disability: boolean;
  academicPerformance: number; // 0-100
  feeBurden: number; // 0-100
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  school: string;
  county: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  score: number;
  submittedAt: string;
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'read' | 'unread';
  timestamp: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  schoolAccount: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}