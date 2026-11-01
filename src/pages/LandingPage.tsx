import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../lib/types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage = ({ onSelectRole }: LandingPageProps) => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            BursaLink
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium">Features</a>
          <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-medium">How it Works</a>
          <button 
            onClick={() => onSelectRole('public')}
            className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" /> Transparency
          </button>
        </div>
        <button 
          onClick={() => onSelectRole('student')}
          className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Portal Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-blue-700 bg-blue-50 rounded-full">
            Revolutionizing Education Grants in Kenya
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Connecting Dreams to <span className="text-blue-600">Opportunities.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            A transparent, AI-driven digital bursary system designed to eliminate corruption 
            and ensure every student in Kenya gets the support they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onSelectRole('student')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              Apply for Bursary <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onSelectRole('admin')}
              className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-blue-200 transition-all flex items-center justify-center gap-2"
            >
              County Officials <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-green-100 rounded-3xl blur-2xl -z-10" />
          <img 
            src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/fe8bc939-c1f7-4843-9290-81806fb7f98c/transparency-header-47813915-1775043796549.webp" 
            alt="BursaLink Interface" 
            className="rounded-3xl shadow-2xl border border-white/50 w-full"
          />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl hidden lg:block animate-bounce-slow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bursaries Disbursed</p>
                <p className="text-2xl font-bold">KSh 45.2M</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold mb-2">47</h3>
            <p className="text-slate-400">Counties Supported</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold mb-2">120K+</h3>
            <p className="text-slate-400">Students Funded</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold mb-2">100%</h3>
            <p className="text-slate-400">Digital Audit Trail</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold mb-2">Zero</h3>
            <p className="text-slate-400">Middlemen Fees</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose BursaLink?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Our platform is built to solve the most critical challenges in public funding allocation using modern technology.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
              title: "AI Need-Based Scoring",
              desc: "Algorithms automatically rank students based on verified financial and academic data to ensure fair allocation."
            },
            {
              icon: <Users className="w-8 h-8 text-green-600" />,
              title: "Public Transparency",
              desc: "Track every shilling from disbursement to school receipt with our public dashboard and audit logs."
            },
            {
              icon: <CheckCircle2 className="w-8 h-8 text-blue-600" />,
              title: "Mobile-First Access",
              desc: "Students can apply via phone, upload documents, and track status even in areas with low connectivity."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold">BursaLink</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 BursaLink Africa. Empowering the future of education.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-blue-600">Facebook</a>
            <a href="#" className="text-slate-400 hover:text-blue-600">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};