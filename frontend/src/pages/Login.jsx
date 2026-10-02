import React, { useState } from 'react';
import { LogIn, GraduationCap, Users, Lock, Mail, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Login() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    if (role === 'student') {
      navigate('/student');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 font-sans text-slate-800">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex justify-center mb-3 transition hover:opacity-95">
          <Logo size="lg" />
        </Link>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Sign in to report campus maintenance issues or manage facilities dispatch
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border-t-4 border-indigo-700 p-6">
        <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5 text-indigo-700" /> Sign In
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 mb-2 block">Login Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('student')} className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:shadow-md ${role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex justify-between w-full mb-1">
                  <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-indigo-700' : 'text-slate-400'}`} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'student' ? 'border-indigo-600' : 'border-slate-300'}`}>
                    {role === 'student' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">Student</span>
              </button>
              
              <button type="button" onClick={() => setRole('admin')} className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:shadow-md ${role === 'admin' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex justify-between w-full mb-1">
                  <Users className={`w-5 h-5 ${role === 'admin' ? 'text-indigo-700' : 'text-slate-400'}`} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'admin' ? 'border-indigo-600' : 'border-slate-300'}`}>
                    {role === 'admin' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">Admin / Staff</span>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-slate-700 block mb-1">Institutional Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="alex.rivera@campus.edu" 
                className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border ${emailError ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-text`}
                required
              />
            </div>
            {emailError && <p className="text-xs text-red-500 font-bold mt-1">{emailError}</p>}
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <a href="#" className="text-[10px] text-indigo-600 font-semibold hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input type="password" placeholder="••••••••••••" className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-text" required />
            </div>
          </div>

          <div className="flex items-center mb-6 cursor-pointer">
            <input type="checkbox" id="remember" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
            <label htmlFor="remember" className="ml-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">Remember this device</label>
          </div>

          <button type="submit" className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5">
            Sign In to Portal <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
