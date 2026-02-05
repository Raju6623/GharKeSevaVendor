import React, { useState } from 'react';
import { User, MapPin, Briefcase, Star, Mail, Phone, Shield, CheckCircle2, CreditCard, Building, Monitor, Smartphone, Globe, Landmark, Hash, Award, Edit2, Plus, X, Loader2, ChevronRight, Calendar, Users, BookOpen, HelpCircle, LogOut, MessageSquare, IndianRupee, ArrowLeft, Share2, ShoppingBag, MessageCircle, History } from 'lucide-react';
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

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const CategoryModal = ({ isOpen, onClose, currentCategories, onSave, isUpdating }) => {
    const [selected, setSelected] = useState(currentCategories || []);

    if (!isOpen) return null;

    const toggleCategory = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            if (selected.length >= 3) {
                Swal.fire({ icon: 'warning', title: 'Limit Reached', text: 'You can select up to 3 categories.' });
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
                        <h3 className="text-xl font-black text-slate-800">Expertise Categories</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Select up to 3 categories you serve</p>
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
                        {isUpdating ? <Loader2 size={20} className="animate-spin" /> : 'Update Categories'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileTab = ({ profile, setIsReviewsModalOpen, setActiveTab }) => {
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
        fatherName: profile?.fatherName || '', // Added based on image
        aadharNumber: profile?.aadharNumber || '',
        userEmail: profile?.userEmail || '',
        userPhone: profile?.userPhone || '',
        panNumber: profile?.panNumber || '',
        bankName: profile?.bankName || '',
        accountNumber: profile?.accountNumber || '',
        ifscCode: profile?.ifscCode || '',
        gstNumber: profile?.gstNumber || '', // Added based on image
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
                title: 'Updated!',
                text: 'Your service categories have been updated successfully.',
                timer: 2000,
                showConfirmButton: false
            });
            setIsCatModalOpen(false);
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: res.message });
        }
    };

    const handleSaveProfile = async () => {
        const res = await dispatch(updateVendorProfile(profile.customUserId, formData));
        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Saved!', text: 'Details updated successfully.', timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.message });
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Sign Out?',
            text: "Are you sure you want to log out?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#f1f5f9',
            confirmButtonText: 'Yes, Sign Out',
            cancelButtonText: 'Cancel'
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
    const DetailField = ({ label, value, type = "text", name, placeholder = "Not Provided" }) => (
        <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
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
                                <p className="text-[10px] font-black text-slate-400 uppercase">Rating</p>
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-black text-slate-800">{profile?.rating || '0.0'}</span>
                                </div>
                            </div>
                            <div className="w-px bg-slate-200 h-8 self-center"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Experience</p>
                                <p className="text-sm font-black text-slate-800 mt-0.5">{profile?.experience || '0'}Y+</p>
                            </div>
                            <div className="w-px bg-slate-200 h-8 self-center"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">City</p>
                                <p className="text-sm font-black text-slate-800 mt-0.5">{profile?.vendorCity || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Menu Items */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-6">
                        <MenuItem icon={User} label="Complete Profile" sublabel="Personal details, Father's name, etc." onClick={() => setCurrentView('personal')} color="text-indigo-600" />
                        <MenuItem icon={Users} label={translations[useSelector(state => state.vendor.language)]?.team || "My Team"} sublabel="Manage your service team" onClick={() => setActiveTab('team')} color="text-emerald-600" />
                        <MenuItem icon={History} label="Job history" sublabel="View your past completed jobs" onClick={() => setActiveTab('history')} color="text-amber-600" />
                        <MenuItem icon={Briefcase} label="My Hub" sublabel="Manage expertise categories" onClick={() => setIsCatModalOpen(true)} color="text-blue-600" />
                        <MenuItem icon={IndianRupee} label="Credits" sublabel="Balance and transaction history" onClick={() => setActiveTab('dashboard')} color="text-purple-600" />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-6">
                        <MenuItem icon={Landmark} label="Financial details" sublabel="GST, PAN and Bank information" onClick={() => setCurrentView('financial')} color="text-indigo-600" />
                        <MenuItem icon={MessageCircle} label="Send WhatsApp updates" sublabel="Switch on for real-time alerts" color="text-green-500" />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                        <MenuItem icon={HelpCircle} label="Help Center" color="text-slate-500" />
                        <MenuItem icon={Share2} label="Invite a friend to GharKeSeva" onClick={() => {
                            const refCode = profile?.referralCode || profile?.customUserId || "GS-PARTNER";
                            const shareUrl = `${window.location.origin}/register?ref=${refCode}`;
                            const shareText = `Join me as a service partner on GharKeSeva! Use my referral code: ${refCode}`;

                            if (navigator.share) {
                                navigator.share({ title: 'GharKeSeva Partner', text: shareText, url: shareUrl });
                            } else {
                                Swal.fire({
                                    title: 'Refer & Earn',
                                    html: `<div class="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 mb-4">
                                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Partner Code</p>
                                            <p class="text-3xl font-black text-indigo-600 tracking-[0.2em]">${refCode}</p>
                                           </div>
                                           <p class="text-sm text-slate-500 font-medium">Share this code with other experts to join our network!</p>`,
                                    confirmButtonText: 'Copy Invite Link',
                                    confirmButtonColor: '#4f46e5',
                                    showCancelButton: true,
                                    cancelButtonText: 'Close'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        navigator.clipboard.writeText(shareUrl);
                                        Swal.fire({ icon: 'success', title: 'Link Copied!', showConfirmButton: false, timer: 1500 });
                                    }
                                });
                            }
                        }} color="text-rose-500" />
                        <MenuItem icon={ShoppingBag} label="GharKeSeva Shop" color="text-amber-500" />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-8 p-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-95 transition-all"
                    >
                        <LogOut size={20} /> Sign Out
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
                        <h2 className="text-2xl font-black text-slate-800">Personal Details</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="grid grid-cols-2 gap-6">
                            <DetailField label="First Name" value={formData.firstName} name="firstName" />
                            <DetailField label="Last Name" value={formData.lastName} name="lastName" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <DetailField label="Date of Birth" value={formData.dob} name="dob" type="date" />
                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full bg-transparent border-b border-slate-200 py-2 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-colors"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <DetailField label="Father's Name" value={formData.fatherName} name="fatherName" />
                        <DetailField label="Aadhar Number" value={formData.aadharNumber} name="aadharNumber" />
                        <DetailField label="Email Address" value={formData.userEmail} name="userEmail" type="email" />
                        <DetailField label="Phone Number" value={formData.userPhone} name="userPhone" />

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isUpdating}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
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
                        <h2 className="text-2xl font-black text-slate-800">Financial Details</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Hash size={24} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">GST Details</p>
                                    <p className="text-lg font-black text-slate-800">{formData.gstNumber || "Add GST Number"}</p>
                                </div>
                            </div>
                            <button className="text-indigo-600 font-black text-sm hover:underline">Add +</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><CreditCard size={24} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">PAN Card Details</p>
                                    <p className="text-lg font-black text-slate-800">{formData.panNumber || "Add PAN Number"}</p>
                                </div>
                            </div>
                            <button className="text-indigo-600 font-black text-sm hover:underline">Add +</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={24} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase">Bank Account</p>
                                    <p className="text-lg font-black text-slate-800">{formData.bankName || "Add Bank Account"}</p>
                                    {formData.accountNumber && <p className="text-xs font-bold text-slate-400 font-mono mt-1">A/C: {formData.accountNumber}</p>}
                                </div>
                            </div>
                            <button className="text-indigo-600 font-black text-sm hover:underline">Add +</button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><IndianRupee size={24} /></div>
                                    <h3 className="text-lg font-black text-slate-800">Bank Details</h3>
                                </div>
                                <button onClick={handleSaveProfile} className="text-indigo-600 font-black text-sm hover:underline">Save Details</button>
                            </div>

                            <DetailField label="Bank Name" value={formData.bankName} name="bankName" />
                            <DetailField label="Account Number" value={formData.accountNumber} name="accountNumber" />
                            <DetailField label="IFSC Code" value={formData.ifscCode} name="ifscCode" />
                            <DetailField label="GST Number (Optional)" value={formData.gstNumber} name="gstNumber" />
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
            />
        </div>
    );
};

export default ProfileTab;
