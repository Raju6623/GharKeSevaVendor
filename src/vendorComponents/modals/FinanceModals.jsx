import React, { useState } from 'react';
import { X, Loader2, CreditCard, Landmark, MapPin, User, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export const PanModal = ({ isOpen, onClose, currentPan, onSave, isLoading }) => {
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
        <FinanceModalLayout title="PAN Card Details" icon={<CreditCard className="text-indigo-600" />} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">PAN Number</label>
                    <input
                        type="text"
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-mono text-lg tracking-widest"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading || !pan}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Save PAN Details'}
                </button>
            </div>
        </FinanceModalLayout>
    );
};

export const BankModal = ({ isOpen, onClose, currentBank = {}, onSave, isLoading }) => {
    const [bankData, setBankData] = useState({
        bankName: currentBank.bankName || '',
        accountNumber: currentBank.accountNumber || '',
        ifscCode: currentBank.ifscCode || '',
        accountHolderName: currentBank.accountHolderName || ''
    });

    if (!isOpen) return null;

    const handleSave = () => {
        if (!bankData.bankName || !bankData.accountNumber || !bankData.ifscCode) {
            Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Please fill all required bank details.' });
            return;
        }
        onSave(bankData);
    };

    return (
        <FinanceModalLayout title="Bank Account Details" icon={<Landmark className="text-indigo-600" />} onClose={onClose}>
            <div className="space-y-4">
                <InputGroup label="Account Holder Name" value={bankData.accountHolderName} onChange={(v) => setBankData({ ...bankData, accountHolderName: v })} placeholder="Enter name as per bank" />
                <InputGroup label="Bank Name" value={bankData.bankName} onChange={(v) => setBankData({ ...bankData, bankName: v })} placeholder="e.g. HDFC Bank" />
                <InputGroup label="Account Number" value={bankData.accountNumber} onChange={(v) => setBankData({ ...bankData, accountNumber: v })} placeholder="Enter account number" />
                <InputGroup label="IFSC Code" value={bankData.ifscCode} onChange={(v) => setBankData({ ...bankData, ifscCode: v.toUpperCase() })} placeholder="e.g. HDFC0001234" />

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Save Bank Details'}
                </button>
            </div>
        </FinanceModalLayout>
    );
};

export const PersonalDetailsModal = ({ isOpen, onClose, currentData = {}, onSave, isLoading }) => {
    const [data, setData] = useState({
        dob: currentData.dob || '',
        aadharNumber: currentData.aadharNumber || '',
        fathersName: currentData.fathersName || '',
        gender: currentData.gender || ''
    });

    if (!isOpen) return null;

    return (
        <FinanceModalLayout title="Edit Personal Details" icon={<User className="text-indigo-600" />} onClose={onClose}>
            <div className="space-y-4">
                <InputGroup label="Date of Birth" type="date" value={data.dob} onChange={(v) => setData({ ...data, dob: v })} />
                <InputGroup label="Aadhar Number" value={data.aadharNumber} onChange={(v) => setData({ ...data, aadharNumber: v })} placeholder="12-digit Aadhar number" maxLength={12} />
                <InputGroup label="Father's Name" value={data.fathersName} onChange={(v) => setData({ ...data, fathersName: v })} placeholder="Enter father's name" />

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                    <div className="flex gap-2">
                        {['Male', 'Female', 'Other'].map(g => (
                            <button
                                key={g}
                                onClick={() => setData({ ...data, gender: g })}
                                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${data.gender === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onSave(data)}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Update Personal Info'}
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
            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
        />
    </div>
);
