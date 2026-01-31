import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Tag, Plus, Trash2, Calendar, Percent, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

function CouponCard({ coupon }) {
    const [timeLeft, setTimeLeft] = useState({ status: 'ACTIVE', text: '' });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : new Date(0);
            const validUntil = new Date(coupon.validUntil);

            if (now < validFrom) {
                const diff = validFrom - now;
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ status: 'UPCOMING', text: d > 0 ? `${d}d ${h}h` : `${h}h ${m}m` });
            } else if (now < validUntil) {
                const diff = validUntil - now;
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ status: 'ACTIVE', text: d > 0 ? `${d}d ${h}h` : `${h}h ${m}m` });
            } else {
                setTimeLeft({ status: 'EXPIRED', text: "Expired" });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(timer);
    }, [coupon.validFrom, coupon.validUntil]);

    if (timeLeft.status === 'EXPIRED') return null; // Auto-hide expired

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition group relative">
            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
                <div className={`${timeLeft.status === 'UPCOMING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'} px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1`}>
                    {timeLeft.status === 'UPCOMING' ? <Calendar size={12} /> : <Percent size={12} />}
                    {timeLeft.status === 'UPCOMING' ? 'Upcoming' : 'Active'}
                </div>
                {coupon.category && (
                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-indigo-200">
                        {coupon.category} Offer
                    </div>
                )}
            </div>

            {/* Image Section */}
            <div className="h-32 bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
                {coupon.offerImage ? (
                    <img src={coupon.offerImage} alt="offer" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Tag size={64} className="text-indigo-600" />
                    </div>
                )}

                {timeLeft.status === 'UPCOMING' && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <div className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            Coming Soon • {new Date(coupon.validFrom).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-slate-800">{coupon.code}</h3>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded text-sm">₹{coupon.discountValue} OFF</span>
                </div>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{coupon.description}</p>

                {/* Expiry / Start Timer */}
                {timeLeft.status !== "EXPIRED" && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${timeLeft.status === 'UPCOMING' ? 'bg-amber-100 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                        <Calendar size={12} /> {timeLeft.status === 'UPCOMING' ? "Starts in:" : "Expires in:"} {timeLeft.text}
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Managed by Admin</span>
                </div>
            </div>
        </div>

    );
}

function VendorCoupons() {
    const { profile } = useSelector((state) => state.vendor);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        if (!profile?.customUserId) return;
        try {
            const res = await axios.get(`http://localhost:3001/api/auth/vendor/coupons/${profile.customUserId}`);
            setCoupons(res.data);
        } catch (error) {
            console.error("Fetch Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.customUserId) fetchCoupons();
    }, [profile]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Tag className="text-indigo-600" /> My Active Offers
                    </h1>
                    <p className="text-slate-500">Exclusive deals generated by Admin for your profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Tag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">No Active Offers</p>
                        <p className="text-sm">Contact Admin to generate new offers for your services.</p>
                    </div>
                )}

                {coupons.map(coupon => (
                    <CouponCard key={coupon._id} coupon={coupon} />
                ))}
            </div>
        </div>
    );
};

export default VendorCoupons;
