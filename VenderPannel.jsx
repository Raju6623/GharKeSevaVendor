import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Zap, MapPin, Clock, Bell, User, Loader2, LogOut, 
  CheckCircle2, IndianRupee, ChevronRight, Calendar, 
  LayoutDashboard, History, Menu, X, Check, Shield, ArrowRight, KeyRound,
  Mail, Phone, CreditCard, IdCard, Briefcase, Map, Star, ShoppingBag 
} from 'lucide-react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3001');

const VendorPanel = () => {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [newBookingAlert, setNewBookingAlert] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpModalId, setOtpModalId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);

  const vendorData = JSON.parse(localStorage.getItem('vendorData')) || { id: "VND-1001" };
  const currentVendorId = vendorData.id;
  const BACKEND_URL = "http://localhost:3001";

  const fetchJobs = useCallback(async () => {
    if (!currentVendorId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/vendor/jobs/${currentVendorId}`);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentVendorId]);

  const fetchFullProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/vendor/profile/${currentVendorId}`);
      setProfile(res.data);
    } catch (e) { console.error(e); }
  }, [currentVendorId]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/vendor/history/${currentVendorId}`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
  }, [currentVendorId]);

  useEffect(() => {
    fetchJobs(); fetchFullProfile(); fetchHistory();
    if (isOnDuty && currentVendorId) {
      socket.emit('join_vendor', currentVendorId);
      socket.on('new_booking_alert', (data) => {
        setNewBookingAlert(data);
        fetchJobs(); 
      });
      return () => socket.off('new_booking_alert');
    }
  }, [isOnDuty, currentVendorId, fetchJobs, fetchFullProfile, fetchHistory]);

  const handleBookingAction = async (bookingId, action) => {
    const status = action === 'accept' ? 'In Progress' : 'Cancelled';
    setIsActionLoading(bookingId);
    try {
      await axios.put(`${BACKEND_URL}/api/auth/vendor/update-job/${bookingId}`, { 
        bookingStatus: status, assignedVendorId: currentVendorId 
      });
      setNewBookingAlert(null);
      fetchJobs();
    } catch (e) { alert("Failed"); } finally { setIsActionLoading(null); }
  };

  const handleFinishJob = async () => {
    if (otpValue.length !== 4) return alert("Enter 4-digit OTP");
    setIsActionLoading(otpModalId);
    try {
      const res = await axios.put(`${BACKEND_URL}/api/auth/vendor/update-job/${otpModalId}`, { 
        bookingStatus: 'Completed', otp: otpValue 
      });
      if (res.status === 200) {
        setOtpValue(''); setOtpModalId(null); fetchJobs(); fetchHistory(); fetchFullProfile();
      }
    } catch (e) { alert("Invalid OTP"); } finally { setIsActionLoading(null); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
      <div className={`p-3 rounded-xl ${color || 'bg-white text-slate-400'} shadow-sm`}><Icon size={18} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700 leading-tight truncate">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">V</div>
              <span className="text-xl font-bold tracking-tight">VENDOR<span className="text-blue-500">PRO</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400"><X size={20}/></button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu size={20}/></button>
            <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOnDuty(!isOnDuty)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${isOnDuty ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div> 
              {isOnDuty ? 'On Duty' : 'Offline'}
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full mb-20 lg:mb-0">
          <AnimatePresence mode="wait">
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48}/></div> : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {activeTab === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><IndianRupee size={24}/></div>
                        <div><p className="text-xs text-slate-400 font-bold uppercase">Balance</p><h3 className="text-2xl font-bold">₹{profile?.walletBalance || 0}</h3></div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={24}/></div>
                        <div><p className="text-xs text-slate-400 font-bold uppercase">Completed</p><h3 className="text-2xl font-bold">{history.length}</h3></div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><ShoppingBag size={24}/></div>
                        <div><p className="text-xs text-slate-400 font-bold uppercase">Total Jobs</p><h3 className="text-2xl font-bold">{jobs.length + history.length}</h3></div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2">Active Task Queue</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                          <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase">
                            <tr><th className="px-6 py-4">Service</th><th className="px-6 py-4">Location</th><th className="px-6 py-4 text-right">Action</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {jobs.filter(j => j.bookingStatus !== 'Completed').map((job) => (
                              <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5">
                                  <p className="font-bold text-slate-900 text-sm">{job.packageName}</p>
                                  <span className="text-[9px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold uppercase">{job.bookingStatus}</span>
                                </td>
                                <td className="px-6 py-5">
                                  <p className="text-xs font-medium text-slate-600 line-clamp-1">{job.serviceAddress}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{job.bookingDate} | {job.bookingTime}</p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <button onClick={() => setOtpModalId(job.customBookingId)} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-600 transition-all shadow-sm">
                                    <KeyRound size={14}/> Verify OTP
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'history' && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100"><h3 className="font-bold text-sm uppercase">Service History</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase">
                          <tr><th className="px-6 py-4">Service</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Payment</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {history.map(item => (
                            <tr key={item._id}>
                              <td className="px-6 py-4 font-bold text-sm">{item.packageName}</td>
                              <td className="px-6 py-4 text-xs text-slate-500 uppercase">{item.bookingDate}</td>
                              <td className="px-6 py-4 text-right font-black text-emerald-600">₹{item.totalPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Top Hero Section */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 bg-white/10 rounded-3xl border-4 border-white/10 flex items-center justify-center overflow-hidden">
                          {profile?.vendorPhoto ? <img src={profile.vendorPhoto} className="w-full h-full object-cover" /> : <User size={50} className="text-white/20"/>}
                        </div>
                        <div className="text-center md:text-left">
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{profile?.firstName} {profile?.lastName}</h2>
                          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-blue-500 text-[10px] font-black uppercase rounded-lg">Verified Pro</span>
                            <span className="text-blue-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Shield size={14}/> ID: {profile?.customUserId}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Professional Details */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-black uppercase tracking-tight mb-8 border-l-4 border-blue-600 pl-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={Mail} label="Email Address" value={profile?.userEmail} color="bg-blue-50 text-blue-600" />
                        <InfoRow icon={Phone} label="Phone Number" value={profile?.userPhone} color="bg-emerald-50 text-emerald-600" />
                        <InfoRow icon={Briefcase} label="Professional Category" value={profile?.vendorCategory} color="bg-indigo-50 text-indigo-600" />
                        <InfoRow icon={Star} label="Total Experience" value={profile?.experience ? `${profile.experience} Years` : 'N/A'} color="bg-yellow-50 text-yellow-600" />
                        <InfoRow icon={MapPin} label="Service City" value={profile?.vendorCity} color="bg-orange-50 text-orange-600" />
                        <InfoRow icon={Map} label="Service Address" value={profile?.vendorAddress} color="bg-slate-100 text-slate-600" />
                      </div>
                    </div>

                    {/* Registration & Banking Details */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-black uppercase tracking-tight mb-8 border-l-4 border-emerald-500 pl-4">KYC & Banking Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow icon={IdCard} label="Aadhar Card Number" value={profile?.aadharNumber} color="bg-red-50 text-red-600" />
                        <InfoRow icon={CreditCard} label="Bank Account Number" value={profile?.accountNumber} color="bg-cyan-50 text-cyan-600" />
                        <InfoRow icon={Shield} label="IFSC Code" value={profile?.ifscCode} color="bg-purple-50 text-purple-600" />
                        <InfoRow icon={Briefcase} label="Bank Name" value={profile?.bankName} color="bg-pink-50 text-pink-600" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals & Popups */}
      <AnimatePresence>
        {otpModalId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Shield size={32}/></div>
              <h3 className="text-2xl font-black italic mb-2 uppercase tracking-tighter">Enter OTP</h3>
              <input type="text" maxLength={4} className="w-full py-5 bg-slate-50 rounded-2xl text-center font-black text-2xl outline-none focus:border-blue-600 mb-6 tracking-[0.5em]" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setOtpModalId(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleFinishJob} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Verify & Finish</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newBookingAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl border-4 border-blue-600/10">
              <div className="bg-slate-900 p-8 text-center text-white">
                <Bell size={48} className="mx-auto mb-4 text-blue-500 animate-bounce"/>
                <h2 className="text-2xl font-black italic uppercase">New Job!</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="font-black text-slate-900 leading-tight">{newBookingAlert.bookingDetails.packageName}</p>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-2 font-bold uppercase"><MapPin size={12}/> {newBookingAlert.bookingDetails.serviceAddress}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setNewBookingAlert(null)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase">Ignore</button>
                  <button onClick={() => handleBookingAction(newBookingAlert.bookingDetails.customBookingId, 'accept')} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Accept Task</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-50 h-20 shadow-2xl">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
            <item.icon size={22} fill={activeTab === item.id ? "currentColor" : "none"} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default VendorPanel;