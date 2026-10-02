import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  FileText, CheckCircle, ThumbsUp, Building, Search, MapPin, 
  Clock, ArrowRight, Settings, AlertTriangle, ShieldCheck, ChevronRight, 
  Filter, Plus, X, MessageSquare, Send, Tag, Flame, ArrowUpDown,
  ImagePlus, Pencil, Trash2
} from 'lucide-react';

const INITIAL_ISSUES = [
  {
    id: 'WO-8912',
    createdBy: 'Alex Rivera',
    title: 'Broken AC fan letting high heat into CSE Lab 4',
    category: 'Electrical',
    location: 'Main Academic Building — 4th Floor CSE Lab 4',
    description: 'The AC unit in Lab 4 has a broken fan motor. Room temperature is exceeding 32°C during lab hours.',
    status: 'In Progress',
    history: [
      { status: 'Open', time: '2 days ago', note: 'Report submitted by Alex Rivera.' },
      { status: 'In Progress', time: 'Today', note: 'Facilities assigned a technician.' }
    ],
    submitted: '2 days ago',
    upvotes: 18,
    hasUpvoted: false,
    tech: 'Marcus Vance (Facilities Lead)',
    note: 'Replacement motor ordered. Technician scheduled today at 2:00 PM.',
    comments: [
      { id: 1, user: 'Dr. Rahman (Dept Head)', text: 'Please prioritize this before the lab exam.', time: '1 day ago' },
      { id: 2, user: 'Alex Rivera', text: 'Thank you for scheduling the repair!', time: '5 hours ago' }
    ]
  },
  {
    id: 'TKT-4902',
    createdBy: 'Tariq Hasan',
    title: 'Water fountain pressure too low & dirty nozzle filter',
    category: 'Water',
    location: 'Student Cafeteria Ground Floor Corridor',
    description: 'Water stream barely clears the basin edge, forcing mouth contact. Filter replacement is overdue.',
    status: 'Open',
    history: [{ status: 'Open', time: 'Today at 8:30 AM', note: 'Report submitted by Tariq Hasan.' }],
    submitted: 'Today at 8:30 AM',
    upvotes: 28,
    hasUpvoted: false,
    tech: null,
    note: null,
    comments: [
      { id: 1, user: 'Tariq Hasan (EEE)', text: 'Agreed, this has been an issue since Monday.', time: '2 hours ago' }
    ]
  },
  {
    id: 'WO-8890',
    createdBy: 'Jordan Lee',
    title: 'Flickering fluorescent tubes causing eye strain in Library',
    category: 'Electrical',
    location: 'Central Library — 2nd Floor Quiet Study Zone',
    description: 'Ballast humming loudly and constant strobing makes reading thesis binders impossible.',
    status: 'In Progress',
    history: [
      { status: 'Open', time: '4 days ago', note: 'Report submitted by Jordan Lee.' },
      { status: 'In Progress', time: 'Yesterday', note: 'Assigned to the electrical maintenance team.' }
    ],
    submitted: '4 days ago',
    upvotes: 6,
    hasUpvoted: false,
    tech: 'Jordan K. (Electrician)',
    note: 'LED retrofit fixture replacement set for Friday morning.',
    comments: []
  },
  {
    id: 'WO-8870',
    createdBy: 'Alex Rivera',
    title: 'Overfilled outdoor recycling bin attracting pests',
    category: 'Cleanliness',
    location: 'Academic Plaza Courtyard (Near Main Gate)',
    description: 'Recycling bin overflowing onto walk path. Requires immediate emptying.',
    status: 'Resolved',
    history: [
      { status: 'Open', time: 'Oct 1', note: 'Report submitted by Alex Rivera.' },
      { status: 'In Progress', time: 'Oct 1', note: 'Cleaning crew assigned.' },
      { status: 'Resolved', time: 'Oct 1', note: 'Area cleaned and sanitized.' }
    ],
    submitted: 'Resolved Oct 1',
    upvotes: 4,
    hasUpvoted: false,
    tech: 'Cleaning Crew #3',
    note: 'Bin emptied and area sanitized.',
    comments: [
      { id: 1, user: 'Alex Rivera', text: 'Quick response, thank you!', time: 'Oct 1' }
    ]
  }
];

export default function StudentDashboard() {
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Open', 'In Progress', 'Resolved', 'My Upvotes'
  const [sortBy, setSortBy] = useState('upvotes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [activeTab, setActiveTab] = useState('feed');
  
  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeIssueModal, setActiveIssueModal] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [reportPhoto, setReportPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');

  // New Issue Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electrical');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const resetReportForm = () => {
    setNewTitle('');
    setNewCategory('Electrical');
    setNewLocation('');
    setNewDescription('');
    setReportPhoto('');
    setPhotoError('');
    setEditingIssueId(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 5 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setReportPhoto(reader.result);
    reader.onerror = () => setPhotoError('This image could not be loaded. Please try another file.');
    reader.readAsDataURL(file);
  };

  const handleEditIssue = (issue) => {
    setEditingIssueId(issue.id);
    setNewTitle(issue.title);
    setNewCategory(issue.category);
    setNewLocation(issue.location);
    setNewDescription(issue.description);
    setReportPhoto(issue.photo || '');
    setPhotoError('');
    setActiveIssueModal(null);
    setIsReportModalOpen(true);
  };

  const handleDeleteIssue = (issue) => {
    if (!window.confirm(`Delete "${issue.title}"? This cannot be undone.`)) return;
    setIssues(current => current.filter(item => item.id !== issue.id));
    setActiveIssueModal(null);
  };

  // Upvote Handler
  const handleUpvote = (id, e) => {
    e.stopPropagation();
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        return {
          ...issue,
          upvotes: issue.hasUpvoted ? issue.upvotes - 1 : issue.upvotes + 1,
          hasUpvoted: !issue.hasUpvoted
        };
      }
      return issue;
    }));
  };

  // Submit New Issue
  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim() || !newDescription.trim()) return;

    if (editingIssueId) {
      const updatedIssue = {
        ...issues.find(issue => issue.id === editingIssueId),
        title: newTitle.trim(),
        category: newCategory,
        location: newLocation.trim(),
        description: newDescription.trim(),
        photo: reportPhoto
      };
      setIssues(current => current.map(issue => issue.id === editingIssueId ? updatedIssue : issue));
      setActiveIssueModal(updatedIssue);
      setIsReportModalOpen(false);
      resetReportForm();
      return;
    }

    const created = {
      id: `WO-${Date.now()}`,
      createdBy: 'Alex Rivera',
      title: newTitle.trim(),
      category: newCategory,
      location: newLocation.trim(),
      description: newDescription.trim(),
      photo: reportPhoto,
      status: 'Open',
      history: [{ status: 'Open', time: 'Just now', note: 'Report submitted by Alex Rivera.' }],
      submitted: 'Just now',
      upvotes: 1,
      hasUpvoted: true,
      tech: null,
      note: null,
      comments: []
    };

    setIssues([created, ...issues]);
    setIsReportModalOpen(false);
    resetReportForm();
  };

  // Add Comment Handler
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeIssueModal) return;

    const commentObj = {
      id: Date.now(),
      user: 'Alex Rivera (Student)',
      text: newCommentText,
      time: 'Just now'
    };

    const updatedIssues = issues.map(iss => {
      if (iss.id === activeIssueModal.id) {
        return { ...iss, comments: [...iss.comments, commentObj] };
      }
      return iss;
    });

    setIssues(updatedIssues);
    setActiveIssueModal(prev => ({ ...prev, comments: [...prev.comments, commentObj] }));
    setNewCommentText('');
  };

  // Filter & Sorting Logic
  let processedIssues = issues.filter(issue => {
    const matchesFilter = activeTab === 'my_reports'
      ? activeFilter === 'All' || issue.status === activeFilter
      : activeFilter === 'All' ? true :
        activeFilter === 'Open' ? issue.status === 'Open' :
        activeFilter === 'In Progress' ? issue.status === 'In Progress' :
        activeFilter === 'Resolved' ? issue.status === 'Resolved' :
        activeFilter === 'My Upvotes' ? issue.hasUpvoted :
        activeFilter === 'Active' ? issue.status !== 'Resolved' : true;

    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeTab === 'my_reports' || selectedCategory === 'All' || issue.category === selectedCategory;
    const matchesLocation = activeTab === 'my_reports' || selectedLocation === 'All' || issue.location === selectedLocation;
    const matchesTab = activeTab !== 'my_reports' || issue.createdBy === 'Alex Rivera';

    return matchesFilter && matchesSearch && matchesCategory && matchesLocation && matchesTab;
  });

  if (sortBy === 'upvotes') {
    processedIssues.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    processedIssues.sort((a, b) => b.id.localeCompare(a.id));
  }

  const priorityIssue = issues.reduce((topIssue, issue) => issue.upvotes > (topIssue?.upvotes ?? -1) ? issue : topIssue, null);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-12">
      {/* Connected Top Navbar to Report Modal */}
      <Navbar
        role="student"
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveFilter('All');
        }}
        onReportClick={() => setIsReportModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'my_reports' ? (
          <section key="my-reports" className="dashboard-page-enter">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 p-7 text-white shadow-xl shadow-indigo-950/10 sm:p-10">
              <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 ring-1 ring-white/15"><FileText className="h-3.5 w-3.5" /> Personal workspace</div>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My reports</h1>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100/90">Follow every issue you have reported and see what the campus team is doing to resolve it.</p>
                </div>
                <button onClick={() => setIsReportModalOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-800"><Plus className="h-4 w-4" /> Report an issue</button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Total reports', filter: 'All', value: issues.filter(issue => issue.createdBy === 'Alex Rivera').length, icon: FileText, color: 'text-blue-600', border: 'border-blue-500', ring: 'ring-blue-500/20', hoverBorder: 'hover:border-blue-300' },
                { label: 'In progress', filter: 'In Progress', value: issues.filter(issue => issue.createdBy === 'Alex Rivera' && issue.status === 'In Progress').length, icon: Clock, color: 'text-blue-600', border: 'border-blue-500', ring: 'ring-blue-500/20', hoverBorder: 'hover:border-blue-300' },
                { label: 'Resolved', filter: 'Resolved', value: issues.filter(issue => issue.createdBy === 'Alex Rivera' && issue.status === 'Resolved').length, icon: CheckCircle, color: 'text-emerald-600', border: 'border-emerald-500', ring: 'ring-emerald-500/20', hoverBorder: 'hover:border-emerald-300' }
              ].map(stat => (
                <div
                  key={stat.label}
                  onClick={() => setActiveFilter(stat.filter === 'All' || activeFilter === stat.filter ? 'All' : stat.filter)}
                  className={`group cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 ${
                    stat.filter !== 'All' && activeFilter === stat.filter
                      ? `${stat.border} ring-2 ${stat.ring} shadow-md`
                      : `border-slate-200/80 ${stat.hoverBorder} hover:shadow-md`
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                    <stat.icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="text-xl font-bold tracking-tight text-slate-900">Your submissions</h2><p className="mt-1 text-sm text-slate-500">A clear view of the reports connected to your account.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your reports" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64" /></div>
                <select value={['Active', 'My Upvotes'].includes(activeFilter) ? 'All' : activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" aria-label="Filter my reports by status">{['All', 'Open', 'In Progress', 'Resolved'].map(status => <option key={status}>{status}</option>)}</select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {processedIssues.length ? processedIssues.map(issue => <button key={issue.id} onClick={() => setActiveIssueModal(issue)} className="group w-full rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5 focus:outline-none focus:ring-4 focus:ring-indigo-100"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-semibold text-slate-400">#{issue.id}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : issue.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{issue.status}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{issue.category}</span></div><h3 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-700">{issue.title}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{issue.location}</p></div><div className="flex shrink-0 items-center justify-between gap-6 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:border-0 sm:pt-0"><span>{issue.submitted}</span><span className="inline-flex items-center gap-1 font-semibold text-indigo-600">View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></div></div></button>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><FileText className="h-5 w-5" /></span><h3 className="mt-4 font-bold text-slate-900">No reports found</h3><p className="mt-1 text-sm text-slate-500">Try another search or submit your first campus issue.</p><button onClick={() => setIsReportModalOpen(true)} className="mt-5 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-800">Create a report</button></div>}
            </div>
          </section>
        ) : (
        <div key="campus-feed" className="dashboard-page-enter">
        
        {/* Minimal Header */}
        <div className="relative mb-8 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white shadow-xl shadow-indigo-950/10 sm:flex-row sm:items-center sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"></span>
              Department of Computer Science & Engineering (CSE)
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Good to see you, Alex</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100/90">Help make campus better. Report a problem, support an existing issue, and follow progress as your community gets things fixed.</p>
          </div>
          
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="relative flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-900"
          >
            <Plus className="w-4 h-4" /> Report New Issue
          </button>
        </div>

        {/* 
            FULLY INTERACTIVE STAT CARDS:
            Clicking any stat card dynamically filters the list below!
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Active Reports Card -> Filter Active */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'Active' ? 'All' : 'Active')}
            className={`bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer ${
              activeFilter === 'Active' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200/80 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Reports</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-900">{issues.filter(i => i.status !== 'Resolved').length}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {activeFilter === 'Active' ? 'Selected' : 'Pending'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Click to filter active issues</span>
          </div>
          
          {/* Resolved Card -> Filter Resolved */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'Resolved' ? 'All' : 'Resolved')}
            className={`bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer ${
              activeFilter === 'Resolved' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-200/80 hover:border-emerald-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Issues</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-900">{issues.filter(i => i.status === 'Resolved').length}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {activeFilter === 'Resolved' ? 'Selected' : 'Completed'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Click to view fixed issues</span>
          </div>

          {/* My Upvotes Card -> Filter My Upvotes */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'My Upvotes' ? 'All' : 'My Upvotes')}
            className={`bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer ${
              activeFilter === 'My Upvotes' ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' : 'border-slate-200/80 hover:border-purple-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Upvotes</span>
              <ThumbsUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-extrabold text-slate-900">{issues.filter(i => i.hasUpvoted).length}</span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                {activeFilter === 'My Upvotes' ? 'Selected' : 'Voted'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Click to filter my votes</span>
          </div>

          {/* Campus Building Status */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Status</span>
              <Building className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-base font-extrabold text-slate-900">Academic Bldg 1</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Power & Water Operational
            </span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Issues List */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* List Controls: Search + Filters + Sort */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3">
              
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, location, ID..." 
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                />
              </div>

              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto flex-wrap">
                {['All', 'Open', 'In Progress', 'Resolved', 'My Upvotes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      activeFilter === tab 
                        ? 'bg-white text-indigo-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-indigo-700 cursor-pointer focus:outline-none"
                >
                  <option value="upvotes">Sort: Most Upvoted</option>
                  <option value="latest">Sort: Latest</option>
                </select>
              </div>

            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3">
              <label className="flex-1 text-[11px] font-bold text-slate-500">
                Category
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {['All', 'Electrical', 'Water', 'Cleanliness', 'Furniture', 'Internet', 'Other'].map(category => (
                    <option key={category} value={category}>{category === 'All' ? 'All categories' : category}</option>
                  ))}
                </select>
              </label>
              <label className="flex-1 text-[11px] font-bold text-slate-500">
                Location
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="mt-1 block w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="All">All locations</option>
                  {[...new Set(issues.map(issue => issue.location))].map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Issue Cards */}
            <div className="space-y-4">
              {processedIssues.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-600">No issues matching criteria</p>
                  <button onClick={() => setActiveFilter('All')} className="text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    Clear active filter ({activeFilter})
                  </button>
                </div>
              ) : (
                processedIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    onClick={() => setActiveIssueModal(issue)}
                    className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{issue.id}</span>
                        
                        <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                          issue.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            issue.status === 'In Progress' ? 'bg-blue-600 animate-pulse' :
                            issue.status === 'Resolved' ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}></span> 
                          {issue.status}
                        </span>

                        {issue.upvotes >= 10 && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-600 fill-rose-600" /> High Urgency
                          </span>
                        )}

                        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" /> {issue.category}
                        </span>
                      </div>

                      <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {issue.submitted}
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{issue.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {issue.location}
                    </p>

                    {issue.note && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3 text-xs">
                        <p className="font-bold text-slate-800 mb-0.5">Staff Dispatch Note ({issue.tech}):</p>
                        <p className="text-slate-600 italic">"{issue.note}"</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <button 
                        onClick={(e) => handleUpvote(issue.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          issue.hasUpvoted 
                            ? 'bg-indigo-700 text-white shadow-sm' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{issue.upvotes} Upvotes</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> {issue.comments.length}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-600" /> Live Tracking</h3>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Demo timeline</span>
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-slate-500">Recent report updates. Live status history will appear here when connected to the backend.</p>
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5 pb-1">
                {issues
                  .flatMap(issue => (issue.history || []).map(event => ({ ...event, issue })))
                  .slice(-5)
                  .reverse()
                  .map((event, index) => (
                    <button key={`${event.issue.id}-${event.status}-${event.time}`} onClick={() => setActiveIssueModal(event.issue)} className="relative block w-full pl-4 text-left">
                      <span className={`absolute w-2.5 h-2.5 rounded-full -left-[6px] top-1 ring-4 ring-white ${event.status === 'Resolved' ? 'bg-emerald-500' : event.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                      <span className="text-[10px] font-bold text-slate-400">{event.time} · {event.status}</span>
                      <p className="mt-0.5 text-xs font-bold text-slate-900 transition-colors hover:text-indigo-700">{event.issue.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{event.note}</p>
                    </button>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">📖 Reporting Rules</h3>
              <p className="text-xs text-slate-500 mb-3">Guidelines for fast maintenance resolution:</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-all cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Lab Hardware Faults</p>
                      <p className="text-[10px] text-slate-500">Provide exact room & station number</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-rose-50/60 rounded-xl border border-rose-100 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-rose-600 text-white p-2 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-xs font-bold text-rose-900">Campus Emergency?</h3>
                  <p className="text-[11px] text-rose-700 leading-snug mt-0.5">For gas leaks, electrical hazards, or structural risks, contact campus security directly.</p>
                </div>
              </div>
              <div className="rounded-lg border border-rose-100 bg-white p-3 text-center">
                <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-rose-600">Facilities Hotline · Demo</span>
                <a href="tel:+8801700000000" className="font-mono text-lg font-extrabold text-slate-900 transition hover:text-rose-700">+880 1700-000000</a>
                <p className="mt-1 text-[10px] text-slate-400">Replace with the verified campus number before launch.</p>
              </div>
            </div>

          </div>
        </div>

        </div>
        )}
      </main>

      {/* ----------------- MODAL 1: REPORT NEW ISSUE ----------------- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            <div className="flex shrink-0 justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {editingIssueId ? <Pencil className="w-4 h-4 text-indigo-700" /> : <Plus className="w-4 h-4 text-indigo-700" />}
                {editingIssueId ? 'Edit Campus Issue' : 'Report Campus Maintenance Issue'}
              </h2>
              <button onClick={() => { setIsReportModalOpen(false); resetReportForm(); }} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Close report form">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Broken fan in CSE Lab 3" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer">
                    <option value="Electrical">Electrical</option>
                    <option value="Water">Water</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Internet">Internet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Academic Bldg 2, Room 401" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea rows="3" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Describe the fault..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600" required></textarea>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Photo <span className="font-medium text-slate-400">(optional, up to 5 MB)</span></label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/50">
                  <ImagePlus className="h-4 w-4 text-indigo-600" />
                  <span>{reportPhoto ? 'Choose a different photo' : 'Attach a photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                </label>
                {photoError && <p className="mt-1 text-xs font-semibold text-rose-600" role="alert">{photoError}</p>}
                {reportPhoto && (
                  <div className="mt-3 flex items-start gap-3">
                    <img src={reportPhoto} alt="Selected issue preview" className="h-20 w-24 rounded-lg border border-slate-200 object-cover" />
                    <button type="button" onClick={() => setReportPhoto('')} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Remove photo</button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setIsReportModalOpen(false); resetReportForm(); }} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm transition-all cursor-pointer">{editingIssueId ? 'Save Changes' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 2: ISSUE DETAILS & COMMENTS ----------------- */}
      {activeIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#{activeIssueModal.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${activeIssueModal.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : activeIssueModal.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {activeIssueModal.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{activeIssueModal.title}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {activeIssueModal.location}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {activeIssueModal.createdBy === 'Alex Rivera' && (
                  <>
                    <button onClick={() => handleEditIssue(activeIssueModal)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50" aria-label="Edit your report"><Pencil className="h-3.5 w-3.5" /><span className="hidden sm:inline">Edit</span></button>
                    <button onClick={() => handleDeleteIssue(activeIssueModal)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50" aria-label="Delete your report"><Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Delete</span></button>
                  </>
                )}
                <button onClick={() => setActiveIssueModal(null)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700" aria-label="Close issue details">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {activeIssueModal.description}
                </p>
              </div>

              {activeIssueModal.photo && (
                <div>
                  <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Attached photo</h4>
                  <img src={activeIssueModal.photo} alt={`Photo attached to ${activeIssueModal.title}`} className="max-h-72 w-full rounded-xl border border-slate-200 object-cover" />
                </div>
              )}

              {activeIssueModal.note && (
                <div>
                  <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Staff Dispatch Note</h4>
                  <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-950">
                    <p className="font-bold mb-0.5">Lead: {activeIssueModal.tech}</p>
                    <p className="italic text-slate-600">"{activeIssueModal.note}"</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Comments ({activeIssueModal.comments.length})
                </h4>

                <div className="space-y-2 mb-3">
                  {activeIssueModal.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments yet.</p>
                  ) : (
                    activeIssueModal.comments.map((c) => (
                      <div key={c.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-bold text-slate-900">{c.user}</span>
                          <span className="text-[10px] text-slate-400">{c.time}</span>
                        </div>
                        <p className="text-xs text-slate-600">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input type="text" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                  <button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer">
                    <Send className="w-3.5 h-3.5" /> Comment
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
