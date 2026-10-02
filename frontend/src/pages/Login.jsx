import React, { useState } from 'react';
import { LogIn, GraduationCap, Users, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';

export default function Login() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Save token & user in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Check returned role from DB
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Invalid email or password.');
    } finally {
      setLoading(false);
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

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 mb-2 block">Login Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:shadow-md ${role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="flex justify-between w-full mb-1">
                  <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-indigo-700' : 'text-slate-400'}`} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${role === 'student' ? 'border-indigo-600' : 'border-slate-300'}`}>
                    {role === 'student' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all cursor-pointer hover:shadow-md ${role === 'admin' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
              >
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
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                placeholder="alex.rivera@campus.edu"
                className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border ${emailError ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                required
              />
            </div>
            {emailError && <p className="text-xs text-red-500 font-bold mt-1">{emailError}</p>}
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : <><span>Sign In to Portal</span> <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
