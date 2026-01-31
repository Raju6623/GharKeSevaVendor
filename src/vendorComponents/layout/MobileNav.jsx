import React from 'react';

const MobileNav = ({ navItems, activeTab, setActiveTab }) => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-around z-50 h-[70px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-indigo-600 -translate-y-1' : 'text-slate-400'}`}>
                    <div className={`p-1.5 rounded-full ${activeTab === item.id ? 'bg-indigo-50' : ''}`}>
                        <item.icon size={20} fill={activeTab === item.id ? "currentColor" : "none"} />
                    </div>
                    <span className="text-[10px] font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default MobileNav;
