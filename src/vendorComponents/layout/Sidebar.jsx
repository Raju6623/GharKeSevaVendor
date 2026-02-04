import React from 'react';
import { User, LogOut, X } from 'lucide-react';
import { BASE_URL, API_URL } from '../../config';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const Sidebar = ({ profile, navItems, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, jobs = [] }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">V</div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Vendor<span className="text-indigo-600">Pro</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 mb-6">
                    <div onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 group-hover:ring-2 ring-indigo-200 transition-all">
                            {profile?.vendorPhoto ? <img src={getImageUrl(profile.vendorPhoto)} alt="Profile" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400 group-hover:text-indigo-500" />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-700">{profile?.firstName || 'Vendor'} {profile?.lastName}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {((profile?.vendorCategories?.length > 0 ? profile.vendorCategories : [profile?.vendorCategory]) || []).filter(Boolean).map((cat, i) => (
                                    <span key={`${cat}-${i}`} className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">{cat}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const pendingJobs = (item.id === 'home') ? (jobs || []).filter(j => j.bookingStatus === 'Pending').length : 0;
                        const unreadMessages = (item.id === 'home') ? (jobs || []).reduce((acc, j) => acc + (j.unreadCount || 0), 0) : 0;
                        const totalBadge = pendingJobs + unreadMessages;

                        return (
                            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <item.icon size={20} className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                                {item.label}

                                {totalBadge > 0 && item.id === 'home' && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-100 animate-pulse">
                                        {totalBadge}
                                    </span>
                                )}

                                {activeTab === item.id && totalBadge === 0 && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={async () => {
                        try {
                            const vendorData = JSON.parse(localStorage.getItem('vendorData'));
                            if (vendorData?.id) {
                                const axios = require('axios'); // Dynamic import or use existing if feasible, but here we might need to rely on window.axios or imported axios if added to top. 
                                // Better to just fetch since we are in a pure component without Redux dispatch handy for thunk, 
                                // or better yet, just use fetch.
                                await fetch(`${API_URL}/vendor/logout`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ vendorId: vendorData.id })
                                });
                            }
                        } catch (e) { console.error("Logout failed", e); }
                        finally {
                            localStorage.clear();
                            window.location.href = "/login";
                        }
                    }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <LogOut size={20} /> Sign Out
                    </button>
                    {/* Add Version Info */}
                    <p className="text-[10px] text-center text-slate-300 mt-2 font-mono">v1.2.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
