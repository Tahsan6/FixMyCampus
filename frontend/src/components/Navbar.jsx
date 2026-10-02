import React, { useState, useEffect } from 'react';
import { Bell, LogOut, FileText, CheckCircle, Globe, ChevronDown, Mail, Shield, Building, Sun, Moon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ role = 'student', activeTab = 'feed', onTabChange, onReportClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // User profile data (connected to role / localStorage)
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    if (role === 'admin') {
      return {
        name: 'Facilities Admin',
        email: 'facilities.admin@campus.edu',
        role: 'admin',
        department: 'Campus Facilities & Dispatch'
      };
    }
    return {
      name: 'Campus Student',
      email: '',
      role: 'student',
      department: ''
    };
  })();

  const isAdmin = role === 'admin' || currentUser?.role === 'admin';

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
    const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getReadNotificationIds = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem('fmc_read_notifications') || '[]'));
    } catch {
      return new Set();
    }
  };

  const saveReadNotificationIds = (idsSet) => {
    try {
      localStorage.setItem('fmc_read_notifications', JSON.stringify(Array.from(idsSet)));
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const readIds = getReadNotificationIds();

      if (isAdmin) {
        const res = await api.get('/issues?sort=newest&limit=8');
        const issueList = res.data?.issues || [];
        const notifs = issueList.map(issue => {
          let title = 'New Campus Issue';
          let desc = `"${issue.title}" at ${issue.location} needs review.`;

          if (issue.status === 'In Progress') {
            title = 'Maintenance Active';
            desc = `"${issue.title}" (${issue.location}) is currently In Progress.`;
          } else if (issue.status === 'Resolved') {
            title = 'Campus Issue Resolved';
            desc = `"${issue.title}" has been marked as resolved.`;
          }

          const notifId = `issue-${issue._id}-${issue.status}`;
          return {
            id: notifId,
            issueId: issue._id,
            title,
            desc,
            time: formatTimeAgo(issue.updatedAt || issue.createdAt),
            unread: !readIds.has(notifId),
            status: issue.status
          };
        });
        setNotifications(notifs);
      } else {
        const res = await api.get('/my/issues');
        const myIssues = res.data?.issues || [];
        const notifs = myIssues.map(issue => {
          let title = 'Report Submitted';
          let desc = `Your report "${issue.title}" has been recorded.`;

          if (issue.status === 'In Progress') {
            title = 'Technician Dispatched';
            desc = `Facilities team is actively working on "${issue.title}".`;
          } else if (issue.status === 'Resolved') {
            title = 'Issue Resolved!';
            desc = `Great news! "${issue.title}" has been resolved.`;
          }

          const notifId = `my-${issue._id}-${issue.status}`;
          return {
            id: notifId,
            issueId: issue._id,
            title,
            desc,
            time: formatTimeAgo(issue.updatedAt || issue.createdAt),
            unread: !readIds.has(notifId),
            status: issue.status
          };
        });
        setNotifications(notifs);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [role]);

  const handleMarkAllRead = (e) => {
    e?.stopPropagation();
    const readIds = getReadNotificationIds();
    notifications.forEach(n => readIds.add(n.id));
    saveReadNotificationIds(readIds);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item) => {
    const readIds = getReadNotificationIds();
    readIds.add(item.id);
    saveReadNotificationIds(readIds);
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setIsNotificationsOpen(false);

    if (!isAdmin && onTabChange) {
      onTabChange('my_reports');
    }
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('fmc_user');
    } catch (e) {}
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-y-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 transition-colors">
      {/* Left: Logo & Student Tabs */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 md:w-auto md:flex-nowrap">
        <Link to="/" className="flex shrink-0 items-center cursor-pointer transition hover:opacity-95">
          <Logo />
        </Link>
        
        <div className="flex w-full items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:gap-2 md:w-auto md:gap-4 md:text-sm">
          {!isAdmin && <>
            <button
              onClick={() => onTabChange && onTabChange('feed')}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer sm:px-3 ${activeTab === 'feed' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800/60' : 'hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              <Globe className="w-4 h-4" /> Campus Feed
            </button>
            <button
              onClick={() => onTabChange && onTabChange('my_reports')}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer sm:px-3 ${activeTab === 'my_reports' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800/60' : 'hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              <FileText className="w-4 h-4" /> My Reports
            </button>
          </>}

          {isAdmin && (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <Link to="/admin" className={`hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition-colors flex items-center gap-1.5 ${location.pathname === '/admin' ? 'text-indigo-700 dark:text-indigo-300 font-bold' : ''}`}>
                <CheckCircle className="w-4 h-4" /> Admin Control
              </Link>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Staff Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Theme, Notifications & Profile */}
      <div className="relative ml-auto flex items-center gap-2 sm:gap-3">
        {!isAdmin && <button
          onClick={onReportClick}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-3 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:gap-2 sm:px-4 sm:text-xs cursor-pointer"
        >
          <span className="text-base leading-none">+</span> Report Issue
        </button>}

        {/* Dark Mode Toggle Button - right beside Notification Bell */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-400 transition-colors cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-90" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
        
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              const nextState = !isNotificationsOpen;
              setIsNotificationsOpen(nextState);
              if (nextState) {
                setIsProfileOpen(false);
                fetchNotifications();
              }
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white dark:border-slate-900"></span>
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              {/* Click-away backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsNotificationsOpen(false)} 
              />

              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Notifications
                    {unreadCount > 0 ? (
                      <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px]">(0 new)</span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingNotifications ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Checking campus updates...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">All caught up!</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No notifications right now.</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${n.unread ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : 'bg-white dark:bg-slate-900'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block shrink-0"></span>}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">{n.time}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Interactive User Profile Menu */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              if (isNotificationsOpen) setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 sm:gap-2.5 sm:px-2 cursor-pointer"
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-xs font-bold text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20">
              {getInitials(currentUser.name)}
            </div>
            <div className="hidden sm:block text-xs">
              <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400">{(currentUser.role || role).toUpperCase()}</p>
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
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header with avatar, name & email */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
                      {currentUser.email || 'No email registered'}
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="py-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                      <Shield className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Role
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[11px] capitalize">
                      {currentUser.role || role}
                    </span>
                  </div>

                  {currentUser.department && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        <Building className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Department
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] truncate max-w-[140px]" title={currentUser.department}>
                        {currentUser.department}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign Out Option */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
