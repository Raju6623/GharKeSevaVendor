import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Still needed for one-off location post if not in thunk
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, History, IndianRupee, User, Loader2, Tag } from 'lucide-react'; // Added Tag for My Offers
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
import VendorCoupons from './VendorCoupons'; // Import for Tab usage if needed


// Modals
import OtpModal from './modals/OtpModal';
import ChatModal from './modals/ChatModal';
import NewBookingAlert from './modals/NewBookingAlert';
import ReviewsModal from '../components/ReviewsModal';

// Redux Actions
import {
  fetchJobs,
  fetchFullProfile,
  fetchHistory,
  updateJobStatus,
  verifyOtpAndFinish,
  sendChatMessage,
  markAsRead
} from '../redux/thunks/vendorThunk';
import { addChatMessage, addNewBooking } from '../redux/slices/vendorSlice';

const socket = io('http://localhost:3001');
const BACKEND_URL = 'http://localhost:3001';

function VendorPanel() {
  const dispatch = useDispatch();

  // --- Redux State ---
  const { profile, jobs, history, loading, isActionLoading } = useSelector(state => state.vendor);

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

      return () => {
        socket.off('new_booking_alert');
        socket.off('connect', joinRooms);
      };
    }
  }, [isOnDuty, currentVendorId, profile, vendorPos, dispatch]);

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

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Stats', icon: IndianRupee },
    { id: 'history', label: 'History', icon: History },
    { id: 'offers', label: 'My Offers', icon: Tag }, // New Link
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        profile={profile} navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <Header activeTab={activeTab} isOnDuty={isOnDuty} setIsOnDuty={setIsOnDuty} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full mb-20 lg:mb-0">
          <AnimatePresence mode="wait">
            {loading ? <div className="flex justify-center py-32"><Loader2 className="animate-spin text-indigo-600" size={40} /></div> : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'home' && <HomeTab {...{ profile, jobs, showAllJobs, setShowAllJobs, onChat: openChat, onAccept: (id) => handleBookingAction(id, 'accept'), onComplete: setOtpModalId, isActionLoading }} />}
                {activeTab === 'dashboard' && <StatsTab {...{ profile, history, jobs }} />}
                {activeTab === 'history' && <HistoryTab history={history} />}
                {activeTab === 'offers' && <VendorCoupons />} {/* New Tab Render */}
                {activeTab === 'profile' && <ProfileTab profile={profile} setIsReviewsModalOpen={setIsReviewsModalOpen} />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileNav navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} />

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
    </div>
  );
};

export default VendorPanel;