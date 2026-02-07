import React, { useState } from 'react';
import { User, MapPin, Briefcase, Star, Mail, Phone, Shield, CheckCircle2, CreditCard, Building, Monitor, Smartphone, Globe, Landmark, Hash, Award, Edit2, Plus, X, Loader2, ChevronRight, Calendar, Users, BookOpen, HelpCircle, LogOut, MessageSquare, IndianRupee, ArrowLeft, Share2, ShoppingBag, MessageCircle, History, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import axios from 'axios';
import { updateVendorProfile } from '../../redux/thunks/vendorThunk';
import { BASE_URL, API_URL } from '../../config';

const ALL_CATEGORIES = [
    { id: 'AC', label: 'AC Specialist' },
    { id: 'Plumbing', label: 'Plumber' },
    { id: 'Electrician', label: 'Electrician' },
    { id: 'Carpenter', label: 'Carpenter' },
    { id: 'RO', label: 'RO Expert' },
    { id: 'Salon', label: 'Salon & Spa' },
    { id: 'HouseMaid', label: 'Home Maids' },
    { id: 'Painting', label: 'Painter' },
    { id: 'SmartLock', label: 'Smart Lock' },
    { id: 'Appliances', label: 'Appliances Repair' }
];

const popularBanks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "Axis Bank",
    "Canara Bank",
    "Bank of Baroda",
    "Union Bank of India",
    "IDBI Bank",
    "IndusInd Bank",
    "Kotak Mahindra Bank",
    "Yes Bank",
    "Federal Bank",
    "Indian Bank",
    "UCO Bank",
    "Central Bank of India",
    "Bank of India",
    "Indian Overseas Bank",
    "IDFC First Bank",
    "Bandhan Bank",
    "Airtel Payments Bank",
    "Jio Payments Bank",
    "Paytm Payments Bank"
].sort();

const formatAadhar = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,12}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    if (parts.length > 0) {
        return parts.join(' ').substring(0, 14);
    } else {
        return v;
    }
};

const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const CategoryModal = ({ isOpen, onClose, currentCategories, onSave, isUpdating, t }) => {
    const [selected, setSelected] = useState(currentCategories || []);

    if (!isOpen) return null;

    const toggleCategory = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            if (selected.length >= 3) {
                Swal.fire({ icon: 'warning', title: 'Limit Reached', text: (t.selectCategories || 'Select up to 3 categories') });
                return;
            }
            setSelected([...selected, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">{t.expertiseCategories}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">{t.selectCategories}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {ALL_CATEGORIES.map(cat => {
                            const isSelected = selected.includes(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-tight border transition-all flex items-center justify-between gap-2 ${isSelected
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {cat.label}
                                    {isSelected && <CheckCircle2 size={14} />}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onSave(selected)}
                        disabled={isUpdating || selected.length === 0}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUpdating ? <Loader2 size={20} className="animate-spin" /> : t.updateCategories}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileTab = ({ profile, setIsReviewsModalOpen, setActiveTab, t }) => {
    const dispatch = useDispatch();
    const [currentView, setCurrentView] = useState('menu'); // 'menu', 'personal', 'financial'
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const isActionLoading = useSelector(state => state.vendor.isActionLoading);
    const isUpdating = isActionLoading === 'profile-update';

    // State for editable fields (initializing with profile data)
    const [formData, setFormData] = useState({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        dob: profile?.dob || '',
        gender: profile?.gender || '',
        fatherName: profile?.fatherName || '',
        aadharNumber: profile?.aadharNumber || '',
        userEmail: profile?.userEmail || '',
        userPhone: profile?.userPhone || '',
        panNumber: profile?.panNumber || '',
        bankName: profile?.bankName || '',
        accountNumber: profile?.accountNumber || '',
        ifscCode: profile?.ifscCode || '',
        gstNumber: profile?.gstNumber || '',
    });

    const handleSaveCategories = async (newCats) => {
        if (newCats.length === 0) return;

        const res = await dispatch(updateVendorProfile(profile.customUserId, {
            vendorCategories: newCats,
            vendorCategory: newCats[0] // Set first as primary
        }));

        if (res.success) {
            Swal.fire({
                icon: 'success',
                title: t.edit + '!',
                text: t.updateCategories,
                timer: 2000,
                showConfirmButton: false
            });
            setIsCatModalOpen(false);
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: res.message });
        }
    };

    const handleSaveProfile = async () => {
        if (calculateAge(formData.dob) < 16) {
            Swal.fire({ icon: 'warning', title: t.ageRequirement || 'Age Requirement', text: t.underAge || 'Vendor must be at least 16 years old.' });
            return;
        }
        const res = await dispatch(updateVendorProfile(profile.customUserId, formData));
        if (res.success) {
            Swal.fire({ icon: 'success', title: t.save + '!', text: t.saveChanges, timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.message });
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: t.logout + '?',
            text: t.underDevelopment,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#f1f5f9',
            confirmButtonText: t.logout,
            cancelButtonText: t.privacy
        });

        if (result.isConfirmed) {
            try {
                const vendorData = JSON.parse(localStorage.getItem('vendorData'));
                if (vendorData?.id) {
                    await axios.post(`${API_URL}/vendor/logout`, { vendorId: vendorData.id });
                }
            } catch (e) { console.error("Logout failed", e); }
            finally {
                localStorage.clear();
                window.location.href = "/login";
            }
        }
    };

    const vendorCategories = profile?.vendorCategories || (profile?.vendorCategory ? [profile.vendorCategory] : []);

    // Menu Item Component
    const MenuItem = ({ icon: Icon, label, sublabel, onClick, color = "text-slate-600" }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all border-b border-slate-100 group active:bg-slate-100"
        >
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 ${color}`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    {sublabel && <p className="text-[10px] text-slate-400 font-medium">{sublabel}</p>}
                </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>
    );

    // Detail Field Component
    const DetailField = ({ label, value, type = "text", name, placeholder = t.notProvided, onChange }) => (
        <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={(e) => {
                    if (onChange) onChange(e.target.value);
                    else setFormData({ ...formData, [name]: e.target.value });
                }}
                placeholder={placeholder}
                className="w-full bg-transparent border-b border-slate-200 py-2 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-colors text-base"
            />
        </div>
    );

    // Render Logic
    const renderContent = () => {
        if (currentView === 'menu') {
            return (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Profile Header */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-6">
                        <div className="p-8 flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 p-1 bg-white shadow-md">
                                    {profile?.vendorPhoto ? (
                                        <img src={getImageUrl(profile.vendorPhoto)} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                                    <CheckCircle2 size={12} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 leading-tight">
                                    {profile?.firstName} <span className="text-indigo-600">{profile?.lastName}</span>
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">ID: {profile?.customUserId}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 flex justify-around border-t border-slate-100">
                            <div className="text-center cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setIsReviewsModalOpen(true)}>
                                <p className="text-[10px] font-black text-slate-400 uppercase">{t.rating}</p>
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-black text-slate-800">{profile?.rating || '0.0'}</span>
                                </div>
                            </div>
                            <div className="w-px bg-slate-200 h-8 self-center"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">{t.experience}</p>
                                <p className="text-sm font-black text-slate-800 mt-0.5">{profile?.experience || '0'}Y+</p>
                            </div>
                            <div className="w-px bg-slate-200 h-8 self-center"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">{t.city}</p>
                                <p className="text-sm font-black text-slate-800 mt-0.5">{profile?.vendorCity || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Menu Items */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-6">
                        <MenuItem icon={User} label={t.completeProfile} sublabel={t.personalSub} onClick={() => setCurrentView('personal')} color="text-indigo-600" />
                        <MenuItem icon={Sparkles} label={t.parivaar} sublabel={t.birthdayWishParivaar} onClick={() => setActiveTab('parivaar')} color="text-emerald-600" />
                        <MenuItem icon={History} label={t.history} sublabel={t.jobHistorySub} onClick={() => setActiveTab('history')} color="text-amber-600" />
                        <MenuItem icon={Briefcase} label={t.hub} sublabel={t.myHubSub} onClick={() => setIsCatModalOpen(true)} color="text-blue-600" />
                        <MenuItem icon={IndianRupee} label={t.credits} sublabel={t.creditsSub} onClick={() => setActiveTab('dashboard')} color="text-purple-600" />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-6">
                        <MenuItem icon={Landmark} label={t.financialDetails} sublabel={t.gstSub} onClick={() => setCurrentView('financial')} color="text-indigo-600" />
                        <MenuItem icon={MessageCircle} label={t.whatsappUpdates} sublabel={t.whatsappSub} color="text-green-500" />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                        <MenuItem icon={HelpCircle} label={t.helpCenter} color="text-slate-500" />
                        <MenuItem icon={Share2} label={t.inviteFriend} sublabel={t.inviteFriendSub} onClick={() => {
                            const refCode = profile?.referralCode || profile?.customUserId || "GS-PARTNER";
                            const shareUrl = `${window.location.origin}/register?ref=${refCode}`;
                            const shareText = `Join me as a service partner on GharKeSeva! Use my referral code: ${refCode}`;

                            if (navigator.share) {
                                navigator.share({ title: 'GharKeSeva Partner', text: shareText, url: shareUrl });
                            } else {
                                Swal.fire({
                                    title: t.inviteFriend,
                                    html: `<div class="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 mb-4">
                                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">${t.inviteFriend}</p>
                                            <p class="text-3xl font-black text-indigo-600 tracking-[0.2em]">${refCode}</p>
                                           </div>
                                           <p class="text-sm text-slate-500 font-medium">${t.inviteFriendSub}</p>`,
                                    confirmButtonText: t.save,
                                    confirmButtonColor: '#4f46e5',
                                    showCancelButton: true,
                                    cancelButtonText: t.privacy
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        navigator.clipboard.writeText(shareUrl);
                                        Swal.fire({ icon: 'success', title: 'Link Copied!', showConfirmButton: false, timer: 1500 });
                                    }
                                });
                            }
                        }} color="text-rose-500" />
                        <MenuItem icon={ShoppingBag} label={t.shop} color="text-amber-500" />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-8 p-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-95 transition-all"
                    >
                        <LogOut size={20} /> {t.signOut}
                    </button>
                </div>
            );
        }

        if (currentView === 'personal') {
            return (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setCurrentView('menu')} className="p-3 bg-white shadow-md rounded-2xl text-slate-500 hover:text-indigo-600 active:scale-90 transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-slate-800">{t.personalDetails}</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="grid grid-cols-2 gap-6">
                            <DetailField label={t.firstName} value={formData.firstName} name="firstName" />
                            <DetailField label={t.lastName} value={formData.lastName} name="lastName" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <DetailField label={t.dob} value={formData.dob} name="dob" type="date" onChange={(v) => {
                                setFormData({ ...formData, dob: v });
                                if (v && calculateAge(v) < 16) {
                                    Swal.fire({ icon: 'warning', title: t.ageRequirement || 'Age Requirement', text: t.underAge || 'Vendor must be at least 16 years old.' });
                                }
                            }} />
                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.gender}</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full bg-transparent border-b border-slate-200 py-2 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-colors"
                                >
                                    <option value="">{t.viewAll}</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <DetailField label={t.fatherName} value={formData.fatherName} name="fatherName" />
                        <DetailField
                            label={t.aadharNumber || "Aadhar Number"}
                            value={formData.aadharNumber}
                            name="aadharNumber"
                            onChange={(v) => {
                                const formatted = formatAadhar(v);
                                if (formatted.length <= 14) setFormData({ ...formData, aadharNumber: formatted });
                            }}
                        />
                        <DetailField label={t.email} value={formData.userEmail} name="userEmail" type="email" />
                        <DetailField label={t.phone} value={formData.userPhone} name="userPhone" />

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isUpdating}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 size={20} className="animate-spin" /> : t.saveChanges}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (currentView === 'financial') {
            return (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setCurrentView('menu')} className="p-3 bg-white shadow-md rounded-2xl text-slate-500 hover:text-indigo-600 active:scale-90 transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-slate-800">{t.financialDetails}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Hash size={24} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">{t.gstNumber}</p>
                                    <p className="text-lg font-black text-slate-800">{formData.gstNumber || t.add}</p>
                                </div>
                            </div>
                            <button className="text-indigo-600 font-black text-sm hover:underline">{t.add} +</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><CreditCard size={24} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">{t.panDetails}</p>
                                    <p className="text-lg font-black text-slate-800">{formData.panNumber || t.add}</p>
                                </div>
                            </div>
                            <button className="text-indigo-600 font-black text-sm hover:underline">{t.add} +</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={24} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">{t.bankDetails}</p>
                                    <p className="text-lg font-black text-slate-800">{formData.bankName || t.add}</p>
                                    {formData.accountNumber && <p className="text-xs font-bold text-slate-400 font-mono mt-1">{t.accountNumber}: {formData.accountNumber}</p>}
                                </div>
                            </div>
                            <button className="text-indigo-600 font-black text-sm hover:underline">{t.add} +</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><IndianRupee size={24} /></div>
                                    <h3 className="text-lg font-black text-slate-800">{t.bankDetails}</h3>
                                </div>
                                <button onClick={handleSaveProfile} className="text-indigo-600 font-black text-sm hover:underline">{t.saveChanges}</button>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.bankName}</label>
                                <select
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full bg-transparent border-b border-slate-200 py-2 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-colors"
                                >
                                    <option value="">{t.selectBank}</option>
                                    {popularBanks.map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                    <option value="Other">Other Bank</option>
                                </select>
                            </div>

                            {formData.bankName === 'Other' && (
                                <DetailField label="Enter Bank Name" value={formData.customBank || ''} name="customBank" onChange={(v) => setFormData({ ...formData, customBank: v, bankName: 'Other' })} />
                            )}

                            <DetailField label={t.accountNumber} value={formData.accountNumber} name="accountNumber" onChange={(v) => setFormData({ ...formData, accountNumber: v.replace(/\D/g, '') })} />

                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{t.ifscCode}</label>
                                <input
                                    type="text"
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase().slice(0, 11) })}
                                    className={`w-full bg-transparent border-b py-2 font-bold outline-none transition-colors ${formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode) && formData.ifscCode.length === 11 ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                                />
                                {formData.ifscCode && formData.ifscCode.length === 11 && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode) && (
                                    <p className="text-[9px] text-red-500 mt-1 font-bold">Invalid IFSC Format</p>
                                )}
                            </div>

                            <DetailField label={t.gstNumber} value={formData.gstNumber} name="gstNumber" />
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {renderContent()}

            <CategoryModal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                currentCategories={vendorCategories}
                onSave={handleSaveCategories}
                isUpdating={isUpdating}
                t={t}
            />
        </div>
    );
};

export default ProfileTab;
