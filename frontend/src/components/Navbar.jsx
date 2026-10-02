import React, { useState } from 'react';
import { Bell, LogOut, FileText, CheckCircle, Globe, ChevronDown, Mail, Shield, Building } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar({ role = 'student', activeTab = 'feed', onTabChange, onReportClick }) {
  const location = useLocation();
  const isAdmin = role === 'admin';
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // User profile data (connected to role / localStorage, ready for backend integration)
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    if (isAdmin) {
      return {
        name: 'Facilities Admin',
        email: 'facilities.admin@campus.edu',
        role: 'Admin / Staff',
        department: 'Campus Facilities & Dispatch'
      };
    }
    return {
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: 'Student',
      department: 'Computer Science (CSE)'
    };
  })();

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Technician Dispatched', desc: 'Marcus Vance assigned to CSE Lab 4 AC Repair.', time: '10m ago', unread: true },
    { id: 2, title: 'Issue Resolved', desc: 'Library 2nd Floor lighting issue marked as fixed.', time: '1h ago', unread: true }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-y-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      {/* Left: Logo & Student Tabs */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 md:w-auto md:flex-nowrap">
        <Link to="/" className="flex shrink-0 items-center cursor-pointer transition hover:opacity-95">
          <Logo />
        </Link>
        
        <div className="flex w-full items-center gap-1 text-xs font-semibold text-slate-600 sm:gap-2 md:w-auto md:gap-4 md:text-sm">
          {!isAdmin && <>
            <button
              onClick={() => onTabChange && onTabChange('feed')}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer sm:px-3 ${activeTab === 'feed' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'hover:text-indigo-600'}`}
            >
              <Globe className="w-4 h-4" /> Campus Feed
            </button>
            <button
              onClick={() => onTabChange && onTabChange('my_reports')}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer sm:px-3 ${activeTab === 'my_reports' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'hover:text-indigo-600'}`}
            >
              <FileText className="w-4 h-4" /> My Reports
            </button>
          </>}

          {isAdmin && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <Link to="/admin" className={`hover:text-indigo-600 py-1 transition-colors flex items-center gap-1.5 ${location.pathname === '/admin' ? 'text-indigo-700 font-bold' : ''}`}>
                <CheckCircle className="w-4 h-4" /> Admin Control
              </Link>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Staff Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="relative ml-auto flex items-center gap-2 sm:gap-4">
        {!isAdmin && <button
          onClick={onReportClick}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md sm:gap-2 sm:px-4 sm:text-xs"
        >
          <span className="text-base leading-none">+</span> Report Issue
        </button>}
        
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-full hover:bg-slate-100"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" /> Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button onClick={() => setNotifications(n => n.map(x => ({ ...x, unread: false })))} className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer">
                    Mark read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3.5 text-xs ${n.unread ? 'bg-indigo-50/40' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive User Profile Menu */}
        <div className="relative border-l border-slate-200 pl-2 sm:pl-4">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              if (isNotificationsOpen) setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1 text-left transition hover:bg-slate-100 sm:gap-2.5 sm:px-2 cursor-pointer"
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-2 ring-indigo-500/20">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden sm:block text-xs">
              <p className="font-bold text-slate-900 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] font-semibold uppercase text-indigo-600">{role}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <>
              {/* Click-away backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)} 
              />

              {/* Profile Dropdown Card */}
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header with avatar, name & email */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="truncate text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="py-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Shield className="h-3.5 w-3.5 text-indigo-500" /> Role
                    </span>
                    <span className="font-semibold text-slate-900 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[11px]">
                      {currentUser.role}
                    </span>
                  </div>

                  {currentUser.department && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Building className="h-3.5 w-3.5 text-indigo-500" /> Department
                      </span>
                      <span className="font-semibold text-slate-900 text-[11px] truncate max-w-[140px]" title={currentUser.department}>
                        {currentUser.department}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign Out Option */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to="/login"
                    onClick={() => {
                      setIsProfileOpen(false);
                      try {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                      } catch (e) {}
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
