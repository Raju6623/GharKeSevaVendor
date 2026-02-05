import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Clock, MessageCircle, CheckCircle2, KeyRound, Map, Loader2, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

const JobCard = ({ job, onChat, onAccept, onReject, onComplete, isActionLoading }) => {

    const getTheme = () => {
        if (job.bookingStatus === 'Pending') return {
            gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
            shadow: 'shadow-amber-200',
            light: 'bg-amber-50',
            text: 'text-amber-600',
            button: 'bg-amber-500 hover:bg-amber-600',
        };
        if (job.bookingStatus === 'In Progress') return {
            gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600',
            shadow: 'shadow-indigo-200',
            light: 'bg-indigo-50',
            text: 'text-indigo-600',
            button: 'bg-indigo-600 hover:bg-indigo-700',
        };
        return {
            gradient: 'bg-gradient-to-br from-emerald-400 to-teal-600',
            shadow: 'shadow-emerald-200',
            light: 'bg-emerald-50',
            text: 'text-emerald-600',
            button: 'bg-emerald-500 hover:bg-emerald-600',
        };
    };

    const theme = getTheme();

    const handleCompleteEffect = (id) => {
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        onComplete(id);
    };

    return (
        <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className={`bg-white rounded-[2rem] overflow-hidden shadow-2xl ${theme.shadow} relative group hover:-translate-y-2 transition-all duration-500`}
        >
            {/* Top Color Block Section */}
            <div className={`${theme.gradient} p-6 relative pb-10`}>
                {/* Abstract Circles for Texture */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-sm">
                        {job.bookingStatus}
                    </span>

                    <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-2 text-center min-w-[60px] shadow-sm">
                        <span className="block text-[8px] text-white/80 font-black uppercase">Date</span>
                        <span className="block text-xl font-black text-white leading-none shadow-sm drop-shadow-md">
                            {job.bookingDate ? new Date(job.bookingDate).getDate() : '--'}
                        </span>
                        <span className="block text-[8px] text-white/90 font-bold uppercase mt-0.5">
                            {job.bookingDate ? new Date(job.bookingDate).toLocaleString('default', { month: 'short' }) : '---'}
                        </span>
                    </div>
                </div>

                <h3 className="relative z-10 mt-6 text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md pr-10">
                    {job.packageName}
                </h3>
            </div>

            {/* Bottom White Section */}
            <div className="p-6 pt-0 bg-white relative">

                {/* Floating Distance Badge */}
                {job.distance && (
                    <div className="absolute -top-5 right-6 bg-white p-2 rounded-2xl shadow-lg shadow-slate-200/50 flex items-center gap-2 border border-slate-50 z-20">
                        <div className={`p-1.5 rounded-full ${theme.light}`}>
                            <MapPin size={14} className={theme.text} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 mr-2">{job.distance === "N/A" ? "Hidden" : `${job.distance} away`}</span>
                    </div>
                )}

                <div className="mt-6 space-y-5">
                    {/* Customer Row */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                            <User size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</p>
                            <p className="text-sm font-bold text-slate-800">{job.customerName || "Customer"}</p>
                        </div>
                    </div>

                    {/* Address Row */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm mt-0.5">
                            <MapPin size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Location</p>
                            <p className="text-sm font-medium text-slate-600 leading-snug line-clamp-2">{job.customerLocation || job.serviceAddress || "No address provided"}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <Phone size={12} className={theme.text} />
                                <span className="text-[9px] font-black text-slate-400 uppercase">Phone</span>
                            </div>
                            <a href={`tel:${job.customerPhone}`} className="text-xs font-bold text-slate-700 truncate">{job.customerPhone || "N/A"}</a>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={12} className={theme.text} />
                                <span className="text-[9px] font-black text-slate-400 uppercase">Time</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate">{job.bookingStartTime || '--:--'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex items-center gap-3">
                    {job.bookingStatus === 'In Progress' && (
                        <button
                            onClick={() => onChat(job)}
                            className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors relative shadow-sm border border-slate-100"
                        >
                            <MessageCircle size={20} />
                            {(job.unreadCount || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </button>
                    )}

                    {job.bookingStatus === 'Pending' ? (
                        <button
                            onClick={() => onAccept(job.customBookingId)}
                            disabled={isActionLoading === job.customBookingId}
                            className={`flex-1 py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${theme.button}`}
                        >
                            {isActionLoading === job.customBookingId ? <Loader2 className="animate-spin" size={18} /> : <>Accept Job <CheckCircle2 size={18} /></>}
                        </button>
                    ) : job.bookingStatus === 'In Progress' ? (
                        <div className="flex-1 flex gap-2">
                            <button
                                onClick={() => handleCompleteEffect(job.customBookingId)}
                                disabled={isActionLoading === job.customBookingId}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/30 hover:bg-emerald-600 hover:shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isActionLoading === job.customBookingId ? <Loader2 className="animate-spin" size={18} /> : <>Finish <KeyRound size={18} /></>}
                            </button>
                            <button
                                onClick={() => onReject(job.customBookingId)}
                                disabled={isActionLoading === job.customBookingId}
                                className="flex-1 py-4 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-tighter border border-red-100 hover:bg-red-100 transition-all flex flex-col items-center justify-center leading-none"
                                title="Pass job to other vendors"
                            >
                                Pass <span className="text-[8px] mt-0.5 opacity-60 font-medium">Job</span>
                            </button>
                        </div>
                    ) : null}

                    <button
                        onClick={() => window.open(`http://maps.google.com/?q=${job.customerLocation || job.serviceAddress}`)}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-100"
                    >
                        <Map size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default JobCard;
