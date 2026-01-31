import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const NewBookingAlert = ({ alert, onAccept, onDecline }) => {
    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <Bell size={40} className="mx-auto mb-3 animate-bounce relative z-10" />
                    <h2 className="text-xl font-bold relative z-10">New Job Assignment!</h2>
                </div>
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{alert.bookingDetails.packageName}</h3>
                        <p className="text-slate-500 text-sm font-medium">{alert.bookingDetails.customerLocation || alert.bookingDetails.serviceAddress}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onDecline} className="flex-1 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 rounded-xl border border-transparent">Decline</button>
                        <button
                            onClick={() => onAccept(alert.bookingDetails.customBookingId)}
                            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                        >
                            Accept Job
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NewBookingAlert;
