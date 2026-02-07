import React from 'react';
import { User, LogOut, X, ChevronRight } from 'lucide-react';
import { BASE_URL, API_URL } from '../../config';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const Sidebar = ({ profile, navItems, footerItems = [], activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, jobs = [] }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">V</div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">GKS <span className="text-indigo-600">Partner</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 mb-6 shrink-0">
                    <div onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 group-hover:ring-2 ring-indigo-200 transition-all">
                            {profile?.vendorPhoto ? <img src={getImageUrl(profile.vendorPhoto)} alt="Profile" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400 group-hover:text-indigo-500" />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-700">{profile?.firstName || 'GKS Partner'} {profile?.lastName}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {((profile?.vendorCategories?.length > 0 ? profile.vendorCategories : [profile?.vendorCategory]) || []).filter(Boolean).map((cat, i) => (
                                    <span key={`${cat}-${i}`} className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">{cat}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const pendingJobs = (item.id === 'home') ? (jobs || []).filter(j => j.bookingStatus === 'Pending').length : 0;
                        const unreadMessages = (item.id === 'home') ? (jobs || []).reduce((acc, j) => acc + (j.unreadCount || 0), 0) : 0;
                        const totalBadge = pendingJobs + unreadMessages;
                        const hasSub = !!item.subLabel;

                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                {item.icon && (
                                    <div className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? 'bg-white shadow-sm text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}`}>
                                        <item.icon size={hasSub ? 18 : 20} className="transition-colors" />
                                    </div>
                                )}

                                <div className="flex flex-col items-start text-left min-w-0 flex-1">
                                    <span className={`truncate ${hasSub ? 'text-xs font-bold leading-tight' : ''}`}>{item.label}</span>
                                    {item.subLabel && <span className="text-[10px] text-slate-400 font-medium leading-tight truncate">{item.subLabel}</span>}
                                </div>

                                {totalBadge > 0 && item.id === 'home' && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-100 animate-pulse">
                                        {totalBadge}
                                    </span>
                                )}

                                {hasSub && <div className="ml-auto text-slate-300 group-hover:text-slate-400"><ChevronRight size={14} /></div>}
                                {activeTab === item.id && !hasSub && totalBadge === 0 && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                            </button>
                        );
                    })}

                    {/* Footer Section in Nav */}
                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-1 bg-slate-50/50 -mx-3 px-3 pb-8">
                        {footerItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className="w-full text-left px-4 py-2 text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-50 mt-auto shrink-0">
                    <button
                        onClick={async () => {
                            try {
                                const vendorData = JSON.parse(localStorage.getItem('vendorData'));
                                if (vendorData?.id) {
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
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
                    >
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                            <LogOut size={18} />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
