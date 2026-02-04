import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, X, Calendar, MessageSquare, CheckCircle2, User, ExternalLink } from 'lucide-react';

const Header = ({ activeTab, isOnDuty, setIsOnDuty, setIsSidebarOpen, jobs = [], history = [], onSelectResult }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);
    const notificationRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (item) => {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setSearchQuery('');
        if (onSelectResult) {
            onSelectResult(item);
        }
    };

    // Search logic for Vendor
    const searchResults = searchQuery.length > 2 ? [
        ...jobs.filter(j =>
            j.customBookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(j => ({ id: j.customBookingId, title: j.serviceTitle, sub: j.customerName, type: 'Active Job', icon: <Calendar size={14} />, raw: j })),
        ...history.filter(h =>
            h.customBookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(h => ({ id: h.customBookingId, title: h.serviceTitle, sub: h.customerName, type: 'History', icon: <CheckCircle2 size={14} />, raw: h }))
    ].slice(0, 5) : [];

    // Notification logic for Vendor (New bookings or unread chats)
    const notificationItems = [
        ...jobs.filter(j => j.bookingStatus === 'Pending' || (j.unreadCount && j.unreadCount > 0)).map(j => ({
            id: j.customBookingId,
            title: j.unreadCount > 0 ? 'New Message' : 'New Job Request',
            desc: j.unreadCount > 0 ? `You have ${j.unreadCount} unread messages from ${j.customerName}` : `New request for ${j.serviceTitle}`,
            type: j.unreadCount > 0 ? 'chat' : 'booking',
            time: 'Just now',
            raw: j
        }))
    ].slice(0, 5);

    return (
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Menu size={22} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{activeTab} Overview</h2>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                {/* Search & Notifications Section */}
                <div className="flex items-center gap-2">
                    {/* Global Search */}
                    <div className="relative" ref={searchRef}>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`p-2.5 rounded-xl transition-all ${isSearchOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                            <Search size={20} />
                        </button>

                        {isSearchOpen && (
                            <div className="absolute top-14 right-0 w-[300px] md:w-[380px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="relative mb-4">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search by ID, Service, Customer..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                                        <p className="text-[10px] text-center text-slate-400 py-2">Type 3+ characters...</p>
                                    )}
                                    {searchQuery.length >= 3 && searchResults.length === 0 && (
                                        <p className="text-[10px] text-center text-slate-400 py-2">No results found</p>
                                    )}
                                    {searchResults.map((res, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleItemClick(res.raw)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {res.icon}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-slate-700">{res.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">#{res.id} • {res.sub}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${res.type === 'Active Job' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>{res.type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={`p-2.5 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                            <Bell size={20} />
                            {notificationItems.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute top-14 right-0 w-[300px] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h4 className="text-sm font-bold text-slate-800">Job Alerts</h4>
                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{notificationItems.length} New</span>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto py-2">
                                    {notificationItems.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <CheckCircle2 size={32} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-[11px] font-bold text-slate-400">All caught up!</p>
                                        </div>
                                    ) : (
                                        notificationItems.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleItemClick(item.raw)}
                                                className="w-full p-4 flex gap-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'chat' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                                    {item.type === 'chat' ? <MessageSquare size={16} /> : <Calendar size={16} />}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">#{item.id}</p>
                                                        <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider">{item.time}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Live Updates</span>
                </div>
                <button
                    onClick={() => setIsOnDuty(!isOnDuty)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all shadow-sm ${isOnDuty ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                >
                    <div className={`w-2 h-2 rounded-full bg-white`}></div>
                    {isOnDuty ? 'On Duty' : 'Offline'}
                </button>
            </div>
        </header>
    );
};

export default Header;
