import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  PieChart,
  Globe,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { Toaster } from 'sonner';
import { StudentPortal } from './pages/StudentPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { TransparencyPortal } from './pages/TransparencyPortal';
import { LandingPage } from './pages/LandingPage';
import { UserRole } from './lib/types';

const App = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (role) {
      case 'student':
        return <StudentPortal onLogout={() => setRole(null)} />;
      case 'admin':
      case 'super_admin':
        return <AdminDashboard role={role} onLogout={() => setRole(null)} />;
      case 'public':
        return <TransparencyPortal onBack={() => setRole(null)} />;
      default:
        return <LandingPage onSelectRole={setRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      <AnimatePresence mode="wait">
        <motion.main
          key={role || 'landing'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {renderContent()}
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default App;