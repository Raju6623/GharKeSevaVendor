import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Briefcase, Zap, Calendar, TrendingUp, Cake } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncentives } from '../../redux/thunks/vendorThunk';
import JobCard from '../shared/JobCard';
import IncentiveCard from '../IncentiveCard';

const HomeTab = ({ profile, jobs, showAllJobs, setShowAllJobs, onChat, onAccept, onReject, onComplete, isActionLoading }) => {
    const dispatch = useDispatch();
    const { incentives } = useSelector(state => state.vendor);
    const activeJobs = jobs.filter(j => j.bookingStatus !== 'Completed');

    useEffect(() => {
        if (profile?.customUserId) {
            dispatch(fetchIncentives(profile.customUserId));
        }
    }, [profile, jobs, dispatch]);

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Birthday Logic
    const isBirthdayToday = () => {
        if (!profile?.dob) return false;
        const bday = new Date(profile.dob);
        const today = new Date();
        return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Birthday Wish Banner */}
            {isBirthdayToday() && (
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 p-8 text-white shadow-2xl border-4 border-white">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Cake size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl shadow-lg border border-white/30 animate-bounce">
                            🎂
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight italic uppercase">Happy Birthday, {profile?.firstName}! 🎊</h2>
                            <p className="text-rose-50 font-bold mt-1 text-sm md:text-base">GharKeSeva parivaar ki aur se aapko janamdin ki dheron shubhkamnayein. Aapka din shubh ho!</p>
                        </div>
                    </div>
                    {/* Floating Particles/Shapes could be added here with motion */}
                </div>
            )}

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#2d308b] to-[#4338ca] text-white shadow-2xl shadow-indigo-900/20">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-200 mb-2 text-xs font-bold uppercase tracking-widest">
                            <Calendar size={14} />
                            <span>{currentDate}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 leading-tight">
                            Welcome, <br className="hidden md:block" />{profile?.firstName || 'Partner'}!
                        </h2>
                        <p className="text-indigo-100/80 font-medium text-sm md:text-base max-w-sm">
                            {activeJobs.length > 0
                                ? `You have ${activeJobs.length} active jobs requiring your attention.`
                                : "You're all caught up! No pending jobs at the moment."}
                        </p>
                    </div>

                    {/* Stats Pill */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 min-w-[160px]">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <div>
                            <span className="block text-3xl font-black leading-none">{activeJobs.length}</span>
                            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Active Jobs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Incentives Section */}
            <AnimatePresence>
                {incentives.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Zap className="text-amber-500 fill-amber-500" size={20} />
                            <h3 className="font-black text-lg text-slate-800 tracking-tight">Special Offers</h3>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-2">
                            {incentives.map((incentive) => (
                                <div key={incentive._id} className="min-w-[85%] md:min-w-[400px] snap-center">
                                    <IncentiveCard incentive={incentive} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Active Jobs Queue */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Job Queue
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Manage your schedule</p>
                    </div>

                    {activeJobs.length > 0 && (
                        <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg shadow-lg shadow-slate-200 uppercase tracking-widest">
                            {activeJobs.length} Pending
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeJobs.slice(0, showAllJobs ? undefined : 6).map((job) => (
                        <div key={job._id} className="transform hover:-translate-y-1 transition-transform duration-300">
                            <JobCard
                                job={job}
                                onChat={onChat}
                                onAccept={onAccept}
                                onReject={onReject}
                                onComplete={onComplete}
                                isActionLoading={isActionLoading}
                            />
                        </div>
                    ))}

                    {activeJobs.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 group hover:border-[#2d308b]/20 transition-colors">
                            <div className="w-24 h-24 bg-slate-50 group-hover:bg-[#2d308b]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:text-[#2d308b] transition-all duration-500">
                                <TrendingUp size={40} />
                            </div>
                            <h4 className="text-slate-800 font-black text-lg mb-2">Queue is Empty</h4>
                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                                New bookings will appear here instantly. Stay online to receive jobs!
                            </p>
                        </div>
                    )}
                </div>

                {activeJobs.length > 6 && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => setShowAllJobs(!showAllJobs)}
                            className="bg-white px-8 py-4 rounded-2xl text-xs font-black text-indigo-900 uppercase tracking-widest shadow-xl shadow-indigo-100 border border-indigo-50 hover:bg-slate-50 transition-all transform active:scale-95"
                        >
                            {showAllJobs ? 'Show Less Jobs' : `View All ${activeJobs.length} Jobs`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTab;
