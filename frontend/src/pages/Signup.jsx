import React, { useState } from 'react';
import { UserPlus, GraduationCap, Users, Lock, Mail, Building, Hash, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';

export default function Signup() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        studentId: studentId.trim() || undefined,
        department: department || undefined,
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 font-sans text-slate-800">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex justify-center mb-2 transition hover:opacity-95">
          <Logo size="lg" />
        </Link>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">Create a new account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border-t-4 border-indigo-700 p-6">
        <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-700" /> Sign Up
        </h2>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-700 mb-2 block">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-col items-start p-3 rounded-xl border-2 text-left cursor-pointer hover:shadow-md ${role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
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
                className={`flex flex-col items-start p-3 rounded-xl border-2 text-left cursor-pointer hover:shadow-md ${role === 'admin' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
          </div>

          {role === 'student' && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Student ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 1048293"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">Select Department...</option>
                {role === 'student' ? (
                  <>
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="TEXTILE">TEXTILE</option>
                    <option value="IPE">IPE</option>
                    <option value="ARCHITECTURE">ARCHITECTURE</option>
                    <option value="BBA">BBA</option>
                  </>
                ) : (
                  <>
                    <option value="Facilities & Maintenance">Facilities &amp; Maintenance</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Administration">Administration</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
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

          <div className="mb-4">
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${passwordError ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${passwordError ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                required
              />
            </div>
            {passwordError && <p className="text-xs text-red-500 font-bold mt-1">{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
