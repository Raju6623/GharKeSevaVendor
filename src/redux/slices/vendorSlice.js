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
    teamMembers: [],
    language: 'English',
    communityPosts: [],
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
        updateJobStatusInList: (state, action) => {
            const { bookingId, status, assignedVendorId, bookingDetails, currentVendorId } = action.payload;
            const existingJobIndex = state.jobs.findIndex(j => j.customBookingId === bookingId);

            // 1. If job is accepted by someone else, remove it from list
            if (status === 'In Progress' && assignedVendorId && assignedVendorId !== currentVendorId) {
                state.jobs = state.jobs.filter(j => j.customBookingId !== bookingId);
                return;
            }

            if (existingJobIndex !== -1) {
                // Update existing job
                state.jobs[existingJobIndex] = {
                    ...state.jobs[existingJobIndex],
                    bookingStatus: status,
                    assignedVendorId: assignedVendorId,
                    ...bookingDetails
                };
            } else if (status === 'Pending' && !assignedVendorId) {
                // If it's a new pending job being released, add it
                state.jobs = [bookingDetails, ...state.jobs];
            }
        },
        removeJob: (state, action) => {
            const bookingId = action.payload;
            state.jobs = state.jobs.filter(j => j.customBookingId !== bookingId);
        },
        setVendorCoupons: (state, action) => {
            state.vendorCoupons = action.payload;
        },
        setIncentives: (state, action) => {
            state.incentives = action.payload;
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        updateProfile: (state, action) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
        },
        setTeamMembers: (state, action) => {
            state.teamMembers = action.payload;
        },
        setCommunityPosts: (state, action) => {
            state.communityPosts = action.payload;
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
    updateJobStatusInList,
    removeJob,
    setVendorCoupons,
    setIncentives,
    setLanguage,
    updateProfile,
    setTeamMembers,
    setCommunityPosts
} = vendorSlice.actions;

export default vendorSlice.reducer;
