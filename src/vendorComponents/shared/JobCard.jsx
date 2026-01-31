import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Clock, MessageCircle, CheckCircle2, KeyRound, Map, Loader2 } from 'lucide-react';

const JobCard = ({ job, onChat, onAccept, onComplete, isActionLoading }) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
        >
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${job.bookingStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {job.bookingStatus}
                </span>
            </div>

            {/* Job Details */}
            <div className="mb-6 space-y-4">
                <h4 className="font-black text-xl text-slate-900 mb-2 leading-tight pr-20">{job.packageName}</h4>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><User size={16} strokeWidth={2.5} /></div>
                    <p className="text-sm font-bold text-slate-700">{job.customerName || "Customer"}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-xl"><Phone size={16} strokeWidth={2.5} /></div>
                    <a href={`tel:${job.customerPhone}`} className="text-sm font-bold text-indigo-600 hover:underline">{job.customerPhone || "N/A"}</a>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><MapPin size={16} strokeWidth={2.5} /></div>
                    <p className="text-sm font-bold text-slate-500 leading-snug pt-1">{job.customerLocation || job.serviceAddress || "No address provided"}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Clock size={16} strokeWidth={2.5} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        {job.bookingDate} • {job.bookingStartTime || job.bookingTime}
                        {job.distance && (
                            <span className="ml-2 text-indigo-600 font-bold lowercase italic">
                                ({job.distance === "N/A" ? "Location Hidden" : `${job.distance} away`})
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                {job.bookingStatus === 'In Progress' && (
                    <button
                        onClick={() => onChat(job)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors relative"
                    >
                        <MessageCircle size={20} />
                        {(job.unreadCount || 0) > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[9px] text-white items-center justify-center border border-white">
                                    {job.unreadCount}
                                </span>
                            </span>
                        )}
                    </button>
                )}

                {job.bookingStatus === 'Pending' ? (
                    <button
                        onClick={() => onAccept(job.customBookingId)}
                        disabled={isActionLoading === job.customBookingId}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isActionLoading === job.customBookingId ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Accept Job</>}
                    </button>
                ) : job.bookingStatus === 'In Progress' ? (
                    <button
                        onClick={() => onComplete(job.customBookingId)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all active:scale-95"
                    >
                        <KeyRound size={16} /> Complete Job
                    </button>
                ) : null}
                <button
                    onClick={() => window.open(`http://maps.google.com/?q=${job.customerLocation || job.serviceAddress}`)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                    <Map size={20} />
                </button>
            </div>
        </motion.div>
    );
};

export default JobCard;
