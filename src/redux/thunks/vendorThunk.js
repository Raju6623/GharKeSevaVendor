import api from '../../api/axiosConfig';
import {
    setLoading,
    setActionLoading,
    setProfile,
    setJobs,
    setHistory,
    markChatAsRead,
    setVendorCoupons,
    setIncentives,
    updateProfile,
    setCommunityPosts,
    setTransactions,
    setWithdrawals,
    setSuggestions,
    setChatList,
    setFriendsList
} from '../slices/vendorSlice';

export const fetchTransactions = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/wallet/transactions/${vendorId}`);
        dispatch(setTransactions(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch Transactions Error:", e); }
};

export const fetchWithdrawals = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/wallet/withdrawals/${vendorId}`);
        dispatch(setWithdrawals(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch Withdrawals Error:", e); }
};

export const requestWithdrawal = (vendorId, amount, bankDetails) => async (dispatch) => {
    dispatch(setActionLoading('withdrawal'));
    try {
        const res = await api.post(`/wallet/withdraw`, { vendorId, amount, bankDetails });
        dispatch(fetchWithdrawals(vendorId));
        dispatch(fetchFullProfile(vendorId)); // Refresh wallet balance
        return { success: true, data: res.data };
    } catch (e) {
        console.error("Withdrawal Request Error:", e);
        return { success: false, message: e.response?.data?.error || "Failed to request withdrawal" };
    } finally {
        dispatch(setActionLoading(null));
    }
};

export const fetchCommunityPosts = () => async (dispatch) => {
    try {
        const res = await api.get('/community/posts');
        dispatch(setCommunityPosts(Array.isArray(res.data) ? res.data : (res.data.success && Array.isArray(res.data.data) ? res.data.data : [])));
        // Handling the case where response might be {success: true, ...posts} or just array
        if (res.data && res.data.success && !Array.isArray(res.data)) {
            // Re-fetch logic if needed or just use res.data directly if it has the posts
            // Based on my controller, sendResponse sends {success: true, ...data} 
            // if data is NOT an array. If it IS an array, it sends the array.
            // My fetchCommunityPosts returns CommunityPost.find()... which is an array.
            // So res.data SHOULD be an array.
        }
    } catch (e) {
        console.error("Fetch Community Posts Error:", e);
        dispatch(setCommunityPosts([]));
    }
};

export const createCommunityPost = (postData, isJson = false) => async (dispatch) => {
    try {
        const config = isJson
            ? { headers: { 'Content-Type': 'application/json' } }
            : { headers: { 'Content-Type': 'multipart/form-data' } };

        await api.post('/community/posts/add', postData, config);
        dispatch(fetchCommunityPosts());
        return { success: true };
    } catch (e) {
        console.error("Create Post Error:", e);
        const errorMsg = e.response?.data?.error || e.response?.data?.message || "Failed to create post";
        return { success: false, message: errorMsg };
    }
};

export const likePost = (postId, userId) => async (dispatch) => {
    try {
        await api.post(`/community/posts/like/${postId}`, { userId });
        // Optionally update local state for faster response
    } catch (e) { console.error("Like Error:", e); }
};

export const clapPost = (postId) => async (dispatch) => {
    try {
        await api.post(`/community/posts/clap/${postId}`);
    } catch (e) { console.error("Clap Error:", e); }
};

export const addPostComment = (postId, commentData) => async (dispatch) => {
    try {
        await api.post(`/community/posts/comment/${postId}`, commentData);
        dispatch(fetchCommunityPosts());
        return { success: true };
    } catch (e) {
        console.error("Comment Error:", e);
        return { success: false };
    }
};

export const deletePost = (postId, authorId) => async (dispatch) => {
    try {
        await api.delete(`/community/posts/${postId}?authorId=${authorId}`);
        dispatch(fetchCommunityPosts());
        return { success: true };
    } catch (e) {
        console.error("Delete Post Error:", e);
        return { success: false };
    }
};

export const fetchJobs = (vendorId, pos, silent = false) => async (dispatch) => {
    if (!vendorId) return;
    if (!silent) dispatch(setLoading(true));
    try {
        const url = pos
            ? `/vendor/jobs/${vendorId}?lat=${pos.lat}&lng=${pos.lng}`
            : `/vendor/jobs/${vendorId}`;
        const res = await api.get(url);
        dispatch(setJobs(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch Jobs Error:", e); }
    finally { dispatch(setLoading(false)); }
};

export const fetchFullProfile = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/vendor/profile/${vendorId}`);
        dispatch(setProfile(res.data));
    } catch (e) { console.error("Fetch Profile Error:", e); }
};

export const updateVendorProfile = (vendorId, updateData) => async (dispatch) => {
    dispatch(setActionLoading('profile-update'));
    // Immediate local update for instant UI response
    dispatch(updateProfile(updateData));

    try {
        await api.put(`/vendor/update-profile/${vendorId}`, updateData);
        await dispatch(fetchFullProfile(vendorId));
        return { success: true };
    } catch (e) {
        console.error("Update Profile Error:", e);
        return { success: false, message: e.response?.data?.message || "Failed to update profile" };
    } finally {
        dispatch(setActionLoading(null));
    }
};

export const fetchHistory = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/vendor/history/${vendorId}`);
        dispatch(setHistory(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch History Error:", e); }
};

export const updateJobStatus = (bookingId, vendorId, action) => async (dispatch) => {
    let status;
    let assignedId = vendorId;

    if (action === 'accept') {
        status = 'In Progress';
    } else if (action === 'reject') {
        status = 'Pending';
        assignedId = null;
    } else {
        status = 'Cancelled';
    }

    dispatch(setActionLoading(bookingId));
    try {
        await api.put(`/vendor/update-job/${bookingId}`, {
            bookingStatus: status,
            assignedVendorId: assignedId
        });
        dispatch(fetchJobs(vendorId));
    } catch (e) { alert("Failed to update job status"); }
    finally { dispatch(setActionLoading(null)); }
};

export const verifyOtpAndFinish = (bookingId, vendorId, otpValue) => async (dispatch) => {
    dispatch(setActionLoading(bookingId));
    try {
        await api.put(`/vendor/update-job/${bookingId}`, {
            bookingStatus: 'Completed',
            otp: otpValue
        });
        dispatch(fetchJobs(vendorId));
        dispatch(fetchHistory(vendorId));
        dispatch(fetchFullProfile(vendorId));
        return true;
    } catch (e) {
        alert("Invalid OTP");
        return false;
    } finally { dispatch(setActionLoading(null)); }
};

export const sendChatMessage = (bookingId, msgData) => async () => {
    try {
        await api.put(`/booking/chat/${bookingId}`, msgData);
    } catch (e) { console.error("Chat send error:", e); }
};

export const markAsRead = (bookingId) => async (dispatch) => {
    try {
        await api.put(`/booking/chat/${bookingId}/read`, { role: 'Vendor' });
        dispatch(markChatAsRead(bookingId));
    } catch (e) { console.error("Mark read error:", e); }
};

export const fetchVendorCoupons = () => async (dispatch) => {
    try {
        const response = await api.get('/coupons/all/public');
        dispatch(setVendorCoupons(response.data));
    } catch (error) {
        console.error("Vendor coupon fetch failed", error);
        dispatch(setVendorCoupons([]));
    }
};

export const fetchIncentives = (vendorId) => async (dispatch) => {
    try {
        const response = await api.get(`/vendor/incentives/${vendorId}`);
        dispatch(setIncentives(response.data));
    } catch (error) {
        console.error("Incentive fetch failed", error);
        dispatch(setIncentives([]));
    }
};

// Social Thunks
export const fetchSuggestions = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/social/suggestions/${vendorId}`);
        dispatch(setSuggestions(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch Suggestions Error:", e); }
};

export const sendConnectionRequest = (senderId, receiverId) => async (dispatch) => {
    try {
        await api.post(`/social/connect`, { senderId, receiverId });
        dispatch(fetchSuggestions(senderId));
        return { success: true };
    } catch (e) { return { success: false }; }
};

export const acceptConnectionRequest = (vendorId, requesterId) => async (dispatch) => {
    try {
        await api.post(`/social/accept/${vendorId}`, { requesterId });
        dispatch(fetchFullProfile(vendorId));
        return { success: true };
    } catch (e) { return { success: false }; }
};

export const fetchChatList = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/social/chats/${vendorId}`);
        dispatch(setChatList(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch Chats Error:", e); }
};

export const fetchFriendsList = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/social/friends/${vendorId}`);
        dispatch(setFriendsList(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch Friends Error:", e); }
};

export const fetchPrivateMessages = (u1, u2) => async () => {
    try {
        const res = await api.get(`/social/messages/${u1}/${u2}`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (e) { return []; }
};

export const sendPrivateMessage = (msgData) => async (dispatch) => {
    try {
        await api.post(`/social/message`, msgData);
        dispatch(fetchChatList(msgData.senderId));
        return { success: true };
    } catch (e) { return { success: false }; }
};
