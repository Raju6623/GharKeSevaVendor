import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    profile: null,
    jobs: [],
    history: [],
    loading: false,
    error: null,
    isActionLoading: null,
    vendorCoupons: [],
    incentives: [],
};

const vendorSlice = createSlice({
    name: 'vendor',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setActionLoading: (state, action) => {
            state.isActionLoading = action.payload;
        },
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        setJobs: (state, action) => {
            state.jobs = action.payload;
        },
        setHistory: (state, action) => {
            state.history = action.payload;
        },
        markChatAsRead: (state, action) => {
            const bookingId = action.payload;
            state.jobs = state.jobs.map(j =>
                j.customBookingId === bookingId ? { ...j, unreadCount: 0 } : j
            );
        },
        addChatMessage: (state, action) => {
            const { bookingId, message } = action.payload;
            state.jobs = state.jobs.map(j => {
                if (j.customBookingId === bookingId) {
                    const chatMessages = j.chatMessages || [];
                    if (chatMessages.some(m => m.timestamp === message.timestamp)) return j;
                    return { ...j, chatMessages: [...chatMessages, message] };
                }
                return j;
            });
        },
        addNewBooking: (state, action) => {
            const newJob = action.payload;
            // Prevent duplicates
            if (state.jobs.some(j => j.customBookingId === newJob.customBookingId)) return;
            state.jobs = [newJob, ...state.jobs];
        },
        setVendorCoupons: (state, action) => {
            state.vendorCoupons = action.payload;
        },
        setIncentives: (state, action) => {
            state.incentives = action.payload;
        },
    },
});

export const {
    setLoading,
    setActionLoading,
    setProfile,
    setJobs,
    setHistory,
    markChatAsRead,
    addChatMessage,
    addNewBooking,
    setVendorCoupons,
    setIncentives
} = vendorSlice.actions;

export default vendorSlice.reducer;
