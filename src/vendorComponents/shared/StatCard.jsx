import React from 'react';

const StatCard = ({ icon: Icon, label, value, colorClass, bgClass, trend }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 ${bgClass} ${colorClass} rounded-2xl shadow-sm`}><Icon size={24} strokeWidth={2.5} /></div>
                {trend && <span className={`text-[10px] font-black ${colorClass} uppercase tracking-widest ${bgClass}/50 px-3 py-1.5 rounded-lg`}>{trend}</span>}
            </div>
            <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    </div>
);

export default StatCard;
