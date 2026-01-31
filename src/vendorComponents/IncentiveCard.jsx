import React, { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const IncentiveCard = ({ incentive }) => {
    const [timeLeft, setTimeLeft] = useState({ status: 'ACTIVE', text: '' });
    const isCompleted = incentive.status === 'COMPLETED' || incentive.status === 'CLAIMED';
    const percent = Math.min((incentive.currentCount / incentive.targetCount) * 100, 100);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const validUntil = new Date(incentive.validUntil);

            if (now < validUntil) {
                const diff = validUntil - now;
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ status: 'ACTIVE', text: `${h}h ${m}m` });
            } else {
                setTimeLeft({ status: 'EXPIRED', text: "Expired" });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(timer);
    }, [incentive.validUntil]);

    if (timeLeft.status === 'EXPIRED') return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative p-6 rounded-[2rem] border border-slate-100 bg-white overflow-hidden transition-all duration-300 ${isCompleted ? 'border-green-200 bg-green-50/30' : 'hover:shadow-xl hover:shadow-indigo-500/5'}`}
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-[100%] transition-transform group-hover:scale-110" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="pr-4">
                        <h3 className="text-xl font-[900] text-slate-800 tracking-tight mb-1">{incentive.title}</h3>
                        <p className="text-sm font-semibold text-slate-500 opacity-80">{incentive.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400/20 text-yellow-700 rounded-2xl border border-yellow-400/20 backdrop-blur-sm shadow-sm">
                        <Trophy size={16} className="fill-yellow-600/20" />
                        <span className="text-sm font-black tracking-tighter">₹{incentive.rewardAmount}</span>
                    </div>
                </div>

                {/* Progress Tracking */}
                <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-end">
                        <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-slate-800">{incentive.currentCount}</span>
                            <span className="text-xs font-bold text-slate-400">/ {incentive.targetCount} Jobs</span>
                        </div>
                    </div>
                    <div className="relative h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden border border-slate-50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`absolute h-full rounded-full ${isCompleted ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]'}`}
                        />
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="flex items-center gap-3">
                    {!isCompleted ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl border border-red-100">
                            <Clock size={14} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-tighter italic">Expires in: {timeLeft.text}</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Micro-Interaction Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
};

export default IncentiveCard;
