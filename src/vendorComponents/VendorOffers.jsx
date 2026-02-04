import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorCoupons } from '../redux/thunks/vendorThunk';
import { Tag, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorOffers = () => {
    const dispatch = useDispatch();
    const { vendorCoupons } = useSelector((state) => state.vendor);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        dispatch(fetchVendorCoupons());
    }, [dispatch]);

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        resetTimeout();
        if (vendorCoupons && vendorCoupons.length > 1) {
            timeoutRef.current = setTimeout(
                () => setCurrentIndex((prevIndex) => (prevIndex === vendorCoupons.length - 1 ? 0 : prevIndex + 1)),
                3000
            );
        }
        return () => resetTimeout();
    }, [currentIndex, vendorCoupons]);

    if (!vendorCoupons || vendorCoupons.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === vendorCoupons.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? vendorCoupons.length - 1 : prev - 1));
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs px-4 py-2 bg-indigo-50 rounded-full inline-block mb-4"
                        >
                            Partner Perks
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-[1000] text-slate-900 tracking-tighter"
                        >
                            Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Partner Offers</span>
                        </motion.h2>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="relative h-[480px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                        >
                            {/* Slide Image */}
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group h-[400px]">
                                {vendorCoupons[currentIndex].offerImage ? (
                                    <img
                                        src={vendorCoupons[currentIndex].offerImage.startsWith('http') ? vendorCoupons[currentIndex].offerImage : `https://ghar-ke-seva-backend-code.vercel.app${vendorCoupons[currentIndex].offerImage}`}
                                        alt={vendorCoupons[currentIndex].code}
                                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                        <Tag size={120} className="text-white/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <div className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 inline-block mb-4">
                                        <p className="text-white font-black text-2xl tracking-widest">{vendorCoupons[currentIndex].code}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-white/80">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-indigo-400" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Valid Till {new Date(vendorCoupons[currentIndex].validUntil).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Slide Content */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="inline-block px-5 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-lg font-[1000] border-2 border-indigo-100 shadow-sm uppercase tracking-tighter">
                                        Get ₹{vendorCoupons[currentIndex].discountValue} Off
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                                        Enhance Your Business with {vendorCoupons[currentIndex].code}
                                    </h3>
                                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                                        {vendorCoupons[currentIndex].description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(vendorCoupons[currentIndex].code);
                                            alert("Code Copied: " + vendorCoupons[currentIndex].code);
                                        }}
                                        className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black tracking-widest uppercase text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                                    >
                                        Copy Promo Code <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>

                                <div className="flex gap-2 pt-6">
                                    {vendorCoupons.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`h-2 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-12 bg-indigo-600' : 'w-2 bg-slate-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default VendorOffers;
