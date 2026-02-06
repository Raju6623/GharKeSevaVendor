import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit2, User, MapPin, ShieldCheck, Building2, Briefcase, BadgeCheck, Mail, Phone, Calendar, Globe } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateVendorProfile } from '../../redux/thunks/vendorThunk';
import { PanModal, BankModal, PersonalDetailsModal } from '../modals/FinanceModals';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import translations from '../../utils/translations';

const FinancialDetailsTab = ({ profile, onBack, onGoToWallet }) => {
    const dispatch = useDispatch();
    const { language } = useSelector(state => state.vendor);
    const t = translations[language] || translations.English;

    const [activeModal, setActiveModal] = useState(null); // 'pan', 'bank', 'personal'
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (updateData) => {
        setIsLoading(true);
        const res = await dispatch(updateVendorProfile(profile.customUserId, updateData));
        setIsLoading(false);
        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Success!', text: 'Details updated successfully.', timer: 1500, showConfirmButton: false });
            setActiveModal(null);
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: res.message });
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 px-6 font-sans">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0c8182] hover:border-[#0c8182] transition-all"
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            {t.financialAndPersonal}
                        </h1>
                        <nav className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-[#0c8182] uppercase tracking-[0.2em]">Partner Hub</span>
                            <span className="text-[10px] text-slate-300">/</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">My Details</span>
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0c8182]/5 border border-[#0c8182]/10 px-6 py-3 rounded-2xl text-[#0c8182]">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-widest italic">100% Secured</span>
                </div>
            </header>

            {/* Main Surface */}
            <main className="bg-white rounded-[3rem] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                {/* Profile Banner */}
                <div className="relative h-48 md:h-64 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,#0c8182_0%,transparent_50%)]" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-12 flex flex-col md:flex-row items-end gap-8 bg-gradient-to-t from-slate-900 to-transparent">
                        <div className="relative shrink-0 translate-y-20">
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white p-1.5 shadow-2xl">
                                <div className="w-full h-full rounded-[2.2rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {profile?.vendorPhoto ? (
                                        <img src={profile.vendorPhoto} alt="Partner" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} className="text-slate-300" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="md:mb-2 text-white text-center md:text-left">
                            <h2 className="text-4xl font-black tracking-tight mb-2">{profile?.firstName} {profile?.lastName}</h2>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                                    {profile?.vendorCategory || 'GS Partner'}
                                </span>
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                    <BadgeCheck size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Verified Partner</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-32 pb-16 px-12 md:px-16 lg:px-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-8 space-y-20">
                            {/* Bank Details */}
                            <section>
                                <SectionHeader icon={<Building2 size={24} />} title="Bank Details" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                    <LedgerEntry label={t.panDetails} value={profile?.panNumber} onEdit={() => setActiveModal('pan')} />
                                    <LedgerEntry label={t.bankDetails} value={profile?.accountNumber} onEdit={() => setActiveModal('bank')} isMasked />
                                    <LedgerEntry label="IFSC Code" value={profile?.ifscCode} />
                                    <LedgerEntry label="Bank Name" value={profile?.bankName} />
                                </div>
                            </section>

                            <Divider />

                            {/* Personal Details */}
                            <section>
                                <SectionHeader icon={<Briefcase size={24} />} title="Personal Details" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                    <LedgerEntry label="Full Name" value={`${profile?.firstName} ${profile?.lastName}`} />
                                    <LedgerEntry label="Aadhar Number" value={profile?.aadharNumber} onEdit={() => setActiveModal('personal')} />
                                    <LedgerEntry label="Date of Birth" value={profile?.dob} />
                                    <LedgerEntry label="Gender" value={profile?.gender} />
                                </div>
                            </section>

                            <Divider />

                            {/* Address Details */}
                            <section>
                                <SectionHeader icon={<MapPin size={24} />} title="Mera Pata (Address)" />
                                <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row gap-12">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pura Pata (Full Address)</p>
                                        <p className="text-lg font-bold text-slate-800 leading-relaxed italic">
                                            {profile?.vendorAddress || profile?.vendorStreet || 'Pata abhi nahi joda gaya hai'}
                                        </p>
                                    </div>
                                    <div className="w-px bg-slate-200 hidden md:block" />
                                    <div className="space-y-6 shrink-0">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shehar (City)</p>
                                            <p className="text-lg font-black text-slate-800 tracking-tight">{profile?.vendorCity || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pin Code</p>
                                            <p className="text-2xl font-black text-[#0c8182] tabular-nums tracking-[0.2em]">{profile?.vendorPincode || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-12">
                            <div className="p-10 bg-[#0c8182] rounded-[3rem] text-white shadow-2xl shadow-[#0c8182]/20 relative overflow-hidden">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-8">My Wallet</h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Available Balance</p>
                                        <p className="text-4xl font-black tabular-nums tracking-tighter">₹{profile?.walletBalance || '0'}<span className="text-lg opacity-40 font-medium">.00</span></p>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div>
                                        <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Total Earnings</p>
                                        <p className="text-2xl font-black tabular-nums tracking-tighter">₹{profile?.totalEarnings || '0'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onGoToWallet}
                                    className="mt-10 w-full py-4 bg-white text-[#0c8182] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-xl"
                                >
                                    See Statement
                                </button>
                            </div>

                            <div className="p-10 border-2 border-slate-100 rounded-[3rem] space-y-8">
                                <h4 className="text-[10px] font-black text-[#0c8182] uppercase tracking-[0.2em]">Contact Details</h4>
                                <div className="space-y-6">
                                    <SidebarContextItem icon={<Mail size={16} />} label="Email" value={profile?.email} />
                                    <SidebarContextItem icon={<Phone size={16} />} label="Phone" value={profile?.userPhone || profile?.phone} />
                                    <SidebarContextItem icon={<Calendar size={16} />} label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2024'} />
                                    <SidebarContextItem icon={<Globe size={16} />} label="State" value={profile?.vendorState || 'Bihar'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'pan' && <PanModal isOpen={true} currentPan={profile?.panNumber} onClose={() => setActiveModal(null)} onSave={handleSave} isLoading={isLoading} />}
                {activeModal === 'bank' && <BankModal isOpen={true} currentBank={{ bankName: profile?.bankName, accountNumber: profile?.accountNumber, ifscCode: profile?.ifscCode, accountHolderName: profile?.accountHolderName }} onClose={() => setActiveModal(null)} onSave={handleSave} isLoading={isLoading} />}
                {activeModal === 'personal' && <PersonalDetailsModal isOpen={true} currentData={{ dob: profile?.dob, aadharNumber: profile?.aadharNumber, fathersName: profile?.fatherName, gender: profile?.gender }} onClose={() => setActiveModal(null)} onSave={handleSave} isLoading={isLoading} />}
            </AnimatePresence>
        </div>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-5 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0c8182]">
            {icon}
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{title}</h3>
    </div>
);

const LedgerEntry = ({ label, value, onEdit, isMasked }) => (
    <div className="relative group min-w-0">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            {onEdit && (
                <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 text-[#0c8182] transition-opacity">
                    <Edit2 size={12} />
                </button>
            )}
        </div>
        <p className="text-lg font-black text-slate-800 tracking-tight truncate">
            {value ? (isMasked ? `•••• •••• ${String(value).slice(-4)}` : value) : <span className="text-amber-500/30 italic font-medium tracking-normal text-sm">Not Provided</span>}
        </p>
    </div>
);

const SidebarContextItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-bold text-slate-700 truncate">{value || '-'}</p>
        </div>
    </div>
);

const Divider = () => <div className="h-[2px] bg-slate-50 w-full" />;

export default FinancialDetailsTab;
