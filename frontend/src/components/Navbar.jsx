import React, { useState } from 'react';
import { Bell, LogOut, FileText, CheckCircle, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ role = 'student', activeTab = 'feed', onTabChange, onReportClick }) {
  const location = useLocation();
  const isAdmin = role === 'admin';
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Technician Dispatched', desc: 'Marcus Vance assigned to CSE Lab 4 AC Repair.', time: '10m ago', unread: true },
    { id: 2, title: 'Issue Resolved', desc: 'Library 2nd Floor lighting issue marked as fixed.', time: '1h ago', unread: true }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-y-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      {/* Left: Logo & Student Tabs */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 md:w-auto md:flex-nowrap">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="bg-indigo-700 text-white w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-md">.</div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">FixMyCampus</span>
        </Link>
        
        <div className="flex w-full items-center gap-1 text-xs font-semibold text-slate-600 sm:gap-2 md:w-auto md:gap-4 md:text-sm">
          
          {/* Main Campus Feed Tab (Default after login) */}
          <button 
            onClick={() => onTabChange && onTabChange('feed')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer sm:px-3 ${
              activeTab === 'feed' 
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' 
                : 'hover:text-indigo-600'
            }`}
          >
            <Globe className="w-4 h-4" /> Campus Feed
          </button>

          {/* Dedicated My Reports Tab */}
          <button 
            onClick={() => onTabChange && onTabChange('my_reports')}
            className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer sm:px-3 ${
              activeTab === 'my_reports' 
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' 
                : 'hover:text-indigo-600'
            }`}
          >
            <FileText className="w-4 h-4" /> My Reports
          </button>

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
        <button 
          onClick={onReportClick}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md sm:gap-2 sm:px-4 sm:text-xs"
        >
          <span className="text-base leading-none">+</span> Report Issue
        </button>
        
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

        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:gap-3 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
            AR
          </div>
          <div className="hidden sm:block text-xs">
            <p className="font-bold text-slate-900">Alex Rivera</p>
            <p className="text-[10px] text-indigo-600 font-semibold uppercase">{role}</p>
          </div>
          <Link to="/login" title="Log Out" className="text-slate-400 hover:text-rose-600 ml-1 p-1 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </nav>
  );
}
