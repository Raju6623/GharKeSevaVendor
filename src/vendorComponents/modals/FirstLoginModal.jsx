import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Sparkles, Info } from 'lucide-react';

const FirstLoginModal = ({ isOpen, onContinue, profile }) => {
    const [hours, setHours] = useState(8);

    if (!isOpen) return null;

    const earningsMap = {
        4: '20,000',
        6: '30,500',
        8: '40,500'
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center relative"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shadow-inner">
                        <div className="relative">
                            <IndianRupee size={32} strokeWidth={3} />
                            <Sparkles size={16} className="absolute -top-2 -right-2 animate-pulse" />
                        </div>
                    </div>
                </div>

                <h3 className="text-slate-500 font-bold text-lg mb-2">You can earn upto</h3>

                <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">₹{earningsMap[hours]}</span>
                </div>

                <div className="flex items-center justify-center gap-1 text-slate-400 mb-8 cursor-help hover:text-slate-600 transition-colors">
                    <span className="text-xs font-black uppercase tracking-widest">Per Month</span>
                    <Info size={12} />
                </div>

                <div className="w-full h-px bg-slate-100 mb-8 border-dashed border-t-2"></div>

                <p className="text-slate-600 font-bold mb-6">You work every day for <span className="text-indigo-600 underline underline-offset-4 font-black">{hours} hrs...</span></p>

                <div className="flex gap-3 justify-center mb-10">
                    {[4, 6, 8].map((h) => (
                        <button
                            key={h}
                            onClick={() => setHours(h)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${hours === h
                                    ? 'bg-black border-black text-white shadow-xl scale-110'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            {h} hrs
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onContinue(hours)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Continue
                </button>

                <p className="mt-6 text-[10px] text-slate-300 font-bold uppercase tracking-widest">Calculated based on average job frequency</p>
            </motion.div>
        </div>
    );
};

export default FirstLoginModal;
