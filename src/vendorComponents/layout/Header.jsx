import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ activeTab, isOnDuty, setIsOnDuty, setIsSidebarOpen }) => {
    return (
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Menu size={22} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{activeTab} Overview</h2>
            </div>
            <div className="flex items-center gap-4">
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
