import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

const HistoryTab = ({ history }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, SETTLED, PENDING

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.customBookingId?.toLowerCase().includes(searchTerm.toLowerCase());

        const status = item.settlementStatus || 'PENDING';
        const matchesFilter = filterStatus === 'ALL' || status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 lg:px-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Job History</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track your earnings and settlement status</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1">
                        {['ALL', 'SETTLED', 'PENDING'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                {status === 'SETTLED' ? 'Settled' : status === 'PENDING' ? 'Pending' : 'All Jobs'}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full lg:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Job Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Settlement</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Earning</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.length > 0 ? filteredHistory.map(item => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <IndianRupee size={18} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm leading-none mb-1">{item.packageName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.customBookingId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-bold text-slate-600">{item.bookingDate}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {(item.settlementStatus || 'PENDING') === 'SETTLED' ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Settled</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                                                    <Clock size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Pending</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-slate-800 text-sm">₹{item.totalPrice}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 overflow-hidden">
                                            <Search size={24} className="text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No matching records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryTab;
