import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Wallet, 
  FileCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  AlertCircle,
  TrendingUp,
  BarChart,
  Calendar,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  LayoutDashboard,
  FileText,
  School,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import { mockApplications } from '../lib/mockData';
import { Application, UserRole } from '../lib/types';

interface AdminDashboardProps {
  role: UserRole;
  onLogout: () => void;
}

interface ApprovalRequest {
  id: string;
  school: string;
  studentName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rejectionReason?: string;
}

export const AdminDashboard = ({ role, onLogout }: AdminDashboardProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'applications' | 'approvals' | 'analytics' | 'reports'>('overview');
  const [filterCounty, setFilterCounty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<string | null>(null);

  const safeApplications = Array.isArray(mockApplications) ? mockApplications : [];

  const applications = safeApplications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCounty = filterCounty === 'All' || app.county === filterCounty;
    return matchesSearch && matchesCounty;
  });

  const fetchApprovalRequests = async () => {
    try {
      const response = await fetch('/api/approvals');
      const data = await response.json();
      setApprovalRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load approval requests');
      setApprovalRequests([]);
    }
  };

  useEffect(() => {
    if (activeView === 'approvals') {
      fetchApprovalRequests();
    }
  }, [activeView]);

  const handleApprovalAction = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    setIsSubmittingApproval(requestId);
    try {
      const response = await fetch(`/api/approvals/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'reject' ? JSON.stringify({ reason }) : undefined
      });

      if (!response.ok) throw new Error('Action failed');
      
      const { approval } = await response.json();
      
      // Update local state
      setApprovalRequests(prev => (Array.isArray(prev) ? prev : []).map(req => req.id === requestId ? approval : req));
      toast.success(`Request ${action}d successfully`);
    } catch (err) {
      toast.error('Action failed. Please try again.');
    } finally {
      setIsSubmittingApproval(null);
    }
  };

  const stats = [
    { label: 'Total Applicants', value: '45,204', icon: <Users className="text-blue-600" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Funds Allocated', value: 'KSh 84M', icon: <Wallet className="text-green-600" />, trend: '+5.4%', color: 'bg-green-50' },
    { label: 'Pending Review', value: '1,248', icon: <Clock className="text-orange-600" />, trend: '-2%', color: 'bg-orange-50' },
    { label: 'Approved Today', value: '156', icon: <FileCheck className="text-purple-600" />, trend: '+8%', color: 'bg-purple-50' },
  ];

  const chartData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  const countyData = [
    { name: 'Nairobi', value: 400 },
    { name: 'Mombasa', value: 300 },
    { name: 'Nakuru', value: 300 },
    { name: 'Kisumu', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg">AdminLink</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink active={activeView === 'overview'} onClick={() => setActiveView('overview')} icon={<LayoutDashboard />} label="Dashboard Overview" />
          <SidebarLink active={activeView === 'applications'} onClick={() => setActiveView('applications')} icon={<FileText />} label="Student Apps" />
          <SidebarLink active={activeView === 'approvals'} onClick={() => setActiveView('approvals')} icon={<School />} label="School Approvals" />
          <SidebarLink active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} icon={<BarChart />} label="Funds & Analytics" />
          <SidebarLink active={activeView === 'reports'} onClick={() => setActiveView('reports')} icon={<Download />} label="Export Reports" />
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {activeView === 'approvals' ? 'School Approval Workflow' : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Academic Year 2024</span>
            </div>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(stats || []).map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${stat.trend?.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> Monthly Disbursement
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold mb-6">Distribution by County</h3>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={countyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {(countyData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {(countyData || []).map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
                          <span className="text-slate-600">{d.name}</span>
                          <span className="font-bold ml-auto">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-xl text-white">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">School Fee Disbursement Requests</h3>
                  <p className="text-blue-700">Review and approve requests from schools for bursary fund disbursement. Verified requests are processed via M-Pesa B2B.</p>
                </div>
              </div>

              <div className="grid gap-4">
                {(approvalRequests || []).map((req) => (
                  <motion.div 
                    layout
                    key={req.id}
                    className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={req.status} />
                          <span className="text-xs font-mono font-bold text-slate-400">REQ-{req.id}</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">{req.school}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> {req.studentName}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> {new Date(req.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between min-w-[200px]">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Requested Amount</p>
                          <p className="text-2xl font-black text-slate-900">KSh {req.amount?.toLocaleString()}</p>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <button 
                              disabled={!!isSubmittingApproval}
                              onClick={() => {
                                const reason = prompt('Enter rejection reason (optional):');
                                handleApprovalAction(req.id, 'reject', reason || 'Criteria not met');
                              }}
                              className="px-4 py-2 border border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button 
                              disabled={!!isSubmittingApproval}
                              onClick={() => handleApprovalAction(req.id, 'approve')}
                              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {isSubmittingApproval === req.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" /> }
                              Approve
                            </button>
                          </div>
                        )}

                        {req.status === 'rejected' && req.rejectionReason && (
                          <div className="mt-2 text-xs text-red-500 italic bg-red-50 px-2 py-1 rounded">
                            Reason: {req.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(approvalRequests || []).length === 0 && (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <School className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No pending requests for review</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      placeholder="Search name or application ID..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-blue-400 transition-colors">
                      <Filter className="w-4 h-4 mr-2 text-slate-500" />
                      <select 
                        className="bg-transparent text-sm font-medium outline-none"
                        value={filterCounty}
                        onChange={(e) => setFilterCounty(e.target.value)}
                      >
                        <option>All Counties</option>
                        <option>Nairobi</option>
                        <option>Mombasa</option>
                        <option>Nakuru</option>
                      </select>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Application ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">County</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Need Score</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(applications || []).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-blue-600">#{app.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{app.studentName}</p>
                          <p className="text-xs text-slate-400">{app.school}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{app.county}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${app.score > 80 ? 'bg-green-500' : app.score > 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${app.score}%`}} />
                            </div>
                            <span className="text-xs font-bold">{app.score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status as any} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedApp(app)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Application Detail */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold">Application Details</h3>
                <p className="text-sm text-slate-500">Review student information and documents</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Student Profile</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <DetailItem label="Full Name" value={selectedApp.studentName} />
                    <DetailItem label="School" value={selectedApp.school} />
                    <DetailItem label="County" value={selectedApp.county} />
                    <DetailItem label="Submission Date" value={new Date(selectedApp.submittedAt).toLocaleDateString()} />
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Documents</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(selectedApp.documents || []).length > 0 ? selectedApp.documents.map((doc, i) => (
                      <div key={i} className="p-4 border rounded-xl flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{doc.type}</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                      </div>
                    )) : (
                      <p className="text-slate-500 italic text-sm">No documents uploaded.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">AI Score Breakdown</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Income Level</span>
                      <span className="text-sm font-bold text-green-600">+30</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Orphan Status</span>
                      <span className="text-sm font-bold text-green-600">+25</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disability</span>
                      <span className="text-sm font-bold text-slate-300">0</span>
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                      <span className="font-bold">Total Score</span>
                      <span className="text-xl font-extrabold text-blue-600">{selectedApp.score}/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => {
                      toast.success('Application Approved!');
                      setSelectedApp(null);
                    }}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve Bursary
                  </button>
                  <button 
                    onClick={() => {
                      toast.error('Application Flagged for Review');
                      setSelectedApp(null);
                    }}
                    className="w-full bg-orange-100 text-orange-700 py-4 rounded-xl font-bold hover:bg-orange-200 transition-all flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5" /> Flag for Review
                  </button>
                  <button 
                    onClick={() => {
                      toast.error('Application Rejected');
                      setSelectedApp(null);
                    }}
                    className="w-full border-2 border-red-100 text-red-600 py-4 rounded-xl font-bold hover:bg-red-50 transition-all"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="text-sm">{label}</span>
  </button>
);

const DetailItem = ({ label, value }: any) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
    <p className="font-semibold text-slate-800">{value || 'N/A'}</p>
  </div>
);

const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' | 'flagged' }) => {
  const styles = {
    pending: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    flagged: 'bg-purple-100 text-purple-700'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};