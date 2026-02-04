import React from 'react';
import { User, MapPin, Briefcase, Star, Mail, Phone, Shield, CheckCircle2, CreditCard, Building, Monitor, Smartphone, Globe, Landmark, Hash, Award } from 'lucide-react';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    // Assuming backend is serving static files from root
    return `http://127.0.0.1:3001/${path.replace(/^\/+/, '')}`;
};

const ProfileTab = ({ profile, setIsReviewsModalOpen }) => {
    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in zoom-in duration-500">

            {/* UNIFIED DOSSIER CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-slate-100">

                {/* LEFT SIDEBAR (Identity) */}
                <div className="w-full lg:w-[380px] bg-[#0f172a] text-white p-10 relative flex flex-col items-center text-center z-10">
                    {/* Background Noise/Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a]"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        {/* Profile Photo */}
                        <div className="relative group cursor-pointer mb-6">
                            <div className="w-44 h-44 rounded-full p-2 border border-slate-700/50 bg-slate-800/50 shadow-2xl">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0f172a] relative">
                                    {profile?.vendorPhoto ? (
                                        <img
                                            src={getImageUrl(profile.vendorPhoto)}
                                            alt="Vendor Profile"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    {/* Fallback if Image Fails or is Missing */}
                                    <div className={`w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 absolute inset-0 ${profile?.vendorPhoto ? 'hidden' : 'flex'}`}>
                                        <User size={48} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-4 bg-emerald-500 text-white p-2 rounded-full border-4 border-[#0f172a]">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <h2 className="text-3xl font-black tracking-tight mb-2 leading-tight">
                            {profile?.firstName} <br /> <span className="text-indigo-400">{profile?.lastName}</span>
                        </h2>

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700/50 mb-8">
                            <Briefcase size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{profile?.vendorCategory}</span>
                        </div>

                        {/* Stats Vertical List */}
                        <div className="w-full bg-slate-800/30 rounded-3xl p-6 border border-slate-700/30 space-y-6 backdrop-blur-sm">
                            <div onClick={() => setIsReviewsModalOpen(true)} className="flex items-center justify-between cursor-pointer group/stat">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-800 rounded-xl text-amber-500"><Star size={18} fill="currentColor" /></div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black block group-hover/stat:text-amber-400 transition-colors">{profile?.rating || '0.0'}</span>
                                    <span className="text-[10px] text-slate-500 block">{profile?.reviewCount} Reviews</span>
                                </div>
                            </div>

                            <div className="w-full h-px bg-slate-700/50"></div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-500"><CheckCircle2 size={18} /></div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</span>
                                </div>
                                <span className="text-lg font-black">{profile?.experience || '0'} Years</span>
                            </div>

                            <div className="w-full h-px bg-slate-700/50"></div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-800 rounded-xl text-blue-500"><MapPin size={18} /></div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</span>
                                </div>
                                <span className="text-sm font-bold truncate max-w-[120px]">{profile?.vendorCity || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 opacity-40 text-[10px] font-mono tracking-widest uppercase">
                        Vendor ID: {profile?.customUserId}
                    </div>
                </div>

                {/* RIGHT CONTENT (Details) */}
                <div className="flex-1 bg-slate-50/80 p-8 lg:p-12 overflow-y-auto">

                    {/* Section 1: Contact Info */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Smartphone size={20} /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                                <div className="font-bold text-slate-800 text-base md:text-lg border-b border-slate-200 pb-2 group-hover:border-indigo-300 transition-colors">{profile?.userEmail}</div>
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone Number</label>
                                <div className="font-bold text-slate-800 text-base md:text-lg border-b border-slate-200 pb-2 group-hover:border-indigo-300 transition-colors">{profile?.userPhone}</div>
                            </div>
                            <div className="col-span-1 md:col-span-2 group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Permanent Address</label>
                                <div className="font-medium text-slate-600 border-b border-slate-200 pb-2 leading-relaxed group-hover:border-indigo-300 transition-colors">{profile?.vendorAddress}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Banking & KYC */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Landmark size={20} /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Financial Records</h3>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem]"></div>

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                        <Building size={12} /> Bank Name
                                    </label>
                                    <p className="text-xl font-black text-slate-800">{profile?.bankName || "Not Provided"}</p>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                        <Hash size={12} /> Account Number
                                    </label>
                                    <p className="text-xl font-mono font-bold text-slate-700 tracking-wider">{profile?.accountNumber || "N/A"}</p>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                        <CreditCard size={12} /> IFSC Code
                                    </label>
                                    <p className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded inline-block border border-slate-100">{profile?.ifscCode || "N/A"}</p>
                                </div>

                                <div className="col-span-1 md:col-span-2 pt-6 border-t border-dashed border-slate-100 flex flex-col md:flex-row gap-8">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">PAN Number</label>
                                        <p className="font-mono font-bold text-sm">{profile?.panNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Aadhar Number</label>
                                        <p className="font-mono font-bold text-sm">{profile?.aadharNumber || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
