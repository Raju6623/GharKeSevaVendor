import React from 'react';
import { IndianRupee, CheckCircle2, Briefcase } from 'lucide-react';
import StatCard from '../shared/StatCard';

const StatsTab = ({ profile, history, jobs }) => {
    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Performance</h3>
                <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Last 30 Days</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    icon={IndianRupee}
                    label="Wallet Balance"
                    value={`₹${profile?.walletBalance || 0}`}
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-50"
                    trend="Available"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Jobs Completed"
                    value={history.length}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    trend="Success"
                />
                <StatCard
                    icon={Briefcase}
                    label="Assigned Tasks"
                    value={jobs.length + history.length}
                    colorClass="text-violet-600"
                    bgClass="bg-violet-50"
                    trend="Total"
                />
            </div>
        </>
    );
};

export default StatsTab;
