import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncentives } from '../../redux/thunks/vendorThunk';
import JobCard from '../shared/JobCard';
import IncentiveCard from '../IncentiveCard';

const HomeTab = ({ profile, jobs, showAllJobs, setShowAllJobs, onChat, onAccept, onComplete, isActionLoading }) => {
    const dispatch = useDispatch();
    const { incentives } = useSelector(state => state.vendor);
    const activeJobs = jobs.filter(j => j.bookingStatus !== 'Completed');

    useEffect(() => {
        if (profile?.customUserId) {
            dispatch(fetchIncentives(profile.customUserId));
        }
    }, [profile, jobs, dispatch]);

    return (
        <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Welcome, {profile?.firstName || 'Partner'}!</h2>
                <div className="flex items-center gap-2 text-slate-500">
                    <span>You have {activeJobs.length} active jobs today.</span>
                </div>
            </div>

            {/* Active Incentives Section */}
            <AnimatePresence>
                {incentives.length > 0 && (
                    <div className="mb-10 group/incentive overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Zap className="text-yellow-500 fill-yellow-500" size={20} />
                                <h3 className="font-black text-xl text-slate-800 tracking-tight">Active Offers</h3>
                            </div>
                            {incentives.length > 1 && (
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                            {incentives.map((incentive, idx) => (
                                <div key={incentive._id} className="min-w-[100%] md:min-w-[450px] snap-center">
                                    <IncentiveCard incentive={incentive} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">Active Queue</h3>
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full shadow-sm border border-indigo-100">
                        {activeJobs.length} Pending
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeJobs.slice(0, showAllJobs ? undefined : 6).map((job) => (
                        <JobCard
                            key={job._id}
                            job={job}
                            onChat={onChat}
                            onAccept={onAccept}
                            onComplete={onComplete}
                            isActionLoading={isActionLoading}
                        />
                    ))}

                    {activeJobs.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Briefcase size={32} />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active jobs</p>
                            <p className="text-slate-300 text-[10px] font-bold mt-2">Relax and wait for new assignments</p>
                        </div>
                    )}
                </div>

                {activeJobs.length > 6 && (
                    <div className="text-center pt-4">
                        <button
                            onClick={() => setShowAllJobs(!showAllJobs)}
                            className="bg-white px-8 py-3 rounded-full text-xs font-black text-indigo-600 uppercase tracking-widest shadow-lg border border-indigo-50 hover:bg-indigo-50 transition-all"
                        >
                            {showAllJobs ? 'Show Less' : 'View All Jobs'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default HomeTab;
