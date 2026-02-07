import React, { useState } from 'react';
import { X, Loader2, CreditCard, Landmark, MapPin, User, CheckCircle2, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

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

export const PanModal = ({ isOpen, onClose, currentPan, onSave, isLoading, t }) => {
    const [pan, setPan] = useState(currentPan || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (pan.length !== 10) {
            Swal.fire({ icon: 'error', title: 'Invalid PAN', text: 'PAN must be 10 characters long.' });
            return;
        }
        onSave({ panNumber: pan.toUpperCase() });
    };

    return (
        <FinanceModalLayout title={t.panDetails || "PAN Card Details"} icon={<CreditCard className="text-[#0c8182]" />} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">PAN Number</label>
                    <input
                        type="text"
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#0c8182] focus:bg-white transition-all outline-none font-mono text-lg tracking-widest"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading || !pan}
                    className="w-full py-4 bg-[#0c8182] text-white rounded-2xl font-bold shadow-xl shadow-teal-50 hover:bg-[#0a6d6d] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : t.save || 'Save PAN Details'}
                </button>
            </div>
        </FinanceModalLayout>
    );
};

export const BankModal = ({ isOpen, onClose, currentBank = {}, onSave, isLoading, t }) => {
    const [bankData, setBankData] = useState({
        bankName: currentBank.bankName || '',
        accountNumber: currentBank.accountNumber || '',
        ifscCode: currentBank.ifscCode || '',
        accountHolderName: currentBank.accountHolderName || ''
    });

    if (!isOpen) return null;

    const validateIFSC = (ifsc) => {
        const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return regex.test(ifsc);
    };

    const handleSave = () => {
        if (!bankData.bankName || !bankData.accountNumber || !bankData.ifscCode || !bankData.accountHolderName) {
            Swal.fire({ icon: 'error', title: t.error || 'Missing Info', text: 'Please fill all required bank details.' });
            return;
        }
        if (!validateIFSC(bankData.ifscCode)) {
            Swal.fire({ icon: 'error', title: t.invalidIFSC || 'Invalid IFSC', text: 'IFSC code should be 11 characters (e.g. SBIN0012345)' });
            return;
        }
        onSave(bankData);
    };

    return (
        <FinanceModalLayout title={t.bankDetails || "Bank Account Details"} icon={<Landmark className="text-[#0c8182]" />} onClose={onClose}>
            <div className="space-y-4">
                <InputGroup label={t.accountHolderName || "Account Holder Name"} value={bankData.accountHolderName} onChange={(v) => setBankData({ ...bankData, accountHolderName: v })} placeholder="Enter name as per bank" />

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t.bankName || "Bank Name"}</label>
                    <div className="relative">
                        <select
                            value={bankData.bankName}
                            onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#0c8182] focus:bg-white transition-all outline-none font-bold text-slate-800 appearance-none"
                        >
                            <option value="">{t.selectBank || "-- Select Bank --"}</option>
                            {popularBanks.map(bank => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                            <option value="Other">Other Bank</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {bankData.bankName === 'Other' && (
                    <InputGroup label="Enter Bank Name" value={bankData.customBank || ''} onChange={(v) => setBankData({ ...bankData, customBank: v, bankName: 'Other' })} placeholder="Type your bank name" />
                )}

                <InputGroup label={t.accountNumber || "Account Number"} value={bankData.accountNumber} onChange={(v) => setBankData({ ...bankData, accountNumber: v.replace(/\D/g, '') })} placeholder="Enter account number" />
                <InputGroup label={t.ifscCode || "IFSC Code"} value={bankData.ifscCode} onChange={(v) => setBankData({ ...bankData, ifscCode: v.toUpperCase().slice(0, 11) })} placeholder="e.g. HDFC0001234" />

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-4 bg-[#0c8182] text-white rounded-2xl font-bold shadow-xl shadow-teal-50 hover:bg-[#0a6d6d] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : t.save || 'Save Bank Details'}
                </button>
            </div>
        </FinanceModalLayout>
    );
};

const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const PersonalDetailsModal = ({ isOpen, onClose, currentData = {}, onSave, isLoading, t }) => {
    const [data, setData] = useState({
        dob: currentData.dob || '',
        aadharNumber: currentData.aadharNumber || '',
        fathersName: currentData.fathersName || '',
        gender: currentData.gender || ''
    });

    if (!isOpen) return null;

    const formatAadhar = (val) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,12}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length > 0) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleAadharChange = (v) => {
        const formatted = formatAadhar(v);
        if (formatted.length <= 14) { // 12 digits + 2 spaces
            setData({ ...data, aadharNumber: formatted });
        }
    };

    const handleSave = () => {
        if (calculateAge(data.dob) < 16) {
            Swal.fire({ icon: 'warning', title: t.ageRequirement || 'Age Requirement', text: t.underAge || 'Vendor must be at least 16 years old.' });
            return;
        }
        const cleanAadhar = data.aadharNumber.replace(/\s/g, '');
        if (cleanAadhar && cleanAadhar.length !== 12) {
            Swal.fire({ icon: 'error', title: t.invalidAadhar || 'Invalid Aadhar', text: 'Aadhar number must be 12 digits.' });
            return;
        }
        onSave({ ...data, aadharNumber: cleanAadhar });
    };

    return (
        <FinanceModalLayout title={t.personalDetails || "Edit Personal Details"} icon={<User className="text-[#0c8182]" />} onClose={onClose}>
            <div className="space-y-4">
                <InputGroup label={t.dob || "Date of Birth"} type="date" value={data.dob} onChange={(v) => {
                    setData({ ...data, dob: v });
                    if (v && calculateAge(v) < 16) {
                        Swal.fire({ icon: 'warning', title: t.ageRequirement || 'Age Requirement', text: t.underAge || 'Vendor must be at least 16 years old.' });
                    }
                }} />
                <InputGroup label={t.aadharNumber || "Aadhar Number"} value={data.aadharNumber} onChange={handleAadharChange} placeholder="XXXX XXXX XXXX" />
                <InputGroup label={t.fatherName || "Father's Name"} value={data.fathersName} onChange={(v) => setData({ ...data, fathersName: v })} placeholder="Enter father's name" />

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t.gender || "Gender"}</label>
                    <div className="flex gap-2">
                        {['Male', 'Female', 'Other'].map(g => (
                            <button
                                key={g}
                                onClick={() => setData({ ...data, gender: g })}
                                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${data.gender === g ? 'bg-[#0c8182] border-[#0c8182] text-white shadow-lg shadow-teal-50' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-4 bg-[#0c8182] text-white rounded-2xl font-bold shadow-xl shadow-teal-50 hover:bg-[#0a6d6d] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : t.updateProfile || 'Update Personal Info'}
                </button>
            </div>
        </FinanceModalLayout>
    );
};

const FinanceModalLayout = ({ title, icon, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Securely manage info</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl shadow-sm border border-slate-100 transition-all">
                    <X size={20} />
                </button>
            </div>
            <div className="p-8">
                {children}
            </div>
        </div>
    </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text", maxLength }) => (
    <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#0c8182] focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
        />
    </div>
);
