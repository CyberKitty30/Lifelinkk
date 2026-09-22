import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { loginUser, DEMO_USERS } from '../services/api';
import {
  HeartPulse,
  ShieldCheck,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  Database,
  Building2,
  Users,
  Stethoscope,
  Crown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');

  const handleQuickLogin = async (demoUser: AuthUser) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const defaultPassword = demoUser.role === 'admin' ? 'admin123' : demoUser.role === 'staff' ? 'staff123' : demoUser.role === 'hospital' ? 'hosp123' : 'donor123';
      const user = await loginUser(demoUser.email, defaultPassword, demoUser.role);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(email, password, selectedRole);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 'staff':
        return <Stethoscope className="w-6 h-6 text-blue-400" />;
      case 'hospital':
        return <Building2 className="w-6 h-6 text-emerald-400" />;
      case 'donor':
        return <Users className="w-6 h-6 text-red-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Banner */}
        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/80 border-r border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/40">
                <HeartPulse className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">LifeLink</h1>
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider">DBMS Management System</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200">Role-Based Access Control</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Authenticates users as System Admins, Phlebotomists, Hospital Staff, or Donors.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                <Database className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200">3NF Relational Database</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PostgreSQL database schema with foreign key constraints & SQL analytical queries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Course DBMS Project</span>
            <span className="font-mono text-slate-400">v2.0 • Secure Auth</span>
          </div>
        </div>

        {/* Right Side: Login Options */}
        <div className="lg:col-span-7 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a demo role or sign in with account credentials.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'quick' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Quick Demo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'form' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Login
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'quick' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>One-Click Demo Account Selector</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => handleQuickLogin(demo)}
                    disabled={loading}
                    className="group text-left p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-red-950/20"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 group-hover:bg-slate-800 border border-slate-800">
                        {getRoleIcon(demo.role)}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 group-hover:border-red-500/50 group-hover:text-red-400">
                        {demo.role}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                        {demo.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{demo.email}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] font-semibold text-slate-500 group-hover:text-slate-300">
                      <span>{demo.badgeTitle}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address / Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@lifelink.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Role Permission Scope</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-red-500"
                >
                  <option value="admin">System Administrator (Full Control)</option>
                  <option value="staff">Staff / Phlebotomist (Donations & Inventory)</option>
                  <option value="hospital">Hospital Representative (Requests & Issues)</option>
                  <option value="donor">Blood Donor (Personal History & Profile)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to LifeLink System'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1 mt-4">
                <span className="font-bold text-slate-300 block">Default Credentials for Evaluation:</span>
                <p>• Admin: <code className="text-amber-400 font-mono">admin@lifelink.org</code> / <code className="text-amber-400 font-mono">admin123</code></p>
                <p>• Staff: <code className="text-blue-400 font-mono">staff@lifelink.org</code> / <code className="text-blue-400 font-mono">staff123</code></p>
                <p>• Hospital: <code className="text-emerald-400 font-mono">hospital@apex.org</code> / <code className="text-emerald-400 font-mono">hosp123</code></p>
                <p>• Donor: <code className="text-red-400 font-mono">donor@lifelink.org</code> / <code className="text-red-400 font-mono">donor123</code></p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
