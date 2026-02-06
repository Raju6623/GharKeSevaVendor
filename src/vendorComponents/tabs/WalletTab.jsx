import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Plus,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Building2,
    CreditCard,
    Info,
    ArrowLeft,
    Send,
    Search
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, fetchWithdrawals, requestWithdrawal } from '../../redux/thunks/vendorThunk';
import Swal from 'sweetalert2';

const WalletTab = ({ profile, onBack }) => {
    const dispatch = useDispatch();
    const { transactions, withdrawals, isActionLoading, language } = useSelector(state => state.vendor);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState('BANK');
    const [upiId, setUpiId] = useState(profile?.upiId || '');

    // Editable Bank Details
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountHolder: profile?.accountHolderName || `${profile?.firstName} ${profile?.lastName}`,
        accountNumber: profile?.accountNumber || '',
        ifscCode: profile?.ifscCode || '',
        bankName: profile?.bankName || ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.bookingId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    const typeOptions = [
        { label: 'ALL', value: 'ALL' },
        { label: 'EARNINGS', value: 'EARNING' },
        { label: 'PAYOUTS', value: 'WITHDRAWAL' },
        { label: 'BONUS', value: 'BONUS' }
    ];

    useEffect(() => {
        if (profile) {
            setBankDetails({
                accountHolder: profile?.accountHolderName || `${profile?.firstName} ${profile?.lastName}`,
                accountNumber: profile?.accountNumber || '',
                ifscCode: profile?.ifscCode || '',
                bankName: profile?.bankName || ''
            });
            setUpiId(profile?.upiId || '');
        }
    }, [profile]);

    useEffect(() => {
        if (profile?.customUserId) {
            dispatch(fetchTransactions(profile.customUserId));
            dispatch(fetchWithdrawals(profile.customUserId));
        }
    }, [dispatch, profile]);

    const handleWithdrawalRequest = async (e) => {
        e.preventDefault();
        const withdrawalAmount = Number(amount);

        if (!withdrawalAmount || withdrawalAmount < 200) {
            return Swal.fire('Error', 'Minimum withdrawal amount is ₹200', 'error');
        }

        if (withdrawalAmount > profile?.walletBalance) {
            return Swal.fire('Error', 'Insufficient wallet balance', 'error');
        }

        const details = {
            vendorId: profile.customUserId,
            amount: withdrawalAmount,
            withdrawalMethod
        };

        if (withdrawalMethod === 'BANK') {
            if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
                return Swal.fire('Error', 'Please fill all bank details', 'error');
            }
            details.bankDetails = bankDetails;
        } else { // UPI
            if (!upiId || !upiId.includes('@')) {
                return Swal.fire('Error', 'Please enter a valid UPI ID', 'error');
            }
            details.upiId = upiId;
        }

        const result = await dispatch(requestWithdrawal(profile.customUserId, withdrawalAmount, details));
        if (result.success) {
            Swal.fire('Success', 'Withdrawal request submitted successfully!', 'success');
            setIsWithdrawModalOpen(false);
            setAmount('');
        } else {
            Swal.fire('Error', result.message || 'Submission failed', 'error');
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32">
            {/* Header */}
            <header className="flex items-center justify-between mb-10 px-2 lg:px-0">
                <div className="flex items-center gap-5">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">My Wallet</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Earnings & Payouts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Live Updates</span>
                </div>
            </header>

            {/* Wallet Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Wallet size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Account Balance</p>
                                <p className="text-4xl font-black tracking-tighter tabular-nums mt-1">₹{profile?.walletBalance || '0'}<span className="text-lg opacity-40">.00</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Earned</p>
                                <p className="text-2xl font-black tracking-tight">₹{transactions.filter(t => t.type === 'EARNING').reduce((sum, t) => sum + t.amount, 0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Withdrawn</p>
                                <p className="text-2xl font-black tracking-tight">₹{withdrawals.filter(w => w.status === 'PAID').reduce((sum, w) => sum + w.amount, 0)}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="w-full py-5 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <ArrowUpRight size={18} />
                            Transfer Money to Bank
                        </button>
                    </div>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                <Plus size={20} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recent Bonus</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tight">₹0</p>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-500 mt-4 leading-relaxed">Referral bonuses show up here automatically.</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                                <Clock size={20} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Payouts</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tight">
                                ₹{withdrawals.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + w.amount, 0)}
                            </p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed italic">Processing usually takes 24-48 hours.</p>
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                            <History size={18} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Recent Transactions</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
                            {typeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilterType(opt.value)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                                        ${filterType === opt.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item, idx) => (
                            <div key={item._id || idx} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'EARNING' || item.type === 'BONUS' ? 'bg-emerald-50 text-emerald-600' :
                                        item.type === 'WITHDRAWAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        {item.type === 'EARNING' || item.type === 'BONUS' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-2">{item.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {item.bookingId && (
                                                <span className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded uppercase leading-none">Job: {item.bookingId}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black tracking-tighter ${item.type === 'EARNING' || item.type === 'BONUS' ? 'text-emerald-600' :
                                        item.type === 'WITHDRAWAL' ? 'text-indigo-600' : 'text-rose-600'
                                        }`}>
                                        {item.type === 'EARNING' || item.type === 'BONUS' ? '+' : '-'}₹{item.amount}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                                        {item.status || 'Completed'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                            <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                                <Info size={32} />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest">No Transactions Yet</p>
                            <p className="text-xs font-medium mt-1">Wait for your first job completion</p>
                        </div>
                    )}
                </div>

                {/* Withdrawal Requests Sub-section */}
                {withdrawals.length > 0 && (
                    <div className="p-8 border-t border-slate-100 bg-slate-50/30">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Withdrawal Requests Status</h4>
                        <div className="space-y-4">
                            {withdrawals.map((w, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${w.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                            w.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {w.status === 'PAID' ? <CheckCircle2 size={16} /> : w.status === 'REJECTED' ? <AlertCircle size={16} /> : <Clock size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-800 tracking-tight">Transfer of ₹{w.amount}</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(w.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${w.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                        w.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {w.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Withdrawal Modal */}
            <AnimatePresence>
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Transfer to Bank</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Available: ₹{profile?.walletBalance}</p>
                                </div>
                                <button onClick={() => setIsWithdrawModalOpen(false)} className="p-2 text-slate-400">
                                    <Plus className="rotate-45" size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleWithdrawalRequest} className="p-8">
                                <div className="mb-8">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Enter Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Min. 200"
                                            className="w-full pl-12 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-indigo-600 focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-200"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-bold italic">
                                        Choose your preferred payout method.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawalMethod('BANK')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${withdrawalMethod === 'BANK' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        <Building2 size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Bank Transfer</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawalMethod('UPI')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${withdrawalMethod === 'UPI' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        <Send size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">UPI ID</span>
                                    </button>
                                </div>

                                <div className="space-y-4 mb-4">
                                    {withdrawalMethod === 'BANK' ? (
                                        !isEditingBank ? (
                                            <div className="group relative">
                                                <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div className="min-w-0 pr-12">
                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Primary Bank Account</p>
                                                        <p className="text-sm font-black text-slate-700 truncate">{bankDetails.accountNumber ? `*${String(bankDetails.accountNumber).slice(-4)}` : 'Bank Not Linked'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{bankDetails.bankName || 'Details missing'}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditingBank(true)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Modify Bank Details</h4>
                                                    <button type="button" onClick={() => setIsEditingBank(false)} className="text-[10px] font-black text-indigo-600 uppercase">Back to Default</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Account Holder Name"
                                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-indigo-600 outline-none"
                                                            value={bankDetails.accountHolder}
                                                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Account Number"
                                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-indigo-600 outline-none"
                                                            value={bankDetails.accountNumber}
                                                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <input
                                                            type="text"
                                                            placeholder="IFSC Code"
                                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-indigo-600 outline-none uppercase"
                                                            value={bankDetails.ifscCode}
                                                            onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <input
                                                            type="text"
                                                            placeholder="Bank Name"
                                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-indigo-600 outline-none"
                                                            value={bankDetails.bankName}
                                                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1">Enter UPI ID</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Send size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value)}
                                                    placeholder="example@okaxis"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm text-slate-700 focus:border-indigo-600 focus:outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                            {profile?.upiId && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1"><History size={10} /> Saved: {profile.upiId}</p>}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!amount || Number(amount) < 200 || Number(amount) > profile?.walletBalance || isActionLoading === 'withdrawal'}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isActionLoading === 'withdrawal' ? <Clock size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                                    Submit Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletTab;
