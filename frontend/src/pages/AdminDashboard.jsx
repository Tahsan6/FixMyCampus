import React, { useMemo, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  AlertTriangle, ArrowDownUp, ArrowRight, CheckCircle, Clock, FileText,
  Filter, MapPin, MessageSquare, Search, ShieldCheck, Tag, ThumbsUp, X, Loader2
} from 'lucide-react';
import api from '../api';

const STATUS_STYLES = {
  Open: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
  'In Progress': 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800',
  Resolved: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800'
};

const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const mapIssue = (issue) => ({
  id: issue._id,
  _id: issue._id,
  title: issue.title,
  category: issue.category,
  location: issue.location,
  reporter: issue.createdBy?.name || 'Unknown',
  role: issue.createdBy?.role || 'student',
  description: issue.description,
  status: issue.status,
  upvotes: Array.isArray(issue.upvotes) ? issue.upvotes.length : 0,
  createdAt: issue.createdAt,
  comments: 0,
});

export default function AdminDashboard() {
  const currentUser = getCurrentUser();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [activeIssue, setActiveIssue] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/issues?limit=50');
      if (data && data.issues) {
        setIssues(data.issues.map(mapIssue));
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const categories = useMemo(() => [...new Set(issues.map((issue) => issue.category))].sort(), [issues]);

  const visibleIssues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return issues
      .filter((issue) => activeStatus === 'All' || issue.status === activeStatus)
      .filter((issue) => category === 'All' || issue.category === category)
      .filter((issue) => !query || [issue.id, issue.title, issue.location, issue.reporter].some((value) => value?.toLowerCase().includes(query)))
      .sort((a, b) =>
        sortBy === 'priority'
          ? b.upvotes - a.upvotes
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [issues, activeStatus, category, searchQuery, sortBy]);

  const stats = [
    { label: 'Total issues', value: issues.length, filter: 'All', icon: FileText, color: 'blue' },
    { label: 'Open', value: issues.filter((i) => i.status === 'Open').length, filter: 'Open', icon: AlertTriangle, color: 'rose' },
    { label: 'In progress', value: issues.filter((i) => i.status === 'In Progress').length, filter: 'In Progress', icon: Clock, color: 'blue' },
    { label: 'Resolved', value: issues.filter((i) => i.status === 'Resolved').length, filter: 'Resolved', icon: CheckCircle, color: 'emerald' },
  ];

  const updateStatus = async (issueId, status) => {
    setStatusUpdating(issueId);
    try {
      await api.patch(`/issues/${issueId}/status`, { status });
      setIssues((current) =>
        current.map((issue) => (issue.id === issueId ? { ...issue, status } : issue))
      );
      setActiveIssue((current) =>
        current?.id === issueId ? { ...current, status } : current
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const removeIssue = async (issue) => {
    if (!window.confirm(`Remove report "${issue.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/issues/${issue.id}`);
      setIssues((current) => current.filter((item) => item.id !== issue.id));
      setActiveIssue(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 font-sans text-slate-800">
      <Navbar role="admin" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="dashboard-page-enter">
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white shadow-xl shadow-indigo-950/10 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 tracking-wider ring-1 ring-white/15">Staff workspace</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Admin dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/90">
                  Welcome, {currentUser?.name || 'Facilities Admin'}. Review campus reports, prioritize urgent issues, and keep every status update clear.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-indigo-50 ring-1 ring-white/15 sm:self-auto">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> Admin controls
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const isActive = activeStatus === stat.filter && stat.filter !== 'All';
              const palette = {
                blue: { icon: 'text-blue-600', border: 'border-blue-500', ring: 'ring-blue-500/20', hover: 'hover:border-blue-300' },
                rose: { icon: 'text-rose-600', border: 'border-rose-500', ring: 'ring-rose-500/20', hover: 'hover:border-rose-300' },
                emerald: { icon: 'text-emerald-600', border: 'border-emerald-500', ring: 'ring-emerald-500/20', hover: 'hover:border-emerald-300' },
              }[stat.color];
              return (
                <button
                  key={stat.label}
                  onClick={() => setActiveStatus(activeStatus === stat.filter ? 'All' : stat.filter)}
                  className={`group rounded-xl border bg-white p-5 text-left shadow-sm transition-all duration-200 ${isActive ? `${palette.border} ring-2 ${palette.ring} shadow-md` : `border-slate-200/80 ${palette.hover} hover:shadow-md`}`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                    <stat.icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${palette.icon}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                  <span className="mt-1 block text-[10px] font-semibold text-slate-400">Click to filter reports</span>
                </button>
              );
            })}
          </div>

          <div className="mb-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Distribution by Category</span>
              {category !== 'All' && (
                <button onClick={() => setCategory('All')} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Reset category filter</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {['Electrical', 'Water', 'Cleanliness', 'Furniture', 'Internet', 'Other'].map((cat) => {
                const count = issues.filter((i) => i.category === cat).length;
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(isSelected ? 'All' : cat)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200/70 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40'
                    }`}
                  >
                    <Tag className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    <span>{cat}</span>
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isSelected
                        ? 'bg-indigo-200 text-indigo-950 dark:bg-indigo-900 dark:text-indigo-100'
                        : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Campus reports</h2>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">{visibleIssues.length} shown</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Higher upvote counts indicate stronger community priority.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_auto_auto]">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, reporter, issue..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="All">All categories</option>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="relative">
                  <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="priority">Sort: Most upvoted</option>
                    <option value="latest">Sort: Latest</option>
                  </select>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-14 text-center">
                <Loader2 className="mx-auto h-8 w-8 text-indigo-600 animate-spin" />
                <p className="mt-3 text-xs font-bold text-slate-600">Loading reports...</p>
              </div>
            ) : visibleIssues.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/90 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Issue</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Reporter</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleIssues.map((issue) => (
                      <tr key={issue.id} className="transition-colors hover:bg-indigo-50/30">
                        <td className="max-w-[300px] px-5 py-4">
                          <span className="font-mono text-[10px] font-bold text-indigo-600">#{issue.id.slice(-8)}</span>
                          <button onClick={() => setActiveIssue(issue)} className="mt-1 block text-left text-sm font-bold text-slate-900 transition-colors hover:text-indigo-700 truncate">{issue.title}</button>
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500"><Tag className="h-3 w-3" />{issue.category}</span>
                        </td>
                        <td className="max-w-[180px] px-4 py-4"><span className="flex items-start gap-1.5 text-xs text-slate-600"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />{issue.location}</span></td>
                        <td className="px-4 py-4"><p className="text-xs font-semibold text-slate-800">{issue.reporter}</p><p className="mt-0.5 text-[10px] text-slate-400 capitalize">{issue.role}</p></td>
                        <td className="px-4 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${issue.upvotes >= 25 ? 'bg-rose-50 text-rose-700' : issue.upvotes >= 10 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}><ThumbsUp className="h-3 w-3" />{issue.upvotes}</span></td>
                        <td className="px-4 py-4">
                          <select
                            value={issue.status}
                            onChange={(e) => updateStatus(issue.id, e.target.value)}
                            disabled={statusUpdating === issue.id}
                            aria-label={`Update status for ${issue.id}`}
                            className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset outline-none disabled:opacity-50 ${STATUS_STYLES[issue.status]}`}
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setActiveIssue(issue)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50">
                            View <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-3 text-sm font-bold text-slate-800">No matching reports</h3>
                <p className="mt-1 text-xs text-slate-500">Try a different search or filter.</p>
                <button onClick={() => { setSearchQuery(''); setCategory('All'); setActiveStatus('All'); }} className="mt-3 text-xs font-bold text-indigo-600 hover:underline">Clear filters</button>
              </div>
            )}

            <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/90 px-5 py-3 text-[11px] text-slate-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {visibleIssues.length} of {issues.length} reports</span>
              <span>Status changes save to database immediately</span>
            </div>
          </section>
        </section>
      </main>

      {activeIssue && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveIssue(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-issue-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">#{activeIssue.id.slice(-8)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${STATUS_STYLES[activeIssue.status]}`}>{activeIssue.status}</span>
                </div>
                <h2 id="admin-issue-title" className="text-lg font-bold text-slate-900">{activeIssue.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{activeIssue.location}</p>
              </div>
              <button onClick={() => setActiveIssue(null)} aria-label="Close issue details" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 p-5">
              <div><h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</h3><p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{activeIssue.description}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Reported by</p><p className="mt-1 text-sm font-semibold text-slate-800">{activeIssue.reporter}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">Category</p><p className="mt-1 text-sm font-semibold text-slate-800">{activeIssue.category}</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><ThumbsUp className="h-4 w-4" />{activeIssue.upvotes} upvotes</span>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  Update status
                  <select
                    value={activeIssue.status}
                    onChange={(e) => updateStatus(activeIssue.id, e.target.value)}
                    disabled={statusUpdating === activeIssue.id}
                    className={`rounded-full px-3 py-2 text-xs font-bold ring-1 ring-inset outline-none disabled:opacity-50 ${STATUS_STYLES[activeIssue.status]}`}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </label>
              </div>
              <button onClick={() => removeIssue(activeIssue)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50">
                <AlertTriangle className="h-3.5 w-3.5" /> Remove inappropriate report
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
