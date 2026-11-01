import { Application, User, Notification } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', phone: '+254712345678', role: 'student', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: 'u2', name: 'Admin Sarah', phone: '+254787654321', role: 'admin' },
];

export const mockApplications: Application[] = [
  {
    id: 'app1',
    studentId: 'u1',
    studentName: 'John Doe',
    school: 'Nairobi National School',
    county: 'Nairobi',
    status: 'pending',
    score: 85,
    submittedAt: new Date().toISOString(),
    documents: [
      { name: 'Admission Letter.pdf', url: '#', type: 'PDF' },
      { name: 'Fee Structure.pdf', url: '#', type: 'PDF' },
    ]
  },
  {
    id: 'app2',
    studentId: 'u3',
    studentName: 'Jane Smith',
    school: 'Mombasa Secondary',
    county: 'Mombasa',
    status: 'approved',
    score: 92,
    submittedAt: '2023-11-20T10:00:00Z',
    documents: []
  },
  {
    id: 'app3',
    studentId: 'u4',
    studentName: 'Kamau Maina',
    school: 'Nakuru High',
    county: 'Nakuru',
    status: 'rejected',
    score: 45,
    submittedAt: '2023-11-18T09:30:00Z',
    documents: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Application Received',
    message: 'Your bursary application for 2024 has been received.',
    status: 'unread',
    timestamp: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Profile Updated',
    message: 'Your school details have been updated successfully.',
    status: 'read',
    timestamp: '2023-11-20T14:00:00Z'
  }
];