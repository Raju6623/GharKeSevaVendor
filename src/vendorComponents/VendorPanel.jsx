import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Still needed for one-off location post if not in thunk
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, History, IndianRupee, Wallet, User, Loader2, Tag, HelpCircle, Share2, ShoppingBag, Users, Briefcase, X, CheckCircle2, CreditCard, MessageSquare, Languages, Headset, FileText, ShieldCheck, Scale, Star, Download, Sparkles, Heart, Camera } from 'lucide-react'; // Added Tag for My Offers
import { useDispatch, useSelector } from 'react-redux';

// Layout & Navigation
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileNav from './layout/MobileNav';

// Tab Contents
import HomeTab from './tabs/HomeTab';
import StatsTab from './tabs/StatsTab';
import HistoryTab from './tabs/HistoryTab';
import ProfileTab from './tabs/ProfileTab';
import HelpCenterTab from './tabs/HelpCenterTab';
import FinancialDetailsTab from './tabs/FinancialDetailsTab';
import MyTeamTab from './tabs/MyTeamTab';
import MyHubTab from './tabs/MyHubTab';
import GSParivaarTab from './tabs/GSParivaarTab';
import VendorCoupons from './VendorCoupons';
import WalletTab from './tabs/WalletTab';
import { WhatsAppModal, LanguageModal } from './modals/UtilityModals';
import translations from '../utils/translations';
import { setLanguage } from '../redux/slices/vendorSlice';


// Modals
import OtpModal from './modals/OtpModal';
import ChatModal from './modals/ChatModal';
import NewBookingAlert from './modals/NewBookingAlert';
import FirstLoginModal from './modals/FirstLoginModal';
import ReviewsModal from '../components/ReviewsModal';

// Redux Actions
import {
  fetchJobs,
  fetchFullProfile,
  fetchHistory,
  updateJobStatus,
  verifyOtpAndFinish,
  sendChatMessage,
  markAsRead,
  updateVendorProfile
} from '../redux/thunks/vendorThunk';
import { addChatMessage, addNewBooking } from '../redux/slices/vendorSlice';

import { BASE_URL } from '../config';

const socket = io(BASE_URL);
const BACKEND_URL = BASE_URL;

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

function VendorPanel() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { profile, jobs, history, loading, isActionLoading, language } = useSelector(state => state.vendor);
  const t = translations[language] || translations.English;

  // --- Local UI State ---
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vendorPos, setVendorPos] = useState(null);

  // --- Modal & Interactive State ---
  const [newBookingAlert, setNewBookingAlert] = useState(null);
  const [otpModalId, setOtpModalId] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [chatModalId, setChatModalId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const vendorData = JSON.parse(localStorage.getItem('vendorData')) || { id: "VND-1001" };
  const currentVendorId = vendorData.id;

  // --- Data Fetching ---
  const handleFetchData = useCallback(() => {
    if (currentVendorId) {
      dispatch(fetchJobs(currentVendorId, vendorPos));
      dispatch(fetchFullProfile(currentVendorId));
      dispatch(fetchHistory(currentVendorId));
    }
  }, [currentVendorId, vendorPos, dispatch]);

  // Initial Sync
  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  // Scroll to top on tab change
  useEffect(() => {
    // Scroll behavior removed for smoother navigation
  }, [activeTab]);

  // Location Sync
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setVendorPos(newPos);
        if (currentVendorId) {
          axios.post(`${BACKEND_URL}/api/auth/update-location`, { userId: currentVendorId, ...newPos }).catch(console.error);
        }
      });
    }
  }, [currentVendorId]);

  // Socket: Status Sync
  useEffect(() => {
    if (currentVendorId) {
      socket.emit('toggle_online_status', { id: currentVendorId, status: isOnDuty });
    }
  }, [isOnDuty, currentVendorId]);

  // Socket: Booking Notifications
  useEffect(() => {
    if (isOnDuty && currentVendorId) {
      const joinRooms = () => {
        const vendorCats = (profile?.vendorCategories && profile.vendorCategories.length > 0)
          ? [...profile.vendorCategories]
          : [profile?.vendorCategory].filter(Boolean);

        // Ensure primaryCategory (e.g., 'AC') is also joined for broad-matching alerts
        if (profile?.primaryCategory && !vendorCats.includes(profile.primaryCategory)) {
          vendorCats.push(profile.primaryCategory);
        }

        socket.emit('join_vendor', { id: currentVendorId, category: vendorCats });
      };
      joinRooms();
      socket.on('connect', joinRooms);
      socket.on('new_booking_alert', (data) => {
        console.log("🔔 Real-time Booking Received:", data);
        setNewBookingAlert(data);
        if (data.bookingDetails) {
          dispatch(addNewBooking(data.bookingDetails));
        }
        dispatch(fetchJobs(currentVendorId, vendorPos, true));
      });
      socket.on('job_status_update', (data) => {
        console.log("🔄 Job Status Update Received:", data);
        // Assuming updateJobStatusInList is an action creator that updates the jobs list
        // This action creator is not defined in the provided snippet, but it's implied.
        // For now, we'll just refetch jobs to ensure consistency.
        dispatch(fetchJobs(currentVendorId, vendorPos, true));
      });

      socket.on('wallet_update', (data) => {
        if (data.vendorId === currentVendorId) {
          console.log("💰 Wallet Refresh Signal Received");
          dispatch(fetchFullProfile(currentVendorId));
        }
      });

      return () => {
        socket.off('new_booking_alert');
        socket.off('job_status_update');
        socket.off('wallet_update');
        socket.off('connect', joinRooms);
      };
    }
  }, [isOnDuty, currentVendorId, profile, vendorPos, dispatch]);

  const handleSaveCategories = async (newCats) => {
    if (newCats.length === 0) return;
    const res = await dispatch(updateVendorProfile(currentVendorId, {
      vendorCategories: newCats,
      vendorCategory: newCats[0]
    }));
    if (res.success) {
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Your service categories have been updated successfully.', timer: 2000, showConfirmButton: false });
      setIsCatModalOpen(false);
    } else {
      Swal.fire({ icon: 'error', title: 'Failed', text: res.message });
    }
  };

  useEffect(() => {
    if (profile && profile.firstLoginCompleted === false) {
      setShowFirstLoginModal(true);
    }
  }, [profile]);

  const handleFirstLoginContinue = async (hours) => {
    await dispatch(updateVendorProfile(currentVendorId, { firstLoginCompleted: true }));
    setShowFirstLoginModal(false);
  };

  // Socket: Chat Logic
  useEffect(() => {
    if (chatModalId) {
      socket.emit('join_room', chatModalId);
      const handleMsg = (data) => {
        dispatch(addChatMessage({ bookingId: chatModalId, message: data }));
        setChatMessages(prev => prev.some(m => m.timestamp === data.timestamp) ? prev : [...prev, data]);
      };
      socket.on('receive_message', handleMsg);
      return () => { socket.off('receive_message', handleMsg); };
    }
  }, [chatModalId, dispatch]);

  // --- Actions ---
  const handleBookingAction = async (bookingId, action) => {
    await dispatch(updateJobStatus(bookingId, currentVendorId, action));
    setNewBookingAlert(null);
  };

  const handleFinishJob = async () => {
    if (otpValue.length !== 4) return alert("Enter 4-digit OTP");
    const success = await dispatch(verifyOtpAndFinish(otpModalId, currentVendorId, otpValue));
    if (success) {
      setOtpValue('');
      setOtpModalId(null);
    }
  };

  const handleSendChat = async () => {
    if (!newMessage.trim()) return;
    const msgData = { sender: 'Vendor', message: newMessage, timestamp: new Date() };
    setNewMessage("");
    dispatch(sendChatMessage(chatModalId, msgData));
  };

  const openChat = async (booking) => {
    setChatModalId(booking.customBookingId);
    if ((booking.unreadCount || 0) > 0) {
      dispatch(markAsRead(booking.customBookingId));
    }
    setChatMessages(booking.chatMessages || []);
  };

  const mainNavItems = [
    { id: 'home', label: t.home, icon: LayoutDashboard },
    { id: 'history', label: t.history, icon: History },
    { id: 'wallet', label: t.wallet, icon: Wallet },
    { id: 'hub', label: t.hub, icon: Briefcase },
    { id: 'parivaar', label: t.parivaar, icon: Sparkles },
    { id: 'offers', label: t.offers, icon: Tag },
    { id: 'financial', label: t.financialDetails, subLabel: t.financialSub, icon: CreditCard },
    { id: 'whatsapp', label: t.whatsappUpdates, subLabel: (String(profile?.whatsappUpdates).toLowerCase() === 'off' || profile?.whatsappUpdates === false) ? t.whatsappOff : t.whatsappOn, icon: MessageSquare },
    { id: 'language', label: t.changeLanguage, subLabel: language, icon: Languages },
    { id: 'help', label: t.helpCenter, icon: HelpCircle },
    { id: 'invite', label: t.inviteFriend, icon: Share2 },
    { id: 'shop', label: t.shop, icon: ShoppingBag },
  ];

  const footerNavItems = [
    { id: 'contact', label: t.contactUs },
    { id: 'terms', label: t.terms },
    { id: 'privacy', label: t.privacy },
    { id: 'welfare', label: t.welfare },
    { id: 'rate', label: t.rateUs },
    { id: 'download', label: t.downloadApp },
  ];

  const handleInvite = () => {
    const refCode = profile?.referralCode || profile?.customUserId || "GS-PARTNER";
    const shareUrl = `${window.location.origin}/register?ref=${refCode}`;
    const shareText = `Join me as a service partner on GharKeSeva! Use my referral code: ${refCode}`;

    if (navigator.share) {
      navigator.share({ title: 'GharKeSeva Partner', text: shareText, url: shareUrl });
    } else {
      Swal.fire({
        title: t.referAndEarn,
        html: `<div class="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p class="text-xs font-bold text-slate-400 uppercase mb-2">${t.referralCode}</p>
                  <p class="text-2xl font-black text-indigo-600 tracking-widest">${refCode}</p>
                 </div>
                 <p class="mt-4 text-sm text-slate-500">${t.shareReferral}</p>`,
        confirmButtonText: t.copyLink,
        showCancelButton: true,
        cancelButtonText: t.close
      }).then((result) => {
        if (result.isConfirmed) {
          navigator.clipboard.writeText(shareUrl);
          Swal.fire(t.copyLink, t.referralCopied, 'success');
        }
      });
    }
  };

  const mobileNavItems = [
    { id: 'parivaar', label: t.parivaar, icon: Sparkles },
    { id: 'wallet', label: t.wallet, icon: Wallet },
    { id: 'home', label: t.home, icon: LayoutDashboard },
    { id: 'offers', label: t.offers, icon: Tag },
    { id: 'history', label: t.history, icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        profile={profile} navItems={mainNavItems} footerItems={footerNavItems} activeTab={activeTab} setActiveTab={(tab) => {
          if (tab === 'invite') handleInvite();
          else if (tab === 'whatsapp') setIsWhatsAppModalOpen(true);
          else if (tab === 'language') setIsLanguageModalOpen(true);
          else if (tab === 'rate') window.open('https://play.google.com/store/apps/details?id=com.gharkeseva.vendor', '_blank');
          else if (tab === 'download') window.open('https://play.google.com/store/apps/details?id=com.gharkeseva.customer', '_blank');
          else if (['contact', 'terms', 'privacy', 'welfare', 'shop'].includes(tab)) {
            Swal.fire({ title: t.comingSoon, text: t.underDevelopment, icon: 'info' });
          }
          else setActiveTab(tab);
        }}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        jobs={jobs}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <Header
          activeTab={activeTab}
          isOnDuty={isOnDuty}
          setIsOnDuty={setIsOnDuty}
          setIsSidebarOpen={setIsSidebarOpen}
          jobs={jobs}
          history={history}
          onSelectResult={(item) => {
            if (jobs.some(j => j.customBookingId === item.customBookingId)) {
              setActiveTab('home');
            } else {
              setActiveTab('history');
            }
          }}
        />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full mb-20 lg:mb-0">
          <AnimatePresence mode="wait">
            {loading ? <div className="flex justify-center py-32"><Loader2 className="animate-spin text-indigo-600" size={40} /></div> : (
              <motion.div key={`tab-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'home' && <HomeTab {...{ profile, jobs, showAllJobs, setShowAllJobs, onChat: openChat, onAccept: (id) => handleBookingAction(id, 'accept'), onReject: (id) => handleBookingAction(id, 'reject'), onComplete: setOtpModalId, isActionLoading, t }} />}
                {activeTab === 'wallet' && <WalletTab profile={profile} onBack={() => setActiveTab('home')} t={t} />}
                {activeTab === 'dashboard' && <StatsTab {...{ profile, history, jobs, t }} />}
                {activeTab === 'history' && <HistoryTab history={history} t={t} />}
                {activeTab === 'offers' && <VendorCoupons t={t} />} {/* New Tab Render */}
                {activeTab === 'profile' && <ProfileTab profile={profile} setIsReviewsModalOpen={setIsReviewsModalOpen} setActiveTab={setActiveTab} setIsCatModalOpen={setIsCatModalOpen} t={t} />}
                {activeTab === 'help' && <HelpCenterTab profile={profile} t={t} />}
                {activeTab === 'financial' && <FinancialDetailsTab profile={profile} onBack={() => setActiveTab('home')} onGoToWallet={() => setActiveTab('wallet')} t={t} />}
                {activeTab === 'team' && <MyTeamTab onBack={() => setActiveTab('home')} t={t} />}
                {activeTab === 'hub' && <MyHubTab profile={profile} onBack={() => setActiveTab('home')} t={t} />}
                {activeTab === 'parivaar' && <GSParivaarTab profile={profile} t={t} />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileNav navItems={mobileNavItems} activeTab={activeTab} setActiveTab={setActiveTab} jobs={jobs} />

      {/* Modals */}
      <OtpModal isOpen={!!otpModalId} otpValue={otpValue} setOtpValue={setOtpValue} onVerify={handleFinishJob} onClose={() => setOtpModalId(null)} isActionLoading={isActionLoading === otpModalId} />
      <ChatModal isOpen={!!chatModalId} chatMessages={chatMessages} newMessage={newMessage} setNewMessage={setNewMessage} onSend={handleSendChat} onClose={() => setChatModalId(null)} />
      <NewBookingAlert alert={newBookingAlert} onAccept={(id) => handleBookingAction(id, 'accept')} onDecline={() => setNewBookingAlert(null)} />

      {isReviewsModalOpen && (
        <ReviewsModal
          isOpen={isReviewsModalOpen} onClose={() => setIsReviewsModalOpen(false)}
          category={profile?.vendorCategory || profile?.vendorCategories?.[0] || 'General'} vendorId={profile?.customUserId}
        />
      )}
      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} currentStatus={profile?.whatsappUpdates} onUpdate={async (data) => {
        await dispatch(updateVendorProfile(profile.customUserId, data));
        setIsWhatsAppModalOpen(false);
      }} isLoading={isActionLoading === 'profile-update'} />
      <LanguageModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} currentLang={language} onUpdate={async (data) => {
        const newLang = data.language;
        console.log('Updating language to:', newLang);

        // Update Redux state immediately for instant UI change
        dispatch(setLanguage(newLang));
        setIsLanguageModalOpen(false);

        // Try to save to backend in background (don't block UI if it fails)
        try {
          await dispatch(updateVendorProfile(profile.customUserId, data));
          console.log('Language saved to backend successfully');
        } catch (error) {
          console.error('Failed to save language to backend:', error);
          // Language is already changed in UI, so we don't show error
        }
      }} isLoading={isActionLoading === 'profile-update'} />
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onContinue={handleFirstLoginContinue}
        profile={profile}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        currentCategories={profile?.vendorCategories || (profile?.vendorCategory ? [profile.vendorCategory] : [])}
        onSave={handleSaveCategories}
        isUpdating={isActionLoading === 'profile-update'}
      />
    </div>
  );
};

export default VendorPanel;