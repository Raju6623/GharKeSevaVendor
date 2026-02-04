import React, { useState, useEffect } from 'react';
import { X, Star, ThumbsUp } from 'lucide-react';
import axios from 'axios';

const ReviewsModal = ({ isOpen, onClose, category, vendorId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = 'https://ghar-ke-seva-backend-code.vercel.app';

    useEffect(() => {
        if (!isOpen) return;

        const fetchReviews = async () => {
            try {
                setLoading(true);
                // Fetch reviews for this specific vendor if vendorId is provided, otherwise by category
                const endpoint = vendorId
                    ? `${BACKEND_URL}/api/auth/reviews/vendor/${vendorId}`
                    : `${BACKEND_URL}/api/auth/reviews/category/${category}`;

                const res = await axios.get(endpoint);
                if (Array.isArray(res.data)) {
                    setReviews(res.data);
                } else {
                    setReviews([]);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [isOpen, category, vendorId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Customer Reviews</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{category} Services</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    >
                        <X size={20} className="text-slate-900" />
                    </button>
                </div>

                {/* Reviews List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            <p className="text-slate-400 text-sm font-medium">Loading reviews...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <div
                                    key={review._id || index}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md text-lg">
                                                {(review.userName || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight">
                                                    {review.userName || "Anonymous"}
                                                </h3>
                                                <div className="flex text-amber-500 text-xs mt-1.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={i < review.rating ? "currentColor" : "none"}
                                                            className={i >= review.rating ? "text-gray-200" : ""}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-gray-50 text-gray-400 px-3 py-1 rounded-full font-bold">
                                            {new Date(review.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 italic break-words">
                                        "{review.text}"
                                    </p>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                        <div className="text-gray-400 text-xs font-bold flex items-center gap-1.5">
                                            <ThumbsUp size={14} /> Helpful ({review.likes || 0})
                                        </div>
                                        {review.rating >= 4 && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                Verified <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <Star size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                No reviews yet
                            </h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                                Reviews from your customers will appear here!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsModal;
