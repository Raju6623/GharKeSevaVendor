import React from 'react';

const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
        <div className={`p-3 rounded-xl ${color || 'bg-white text-slate-400'} shadow-sm`}><Icon size={18} /></div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-bold text-slate-700 leading-tight truncate">{value || "N/A"}</p>
        </div>
    </div>
);

export default InfoRow;
