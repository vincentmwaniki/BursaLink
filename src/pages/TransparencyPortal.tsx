import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  Users, 
  Wallet, 
  Building2,
  PieChart as PieChartIcon,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { mockApplications } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';

interface TransparencyPortalProps {
  onBack: () => void;
}

export const TransparencyPortal = ({ onBack }: TransparencyPortalProps) => {
  const stats = [
    { label: 'Total Budget Disbursed', value: 'KSh 1.2 Billion', icon: <Wallet className="text-blue-600" />, sub: 'Academic Year 2023/24' },
    { label: 'Beneficiaries', value: '124,500', icon: <Users className="text-green-600" />, sub: 'Unique Students Funded' },
    { label: 'Active Counties', value: '47', icon: <Building2 className="text-purple-600" />, sub: 'Nationwide Coverage' },
    { label: 'System Efficiency', value: '98.5%', icon: <TrendingUp className="text-orange-600" />, sub: 'Automated Processing' },
  ];

  const distributionData = [
    { name: 'Secondary Education', value: 45 },
    { name: 'TVET Colleges', value: 25 },
    { name: 'University Grants', value: 30 },
  ];

  const COLORS = ['#2563eb', '#10b981', '#8b5cf6'];

  const safeMockApplications = Array.isArray(mockApplications) ? mockApplications : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Transparency Header */}
      <div className="relative h-80 bg-slate-900 flex flex-col justify-center px-6 overflow-hidden">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/fe8bc939-c1f7-4843-9290-81806fb7f98c/transparency-header-47813915-1775043796549.webp" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-blue-500/30">
              Live Transparency Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Open Data for <span className="text-blue-400">Equal Education.</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              BursaLink provides a real-time view of how public funds are allocated across Kenya, 
              ensuring every shilling is accounted for and reaching those in need.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-12 pb-24">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(stats || []).map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
              <p className="font-bold text-slate-500 text-sm mb-2">{stat.label}</p>
              <p className="text-xs text-slate-400 italic">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Visual Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold">Funds Disbursement Trend</h3>
                <p className="text-slate-500">Allocation growth over the last 6 months</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-100 text-xs font-bold rounded-lg text-slate-600">6 Months</button>
                <button className="px-3 py-1.5 hover:bg-slate-100 text-xs font-bold rounded-lg text-slate-400">1 Year</button>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Aug', amount: 450 },
                  { name: 'Sep', amount: 620 },
                  { name: 'Oct', amount: 580 },
                  { name: 'Nov', amount: 840 },
                  { name: 'Dec', amount: 920 },
                  { name: 'Jan', amount: 1200 },
                ]}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                  />
                  <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Fund Allocation</h3>
            <p className="text-slate-500 mb-8">By institution category</p>
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(distributionData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <PieChartIcon className="w-8 h-8 text-slate-200" />
                <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Budget</span>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              {(distributionData || []).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
                  <span className="text-sm font-medium text-slate-600">{d.name}</span>
                  <span className="text-sm font-bold text-slate-900 ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Public List (Limited) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-10 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Approved Beneficiaries</h3>
              <p className="text-slate-500">Verified list of students who received funding for 2024</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  placeholder="Search student or school..." 
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>
              <button className="flex items-center gap-2 p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Institution</th>
                  <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">County</th>
                  <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Year</th>
                  <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeMockApplications.filter(a => a.status === 'approved').concat(safeMockApplications.filter(a => a.status === 'approved')).map((app, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {app.studentName?.charAt(0) || 'S'}
                        </div>
                        <span className="font-bold text-slate-800">{(app.studentName || 'Student').split(' ')[0]} ****</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 font-medium text-slate-600">{app.school}</td>
                    <td className="px-10 py-6 font-medium text-slate-600">{app.county}</td>
                    <td className="px-10 py-6 font-medium text-slate-600">2024</td>
                    <td className="px-10 py-6 text-right">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Disbursed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t bg-slate-50/30 flex justify-center">
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2">
              View Full List <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};