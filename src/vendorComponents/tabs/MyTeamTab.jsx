import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, UserPlus, Phone, Mail, UserCheck, Shield, ChevronLeft, X, Loader2, ArrowRight, Smartphone, Camera, User, Hourglass, CreditCard, FileDigit, UploadCloud, CheckCircle2, AlertCircle, RefreshCcw, Check, Scan, MapPin, Globe, Hash } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateVendorProfile } from '../../redux/thunks/vendorThunk';
import Swal from 'sweetalert2';
import CameraModal from '../../components/CameraModal';

// --- MyTeamTab Component ---
const MyTeamTab = ({ onBack, t }) => {
    const dispatch = useDispatch();
    const { profile } = useSelector(state => state.vendor);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const aadharRef = useRef(null);
    const panRef = useRef(null);
    const mobileSelfieRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        street: '',
        pincode: '',
        city: '',
        state: '',
        type: 'expert',
        aadharPhoto: null,
        panPhoto: null,
        selfiePhoto: null
    });
    const [previews, setPreviews] = useState({ aadhar: null, pan: null, selfie: null });

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [field]: reader.result }));
                setFormData(prev => ({ ...prev, [field + 'Photo']: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraCapture = (dataUrl) => {
        setPreviews(prev => ({ ...prev, selfie: dataUrl }));
        setFormData(prev => ({ ...prev, selfiePhoto: dataUrl }));
    };

    const handleAddMember = async (e) => {
        if (e) e.preventDefault();

        // Comprehensive Validation
        const requiredFields = ['firstName', 'lastName', 'phone', 'street', 'pincode', 'city', 'state'];
        const missingFields = requiredFields.filter(f => !formData[f]);

        if (missingFields.length > 0) {
            Swal.fire({ icon: 'warning', title: t.detailsRequired, text: 'Please fill all address and personal details.', confirmButtonColor: '#0c8182' });
            return;
        }

        if (!formData.aadharPhoto || !formData.selfiePhoto) {
            Swal.fire({ icon: 'warning', title: t.photosRequired, text: 'Please upload Aadhar and Staff Selfie.', confirmButtonColor: '#0c8182' });
            return;
        }

        setIsLoading(true);
        const fullName = `${formData.firstName} ${formData.lastName}`;
        const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

        const updatedTeam = [...(profile?.teamMembers || []), {
            ...formData,
            name: fullName,
            address: fullAddress,
            id: 'ST-' + Date.now(),
            status: 'Pending',
            joinedDate: new Date().toISOString()
        }];

        const res = await dispatch(updateVendorProfile(profile.customUserId, { teamMembers: updatedTeam }));
        setIsLoading(false);

        if (res.success) {
            Swal.fire({ icon: 'success', title: t.sentForApproval, text: `${t.registrationRequest} for ${fullName} submitted.`, confirmButtonColor: '#0c8182' });
            setIsAddModalOpen(false);
            resetForm();
        }
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', phone: '', email: '', street: '', pincode: '', city: '', state: '', type: 'expert', aadharPhoto: null, panPhoto: null, selfiePhoto: null });
        setPreviews({ aadhar: null, pan: null, selfie: null });
    };

    const handleDeleteMember = async (id) => {
        const result = await Swal.fire({ title: t.delete || 'Delete?', text: t.remove || "Remove this staff member?", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: t.accept || 'Yes' });
        if (result.isConfirmed) {
            const updated = (profile?.teamMembers || []).filter(m => m.id !== id);
            dispatch(updateVendorProfile(profile.customUserId, { teamMembers: updated }));
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 px-6 font-sans text-slate-900">
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} title="Staff Selfie Scan" />

            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0c8182] transition-all">
                        <ChevronLeft size={20} />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.team}</h1>
                        <p className="text-sm font-medium text-slate-400 mt-1">{t.underDevelopment || 'Manage and track your authorized personnel'}</p>
                    </div>
                </div>
                <motion.button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-[#0c8182] text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-50 hover:bg-[#0a6d6d] transition-all">
                    <Plus size={18} /> {t.addNewMember}
                </motion.button>
            </header>

            {/* Content Body */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <StatBox label={t.activeStaff} value={(profile?.teamMembers || []).filter(m => m.status === 'Active' || m.status === 'Verified').length} icon={<UserCheck size={20} />} color="emerald" />
                    <StatBox label={t.pending} value={(profile?.teamMembers || []).filter(m => m.status === 'Pending').length} icon={<Hourglass size={20} />} color="amber" />
                    <StatBox label={t.totalStaff} value={profile?.teamMembers?.length || 0} icon={<Users size={20} />} color="indigo" />
                </div>

                <div className="lg:col-span-9">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[500px] overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{t.staffRegistry}</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            {!profile?.teamMembers?.length ? (
                                <div className="py-24 text-center opacity-40 italic font-medium">{t.noStaffFound}</div>
                            ) : profile.teamMembers.map((member, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={i}
                                    className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:border-[#0c8182]/20 transition-all group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 group-hover:border-[#0c8182]/30 transition-all">
                                            {member.selfiePhoto ? <img src={member.selfiePhoto} className="w-full h-full object-cover" /> : <User size={24} className="m-4 text-slate-300" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">{member.name || (member.firstName && `${member.firstName} ${member.lastName}`)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-1 uppercase tracking-wider"><Phone size={10} /> {member.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`text-[9px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest ${member.status === 'Active' || member.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {member.status === 'Active' || member.status === 'Verified' ? 'Active' : 'Pending'}
                                        </span>
                                        <button onClick={() => handleDeleteMember(member.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"><X size={18} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Member Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-[0_32px_120px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Modal Sidebar */}
                            <div className="w-full md:w-80 bg-slate-950 p-12 text-white shrink-0 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-4xl font-black italic mb-12 tracking-tighter">{t.addNewMember}</h2>
                                    <div className="space-y-6 relative">
                                        <div className="flex items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/10">
                                            <UserCheck className="text-[#0c8182]" size={20} />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Single Step</p>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase">One-form Entry</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Check all details before submitting for approval.</p>
                                </div>
                            </div>

                            {/* Modal Main Form Area (Single Step) */}
                            <div className="flex-1 p-14 overflow-y-auto">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.registrationRequest}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t.utilitySecure}</p>
                                    </div>
                                    <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-all"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleAddMember} className="space-y-12">
                                    {/* Section 1: Personal Info */}
                                    <div className="space-y-8">
                                        <SectionHeader title={t.staffInformation} />
                                        <div className="grid grid-cols-2 gap-8">
                                            <InputField label={t.firstName} value={formData.firstName} onChange={v => setFormData({ ...formData, firstName: v })} placeholder="e.g. Ramesh" />
                                            <InputField label={t.lastName} value={formData.lastName} onChange={v => setFormData({ ...formData, lastName: v })} placeholder="e.g. Kumar" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <InputField label={t.phone} type="tel" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} placeholder="10-digit number" />
                                            <InputField label={t.email + " (Optional)"} type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="name@example.com" />
                                        </div>
                                    </div>

                                    {/* Section 2: Full Address */}
                                    <div className="space-y-8">
                                        <SectionHeader title={t.addressDetails} />
                                        <div className="space-y-4">
                                            <InputField label={t.addressDetails} icon={<MapPin size={18} />} value={formData.street} onChange={v => setFormData({ ...formData, street: v })} placeholder="House No, Area, LandMark" />
                                            <div className="grid grid-cols-3 gap-8">
                                                <InputField label={t.pincode || 'Pincode'} icon={<Hash size={14} />} value={formData.pincode} onChange={v => setFormData({ ...formData, pincode: v.replace(/[^0-9]/g, '').slice(0, 6) })} placeholder="6-digit" />
                                                <InputField label={t.city} icon={<Globe size={14} />} value={formData.city} onChange={v => setFormData({ ...formData, city: v })} placeholder="District" />
                                                <InputField label={t.state || 'State'} icon={<Globe size={14} />} value={formData.state} onChange={v => setFormData({ ...formData, state: v })} placeholder="State" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Documents & Camera */}
                                    <div className="space-y-8">
                                        <SectionHeader title={t.financialDetails} />
                                        <div className="grid grid-cols-2 gap-8">
                                            <DocBox label="Aadhar Card" preview={previews.aadhar} onClick={() => aadharRef.current.click()} />
                                            <input type="file" ref={aadharRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'aadhar')} />
                                            <DocBox label="PAN Card" preview={previews.pan} onClick={() => panRef.current.click()} />
                                            <input type="file" ref={panRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'pan')} />
                                        </div>

                                        <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center gap-6 relative group border-[#0c8182]/20">
                                            {previews.selfie ? (
                                                <img src={previews.selfie} className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                                                    <Camera size={28} />
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <p className="font-black text-slate-800 tracking-tight">{t.staffPortrait}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{t.underDevelopment || 'Click selfie on white background'}</p>
                                            </div>
                                            <button type="button" onClick={() => {
                                                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                                                if (isMobile) mobileSelfieRef.current.click();
                                                else setIsCameraOpen(true);
                                            }} className="px-10 py-5 bg-[#0c8182] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-[#0a6d6d] transition-all">
                                                {previews.selfie ? t.retakePhoto : t.openCamera}
                                            </button>
                                            <input type="file" ref={mobileSelfieRef} hidden accept="image/*" capture="user" onChange={e => handleFileChange(e, 'selfie')} />
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : t.registerStaff}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-[#0c8182]" />
        <h4 className="text-xs font-black text-[#0c8182] uppercase tracking-[0.15em]">{title}</h4>
        <div className="flex-1 h-[1px] bg-slate-100" />
    </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
            <input
                type={type}
                required
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl ${icon ? 'pl-16' : 'px-8'} font-black text-slate-700 placeholder:text-slate-200 focus:bg-white focus:border-[#0c8182] transition-all outline-none`}
            />
        </div>
    </div>
);

const DocBox = ({ label, preview, onClick }) => (
    <div onClick={onClick} className="h-28 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#0c8182]/50 transition-all overflow-hidden relative group">
        {preview ? (
            <>
                <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <RefreshCcw className="text-white" size={20} />
                </div>
            </>
        ) : (
            <>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white transition-all shadow-sm">
                    <CreditCard className="text-slate-300" size={18} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest relative z-10">{label}</span>
            </>
        )}
    </div>
);

const StatBox = ({ label, value, icon, color }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20'
    };
    return (
        <motion.div whileHover={{ y: -5 }} className={`p-8 rounded-[2.5rem] border ${colors[color]} bg-white shadow-xl flex flex-col items-center text-center`}>
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-6 border border-slate-50">{icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{label}</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter italic">{value}</p>
        </motion.div>
    );
};

export default MyTeamTab;
