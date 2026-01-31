import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';

const OtpModal = ({ isOpen, otpValue, setOtpValue, onVerify, onClose, isActionLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl border border-white/20">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Shield size={28} /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Service Completion</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">Ask the customer for the 4-digit OTP code to verify and complete this job.</p>
                <input
                    type="text"
                    maxLength={4}
                    className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 mb-8 tracking-[0.5em] transition-all"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="0000"
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors">Cancel</button>
                    <button
                        onClick={onVerify}
                        disabled={isActionLoading}
                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all"
                    >
                        {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Verify OTP'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OtpModal;
