import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'bursalink_secret_key';

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Database (Mocking for Demo) ---
const db = {
  users: [
    { id: 'u1', name: 'John Doe', phone: '+254712345678', role: 'student', pin: '$2b$10$EixZAyVK1V6Vf.f1h0m.ueKq5f6r5hS6H8G6H8G6H8G6H8G6H8G' }, // Dummy bcrypt for '1234'
    { id: 'u2', name: 'Admin Sarah', phone: '+254787654321', role: 'admin', pin: '$2b$10$EixZAyVK1V6Vf.f1h0m.ueKq5f6r5hS6H8G6H8G6H8G6H8G6H8G' },
  ],
  students: [],
  applications: [],
  payments: [],
  auditLogs: [],
  approvals: [
    { id: 'req1', school: 'Nairobi National School', studentName: 'John Doe', amount: 25000, status: 'pending', submittedAt: new Date().toISOString() },
    { id: 'req2', school: 'Lavington Primary', studentName: 'Jane Smith', amount: 15000, status: 'pending', submittedAt: new Date().toISOString() },
    { id: 'req3', school: 'Westlands Academy', studentName: 'Peter Parker', amount: 45000, status: 'approved', submittedAt: new Date().toISOString() },
  ]
};

// --- Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// --- AI Scoring Logic ---
const calculateNeedScore = (data: any) => {
  let score = 0;
  if (data.incomeLevel === 'low') score += 30;
  if (data.orphanStatus) score += 25;
  if (data.disability) score += 15;
  score += (data.feeBurden / 100) * 20;
  score += (data.academicPerformance / 100) * 10;
  return Math.round(score);
};

// --- API Endpoints ---

// 1. Auth: Sign up/Login (OTP Simulation)
app.post('/api/auth/request-otp', (req, res) => {
  const { phone } = req.body;
  // In real world, send SMS via Twilio or Africa's Talking
  res.json({ message: 'OTP sent successfully', otpId: 'test_otp_id' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  // Hardcoded for demo: OTP 123456 always works
  if (otp === '123456' || otp === '111111') {
    let user = db.users.find(u => u.phone === phone);
    if (!user) {
      user = { id: `u${db.users.length + 1}`, name: 'New Student', phone, role: 'student', pin: '' };
      db.users.push(user);
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  }
  res.status(400).json({ error: 'Invalid OTP' });
});

// 2. Student: Profile setup
app.post('/api/student/profile', authenticate, (req: any, res) => {
  const schema = z.object({
    idNumber: z.string(),
    school: z.string(),
    incomeLevel: z.enum(['low', 'medium', 'high']),
    orphanStatus: z.boolean(),
    disability: z.boolean(),
    academicPerformance: z.number().min(0).max(100),
    feeBurden: z.number().min(0).max(100)
  });
  
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error });

  const profile = { ...result.data, userId: req.user.id };
  db.students.push(profile as any);
  res.json({ message: 'Profile saved successfully' });
});

// 3. Student: Apply for bursary
app.post('/api/applications', authenticate, (req: any, res) => {
  const studentProfile = db.students.find((s: any) => s.userId === req.user.id);
  if (!studentProfile) return res.status(400).json({ error: 'Complete profile first' });

  const score = calculateNeedScore(studentProfile);
  const application = {
    id: `app${db.applications.length + 1}`,
    studentId: req.user.id,
    studentName: req.user.name,
    school: (studentProfile as any).school,
    county: req.body.county || 'Nairobi',
    status: 'pending',
    score,
    submittedAt: new Date().toISOString(),
    documents: req.body.documents || []
  };

  db.applications.push(application as any);
  
  // Log activity
  db.auditLogs.push({ action: 'APPLICATION_SUBMITTED', user: req.user.id, timestamp: new Date().toISOString() });
  
  res.json(application);
});

// --- NEW ENDPOINTS FOR STUDENT DASHBOARD ---

// GET /api/student/{studentId}/fees-balance
app.get('/api/student/:studentId/fees-balance', (req, res) => {
  // Mock balance
  res.json({
    studentId: req.params.studentId,
    outstandingBalance: 45200,
    dueDate: '2024-05-15',
    currency: 'KSh'
  });
});

// GET /api/financial-status-report
app.get('/api/financial-status-report', (req, res) => {
  // Mock visualization data with some "anomalies"
  res.json({
    historicalData: [
      { month: 'Jan', amount: 12000, expected: 11000 },
      { month: 'Feb', amount: 10500, expected: 11000 },
      { month: 'Mar', amount: 11200, expected: 11000 },
      { month: 'Apr', amount: 18500, expected: 11000, anomaly: true }, // Anomaly
      { month: 'May', amount: 9800, expected: 11000 },
      { month: 'Jun', amount: 11500, expected: 11000 },
    ],
    anomaliesFound: 1,
    trustScore: 82
  });
});

// --- NEW ENDPOINTS FOR ADMIN APPROVALS ---

// GET /api/approvals (to list them)
app.get('/api/approvals', (req, res) => {
  res.json(db.approvals);
});

// POST /api/approvals/{requestId}/approve
app.post('/api/approvals/:requestId/approve', (req, res) => {
  const { requestId } = req.params;
  const approval = db.approvals.find(a => a.id === requestId);
  if (!approval) return res.status(404).json({ error: 'Request not found' });
  
  approval.status = 'approved';
  res.json({ message: 'Request approved successfully', approval });
});

// POST /api/approvals/{requestId}/reject
app.post('/api/approvals/:requestId/reject', (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  const approval = db.approvals.find(a => a.id === requestId);
  if (!approval) return res.status(404).json({ error: 'Request not found' });
  
  approval.status = 'rejected';
  (approval as any).rejectionReason = reason;
  res.json({ message: 'Request rejected successfully', approval });
});

// 4. Admin: View all applications
app.get('/api/admin/applications', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  res.json(db.applications);
});

// 5. Admin: Update application status
app.patch('/api/admin/applications/:id', authenticate, authorize(['admin', 'super_admin']), (req: any, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const app = db.applications.find((a: any) => a.id === id);
  if (!app) return res.status(404).json({ error: 'Not found' });

  (app as any).status = status;
  if (note) (app as any).notes = note;

  db.auditLogs.push({ action: `APPLICATION_${status.toUpperCase()}`, user: req.user.id, timestamp: new Date().toISOString() });

  res.json(app);
});

// 6. Public: Stats
app.get('/api/public/stats', (req, res) => {
  const approved = db.applications.filter((a: any) => a.status === 'approved');
  const totalFunds = approved.length * 15000; // Assume 15k per bursary
  res.json({
    totalFunds,
    applicantCount: db.applications.length,
    approvedCount: approved.length,
    beneficiaries: approved.map((a: any) => ({ name: a.studentName.split(' ')[0] + ' ****', school: a.school, county: a.county }))
  });
});

// 7. Payments: Simulate M-Pesa to School
app.post('/api/admin/disburse', authenticate, authorize(['super_admin']), (req, res) => {
  const { applicationId, amount, schoolAccount } = req.body;
  // Simulate M-Pesa B2B API call
  const payment = {
    id: `pay${db.payments.length + 1}`,
    applicationId,
    amount,
    schoolAccount,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
  db.payments.push(payment as any);
  res.json({ message: 'Payment disbursed successfully via M-Pesa', payment });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});