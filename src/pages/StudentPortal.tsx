import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FilePlus, 
  Bell, 
  User, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight,
  Upload,
  ArrowLeft,
  Smartphone,
  GraduationCap,
  TrendingUp,
  Settings,
  RefreshCcw,
  AlertTriangle,
  Wallet,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { mockNotifications, mockUsers } from '../lib/mockData';
import { Notification } from '../lib/types';
import { DiscoverView } from '../components/DiscoverView';
import { LocationSetup } from '../components/LocationSetup';
import { canStudentApply } from '../lib/mockBursaries';
import type { Bursary } from '../lib/mockBursaries';
import type { StudentLocation } from '../lib/mockLocations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface StudentPortalProps {
  onLogout: () => void;
}

export const StudentPortal = ({ onLogout }: StudentPortalProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'discover' | 'apply' | 'notifications' | 'profile'>('dashboard');
  const [isLoginView, setIsLoginView] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [studentLocation, setStudentLocation] = useState<StudentLocation | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [selectedBursary, setSelectedBursary] = useState<Bursary | null>(null);

  // Handle Login
  const handleLogin = () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsLoginView(false);
    toast.success('OTP sent to ' + phone);
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setIsLoggedIn(true);
    toast.success('Welcome back, John!');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Student Portal</h1>
            <p className="text-slate-500">Secure access to your bursary dashboard</p>
          </div>

          <AnimatePresence mode="wait">
            {isLoginView ? (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. 0712 345 678"
                    className="w-full p-4 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Send OTP
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-4 text-center">Enter 6-digit OTP</label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-xl font-bold bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleVerifyOtp}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Verify & Continue
                </button>
                <button 
                  onClick={() => setIsLoginView(true)}
                  className="w-full text-slate-500 font-medium py-2"
                >
                  Change Phone Number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // After login, a new student must choose their county, constituency and ward.
  if (!studentLocation) {
    return (
      <LocationSetup
        onComplete={(loc) => {
          setStudentLocation(loc);
          toast.success('Area saved: ' + loc.ward + ', ' + loc.constituency);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b">
        <div className="flex items-center gap-3">
          <img 
            src={mockUsers[0].avatar} 
            alt="User" 
            className="w-10 h-10 rounded-full border-2 border-blue-100"
          />
          <div>
            <p className="text-xs text-slate-500 font-medium">Hello,</p>
            <p className="font-bold">{mockUsers[0].name}</p>
          </div>
        </div>
        <button className="relative p-2" onClick={() => setActiveTab('notifications')}>
          <Bell className="w-6 h-6 text-slate-600" />
          {notifications.some(n => n.status === 'unread') && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardView key="dash" />}
          {activeTab === 'discover' && (
            <DiscoverView
              key="discover"
              appliedIds={appliedIds}
              studentLocation={studentLocation}
              onApply={(b) => {
                setSelectedBursary(b);
                setActiveTab('apply');
                setStep(1);
              }}
            />
          )}
          {activeTab === 'apply' && (
            <ApplyView 
              key="apply" 
              step={step} 
              bursaryTitle={selectedBursary ? selectedBursary.title : null}
              onChoose={() => setActiveTab('discover')}
              onNext={() => setStep(s => s + 1)} 
              onBack={() => step > 1 ? setStep(s => s - 1) : setActiveTab('dashboard')} 
              onSubmit={() => {
                if (!selectedBursary) {
                  toast.error('Please choose a bursary in Discover first.');
                  setActiveTab('discover');
                  return;
                }
                if (appliedIds.includes(selectedBursary.id)) {
                  toast.error('You have already applied to this bursary.');
                  setActiveTab('discover');
                  return;
                }
                if (!canStudentApply(selectedBursary, studentLocation)) {
                  toast.error('This bursary is not open to your area.');
                  setActiveTab('discover');
                  return;
                }
                setAppliedIds((prev) => [...prev, selectedBursary.id]);
                toast.success('Application submitted: ' + selectedBursary.title);
                setSelectedBursary(null);
                setActiveTab('discover');
              }}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsView 
              key="notif" 
              notifications={notifications} 
              onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
              onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, status: 'read'})))}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView key="profile" onLogout={onLogout} location={studentLocation} />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex items-center justify-between shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <NavItem
          icon={<LayoutDashboard />}
          label="Home"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
        <NavItem
          icon={<Search />}
          label="Discover"
          active={activeTab === 'discover'}
          onClick={() => setActiveTab('discover')}
        />
        <NavItem
          icon={<FilePlus />}
          label="Apply"
          active={activeTab === 'apply'}
          onClick={() => { setActiveTab('apply'); setStep(1); }}
        />
        <NavItem
          icon={<User />}
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-600' : 'text-slate-400'}`}
  >
    {React.cloneElement(icon, { className: 'w-6 h-6' })}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const DashboardView = () => {
  const [feesData, setFeesData] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [errorFees, setErrorFees] = useState<string | null>(null);

  const fetchFeesBalance = async () => {
    setIsLoadingFees(true);
    setErrorFees(null);
    try {
      const response = await fetch('/api/student/u1/fees-balance');
      if (!response.ok) throw new Error('Failed to fetch fees balance');
      const data = await response.json();
      setFeesData(data);
    } catch (err: any) {
      setErrorFees(err.message);
      toast.error(err.message);
    } finally {
      setIsLoadingFees(false);
    }
  };

  const fetchFinancialReport = async () => {
    setIsLoadingReport(true);
    try {
      const response = await fetch('/api/financial-status-report');
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      // Ensure historicalData is always an array
      if (data && !Array.isArray(data.historicalData)) {
        data.historicalData = [];
      }
      setFinancialReport(data);
    } catch (err: any) {
      toast.error('Financial report unavailable');
      setFinancialReport({ historicalData: [] });
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchFeesBalance();
    fetchFinancialReport();
  }, []);

  const historicalData = financialReport?.historicalData || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
        <p className="text-blue-100 text-sm mb-1">Current Status</p>
        <h3 className="text-2xl font-bold mb-4">Under Review</h3>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 2 ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
        <p className="text-xs text-blue-100 mt-4 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Est. response: 5-7 working days
        </p>
      </div>

      {/* Real-time Fees Balance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">Outstanding Fees</h3>
          </div>
          <button 
            onClick={fetchFeesBalance} 
            disabled={isLoadingFees}
            className={`p-2 rounded-lg hover:bg-slate-50 transition-all ${isLoadingFees ? 'animate-spin' : ''}`}
          >
            <RefreshCcw className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {isLoadingFees ? (
          <div className="h-20 flex flex-col justify-center gap-2">
            <div className="h-8 w-2/3 bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-slate-50 animate-pulse rounded" />
          </div>
        ) : errorFees ? (
          <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 border border-red-100">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">{errorFees}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {feesData?.currency} {feesData?.outstandingBalance?.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Due by: {feesData?.dueDate ? new Date(feesData.dueDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        )}
      </div>

      {/* Financial Status Visualization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Verification Analysis</h3>
          {financialReport?.anomaliesFound > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">
              <AlertTriangle className="w-3 h-3" /> {financialReport.anomaliesFound} Anomalies
            </span>
          )}
        </div>

        <div className="h-48 w-full">
          {isLoadingReport ? (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
          ) : historicalData.length > 0 ? (
            <Line 
              data={{
                labels: historicalData.map((d: any) => d.month),
                datasets: [
                  {
                    label: 'Actual Spending',
                    data: historicalData.map((d: any) => d.amount),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: historicalData.map((d: any) => d.anomaly ? '#ef4444' : '#2563eb'),
                    pointRadius: historicalData.map((d: any) => d.anomaly ? 6 : 4),
                  },
                  {
                    label: 'Expected',
                    data: historicalData.map((d: any) => d.expected),
                    borderColor: '#94a3b8',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0,
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const data = historicalData[context.dataIndex];
                        if (data?.anomaly) return `Alert: ${context.formattedValue} (Deviation found)`;
                        return `Amount: ${context.formattedValue}`;
                      }
                    }
                  }
                },
                scales: {
                  y: { display: false },
                  x: { grid: { display: false } }
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 font-medium">Trust Score</p>
            <p className="text-xl font-bold text-blue-600">{financialReport?.trustScore || 0}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium text-right">Verification Status</p>
            <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Your Applications</h3>
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">2024 Bursary</p>
              <p className="text-xs text-slate-500">ID: BL-992348</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
            Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="text-green-600" />
          </div>
          <p className="text-sm font-medium text-slate-600">Need Score</p>
          <p className="text-2xl font-bold">85/100</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="text-purple-600" />
          </div>
          <p className="text-sm font-medium text-slate-600">Verified</p>
          <p className="text-2xl font-bold">Yes</p>
        </div>
      </div>
    </motion.div>
  );
};

const ApplyView = ({ step, bursaryTitle, onChoose, onNext, onBack, onSubmit }: any) => {
  // A student must choose a bursary in Discover before applying.
  if (!bursaryTitle) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 space-y-4"
      >
        <FilePlus className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold">Choose a bursary first</h2>
        <p className="text-slate-500 text-sm">
          Find an opportunity in Discover, then press Apply.
        </p>
        <button
          onClick={onChoose}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
        >
          Go to Discover
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-blue-600">Step {step} of 3</span>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
        Applying to: <b>{bursaryTitle}</b>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">School Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">School Name</label>
              <input className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Enter school name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Grade/Level</label>
              <select className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 appearance-none">
                <option>Form 1</option>
                <option>Form 2</option>
                <option>Form 3</option>
                <option>Form 4</option>
                <option>University/College</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Student ID/Registration Number</label>
              <input className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="e.g. SCH-2024-001" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Background & Need</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
              Please answer truthfully. This helps our AI calculate your need score accurately.
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Household Monthly Income</label>
              <select className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                <option>Below KSh 10,000</option>
                <option>KSh 10,000 - 30,000</option>
                <option>KSh 30,000 - 50,000</option>
                <option>Above KSh 50,000</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <span className="font-medium">Orphan Status?</span>
              <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <span className="font-medium">Living with Disability?</span>
              <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Document Upload</h2>
          <div className="space-y-4">
            <p className="text-slate-500 text-sm">Please upload clear photos or PDF versions of the following:</p>
            {[
              "National ID / Birth Certificate",
              "Admission Letter",
              "Current Fee Structure"
            ].map((doc, i) => (
              <div key={i} className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="font-bold text-sm text-center">{doc}</p>
                <p className="text-xs text-slate-400">Max size 5MB (PDF, JPG, PNG)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        {step < 3 ? (
          <button 
            onClick={onNext}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all"
          >
            Continue
          </button>
        ) : (
          <button 
            onClick={onSubmit}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all"
          >
            Submit Application
          </button>
        )}
      </div>
    </motion.div>
  );
};

const NotificationsView = ({ notifications, onDismiss, onMarkAllRead }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Notifications</h2>
      <button onClick={onMarkAllRead} className="text-sm font-bold text-blue-600">Mark all as read</button>
    </div>

    <div className="space-y-3">
      {(notifications || []).length > 0 ? (
        notifications.map((n: any) => (
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            key={n.id} 
            className={`p-4 rounded-xl border relative overflow-hidden group transition-colors ${n.status === 'unread' ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className={`font-bold ${n.status === 'unread' ? 'text-blue-900' : 'text-slate-900'}`}>{n.title}</p>
                <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">{n.timestamp}</p>
              </div>
              <button 
                onClick={() => onDismiss(n.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {n.status === 'unread' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
            )}
          </motion.div>
        ))
      ) : (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">All caught up!</p>
        </div>
      )}
    </div>
  </motion.div>
);

const ProfileView = ({ onLogout, location }: { onLogout: () => void; location: StudentLocation }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold">Your Profile</h2>
    
    <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-20 h-20 rounded-full border-4 border-slate-50 relative">
          <img src={mockUsers[0].avatar} className="w-full h-full rounded-full" />
          <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white">
            <FilePlus className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-bold">John Doe</h3>
          <p className="text-slate-500 text-sm">BursaLink ID: BL-1002</p>
        </div>
      </div>

      <div className="space-y-4">
        <ProfileInfo label="Phone" value="+254 712 345 678" />
        <ProfileInfo label="ID Number" value="38472910" />
        <ProfileInfo label="County" value={location.county} />
        <ProfileInfo label="Constituency" value={location.constituency} />
        <ProfileInfo label="Ward" value={location.ward} />
        <ProfileInfo label="School" value="Nairobi National School" />
      </div>

      <div className="p-4 bg-amber-50 rounded-xl text-amber-900 text-sm">
        To change your county, constituency or ward, visit your ward or constituency
        office. An administrator must approve the change.
      </div>
    </div>

    <div className="space-y-3">
      <button className="w-full p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-medium">
        <span className="flex items-center gap-3"><Settings className="w-5 h-5 text-slate-400" /> Settings</span>
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </button>
      <button 
        onClick={onLogout}
        className="w-full p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-between font-bold"
      >
        <span className="flex items-center gap-3"><LogOut className="w-5 h-5" /> Logout</span>
      </button>
    </div>
  </motion.div>
);

const ProfileInfo = ({ label, value }: any) => (
  <div className="flex flex-col">
    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);