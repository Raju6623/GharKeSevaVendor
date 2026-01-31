import api from '../../api/axiosConfig';
import {
    setLoading,
    setActionLoading,
    setProfile,
    setJobs,
    setHistory,
    markChatAsRead,
    setVendorCoupons,
    setIncentives
} from '../slices/vendorSlice';

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

export const fetchHistory = (vendorId) => async (dispatch) => {
    try {
        const res = await api.get(`/vendor/history/${vendorId}`);
        dispatch(setHistory(Array.isArray(res.data) ? res.data : []));
    } catch (e) { console.error("Fetch History Error:", e); }
};

export const updateJobStatus = (bookingId, vendorId, action) => async (dispatch) => {
    const status = action === 'accept' ? 'In Progress' : 'Cancelled';
    dispatch(setActionLoading(bookingId));
    try {
        await api.put(`/vendor/update-job/${bookingId}`, {
            bookingStatus: status,
            assignedVendorId: vendorId
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
