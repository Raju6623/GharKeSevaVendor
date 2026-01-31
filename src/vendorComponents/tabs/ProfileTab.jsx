import React from 'react';
import { User, MapPin, Briefcase, Star, Mail, Phone, Shield } from 'lucide-react';

const ProfileTab = ({ profile, setIsReviewsModalOpen }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Modern Profile Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 z-0"></div>
                <div className="relative z-10 flex flex-col items-center md:flex-row gap-8">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden shrink-0 relative">
                        {profile?.vendorPhoto ? <img src={profile.vendorPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User size={40} className="text-slate-300" /></div>}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 border-4 border-white rounded-full"></div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{profile?.firstName} {profile?.lastName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            {(profile?.vendorCategories?.length > 0 ? profile.vendorCategories : [profile?.vendorCategory]).map(cat => (
                                <span key={cat} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100">{cat}</span>
                            ))}
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg">ID: {profile?.customUserId}</span>
                        </div>
                        <div className="flex items-center gap-6 justify-center md:justify-start text-sm font-medium text-slate-500">
                            <div className="flex items-center gap-1.5"><MapPin size={16} /> {profile?.vendorCity}</div>
                            <div
                                className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => setIsReviewsModalOpen(true)}
                            >
                                <Star size={16} className="text-amber-400 fill-amber-400" /> {profile?.rating || 0} ({profile?.reviewCount || 0} Reviews)
                            </div>
                            <div className="flex items-center gap-1.5"><Briefcase size={16} className="text-slate-400" /> {profile?.experience || 0} Years Exp.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b pb-4 flex items-center gap-2"><Mail size={16} /> Contact Info</h3>
                    <div className="space-y-5">
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Email</label><p className="font-semibold text-slate-800">{profile?.userEmail}</p></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Phone</label><p className="font-semibold text-slate-800">{profile?.userPhone}</p></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Address</label><p className="font-semibold text-slate-800">{profile?.vendorAddress}</p></div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b pb-4 flex items-center gap-2"><Shield size={16} /> Banking & KYC</h3>
                    <div className="space-y-5">
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Aadhar Number</label><p className="font-semibold text-slate-800 break-all">{profile?.aadharNumber || "N/A"}</p></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">PAN Number</label><p className="font-semibold text-slate-800 break-all uppercase">{profile?.panNumber || "N/A"}</p></div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Settlement Bank</label><p className="font-semibold text-slate-800">{profile?.bankName || "N/A"}</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Account Number</label><p className="font-semibold text-slate-800 break-all">{profile?.accountNumber || "N/A"}</p></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">IFSC Code</label><p className="font-semibold text-slate-800 break-all uppercase">{profile?.ifscCode || "N/A"}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
