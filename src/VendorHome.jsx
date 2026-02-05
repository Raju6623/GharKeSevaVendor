import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, Menu, X, Star, Smartphone, Wallet, User, Briefcase, Calculator, Users } from 'lucide-react';
import VendorOffers from './vendorComponents/VendorOffers';

function VendorHome() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">

            {/* Navbar - Matching Main Site Style */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
                            GHARKE<span className="text-blue-600">SEVA</span>
                        </span>
                        <span className="hidden md:inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100">
                            Partner
                        </span>
                    </div>

                    <div className="hidden md:flex gap-4 items-center">
                        <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-[#2d308b] text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 active:scale-95">
                            Login
                        </button>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600 hover:text-blue-600">
                        {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                        >
                            <div className="px-6 py-6 flex flex-col gap-4">
                                <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full py-3 text-center font-bold text-slate-600 hover:bg-blue-50 rounded-lg transition-all">Login</button>
                                <button onClick={() => { navigate('/register'); setIsMenuOpen(false); }} className="w-full py-3 bg-[#2d308b] text-white rounded-lg font-bold shadow-md">Register as Partner</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 lg:px-8 relative bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100 mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Service Partners Wanted
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Grow Your Business with <span className="text-blue-600">GharKeSeva.</span>
                        </h1>
                        <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium max-w-lg">
                            Join thousands of skilled professionals. Get verified leads, transparent weekly payouts, and manage your bookings effortlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => navigate('/register')} className="px-8 py-4 bg-[#2d308b] text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                                Become a Partner <ArrowRight size={20} />
                            </button>
                            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all">
                                Login
                            </button>
                        </div>

                        <div className="mt-10 flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <User size={20} className="text-slate-400 mt-2" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-500">Trusted by <span className="text-slate-900">5,000+</span> Professionals</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative hidden lg:block">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/50 border border-slate-100">
                            {/* User requested image */}
                            <div className="bg-slate-100 aspect-[4/3] relative flex items-center justify-center">
                                <img
                                    src="/VendorHomePageImage.png"
                                    alt="GKS Partner Dashboard Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating Stats Card - Kept as overlay */}
                            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-slate-50 max-w-xs">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Wallet size={24} /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Weekly Earnings</p>
                                        <h4 className="text-xl font-black text-slate-900">₹12,450</h4>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[75%]"></div>
                                </div>
                            </div>
                        </div>
                        {/* Blob Background */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -z-10"></div>
                    </motion.div>

                </div>
            </section>

            {/* Why Join Us Section */}
            <section className="py-20 bg-slate-50 border-y border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Why Partner with GharKeSeva?</h2>
                        <p className="text-lg text-slate-500 font-medium">We provide the technology, marketing, and support so you can focus on delivering great service.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Calculator, title: "Zero Commission Joining", desc: "Start your journey with no hidden onboarding fees. Keep more of what you earn.", color: "text-blue-600", bg: "bg-blue-50" },
                            { icon: Smartphone, title: "Smart Partner App", desc: "Manage bookings, track earnings, and chat with customers all in one simple app.", color: "text-indigo-600", bg: "bg-indigo-50" },
                            { icon: CheckCircle2, title: "Guaranteed Payouts", desc: "Get paid directly to your bank account every week. Transparent and on time.", color: "text-green-600", bg: "bg-green-50" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">How GharKeSeva Works?</h2>
                        <p className="text-lg text-slate-500">Start earning in 4 simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-slate-100 -z-10"></div>

                        {[
                            { step: "01", title: "Register", desc: "Download app or sign up on the web. It takes 2 minutes." },
                            { step: "02", title: "Get Verified", desc: "Upload your documents. Our team verifies your profile within 24hrs." },
                            { step: "03", title: "Receive Jobs", desc: "Go online and start getting booking requests near you." },
                            { step: "04", title: "Earn Money", desc: "Complete jobs and get paid weekly directly to your bank account." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white border-4 border-blue-50 text-[#2d308b] rounded-full flex items-center justify-center text-2xl font-black shadow-sm mb-6 relative">
                                    {item.step}
                                    <div className="absolute inset-2 border border-slate-100 rounded-full"></div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who Can Join Section */}
            <section className="py-20 bg-slate-50 border-y border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Who are we looking for?</h2>
                            <p className="text-lg text-slate-500">We are onboarding professionals across 50+ categories.</p>
                        </div>
                        <button onClick={() => navigate('/register')} className="text-[#2d308b] font-bold flex items-center gap-2 hover:gap-4 transition-all">
                            View all categories <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            "AC Repair", "Electrician", "Plumber", "Carpenter", "Salon for Men",
                            "Salon for Women", "Massage Therapy", "Home Cleaning", "Pest Control",
                            "Appliance Repair", "Painters", "Home Maids"
                        ].map((cat, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 text-center hover:border-blue-500 hover:shadow-md transition-all cursor-default">
                                <p className="font-bold text-slate-700 text-sm">{cat}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vendor Offers Section */}
            <VendorOffers />

            {/* Partner Success Stories */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Hear from our Partners</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Rahul Sharma", role: "AC Technician", earn: "₹45k/month", quote: "GharKeSeva changed my life. I went from searching for daily work to having a steady stream of bookings. The payments are always on time." },
                            { name: "Priya Singh", role: "Beautician", earn: "₹38k/month", quote: "I love the flexibility. I can choose my own timings and areas. The support team is very helpful whenever I face any issue." },
                            { name: "Amit Verma", role: "Plumber", earn: "₹52k/month", quote: "Best platform for skilled workers. The app is easy to use and I get premium customers who respect our work." }
                        ].map((story, idx) => (
                            <div key={idx} className="bg-slate-50 p-8 rounded-2xl relative">
                                <div className="absolute top-8 right-8 text-[#2d308b]/10">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.896 14.912 16 16.017 16H19.017C19.569 16 20.017 15.552 20.017 15V9C20.017 8.448 19.569 8 19.017 8H15.017C14.465 8 14.017 8.448 14.017 9V11C14.017 11.552 13.569 12 13.017 12H12.017V5H22.017V15C22.017 18.314 19.331 21 16.017 21H14.017V21ZM5.01697 21L5.01697 18C5.01697 16.896 5.91197 16 7.01697 16H10.017C10.569 16 11.017 15.552 11.017 15V9C11.017 8.448 10.569 8 10.017 8H6.01697C5.46497 8 5.01697 8.448 5.01697 9V11C5.01697 11.552 4.56897 12 4.01697 12H3.01697V5H13.017V15C13.017 18.314 10.331 21 7.01697 21H5.01697V21Z" /></svg>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">
                                        {story.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{story.name}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{story.role} • <span className="text-green-600 font-bold">{story.earn}</span></p>
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed italic">"{story.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-6 bg-slate-900">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black mb-4">Common Questions</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Is there any joining fee?", a: "No, joining GharKeSeva is completely free. You only pay a small commission on completed jobs." },
                            { q: "When do I get paid?", a: "Payments are processed weekly. Your earnings from Monday to Sunday are transferred to your bank account by Tuesday." },
                            { q: "What documents are required?", a: "You need your Aadhar Card, PAN Card, and Bank Account details to get verified and start receiving jobs." },
                            { q: "Can I choose my working area?", a: "Yes! You have full control to select your preferred working zones and service radius in the app." }
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                className={`bg-slate-800 rounded-xl overflow-hidden transition-all cursor-pointer border border-slate-700 ${activeFaq === idx ? 'bg-slate-700 shadow-lg' : 'hover:bg-slate-750'}`}
                            >
                                <div className="p-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                                        <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">?</span>
                                        {faq.q}
                                    </h3>
                                    <Menu size={20} className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : 'rotate-0'}`} />
                                </div>
                                <AnimatePresence>
                                    {activeFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-6 text-slate-300 pl-[60px] text-sm leading-relaxed"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        <div>
                            <h3 className="text-4xl font-black text-[#2d308b]">50k+</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Bookings Delivered</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[#2d308b]">5000+</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Active Partners</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[#2d308b]">4.8/5</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Average Rating</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[#2d308b]">Tier 1</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Cities Covered</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Mini */}
            <footer className="bg-slate-900 py-12 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <span className="text-2xl font-black tracking-tighter text-white">
                        GHARKE<span className="text-blue-500">SEVA</span>
                    </span>
                    <p className="text-slate-400 mt-4 text-sm font-medium">Empowering service professionals across the nation.</p>
                    <p className="text-slate-600 mt-8 text-xs font-bold uppercase tracking-widest">© 2024 GharKeSeva Inc.</p>
                </div>
            </footer>

        </div>
    );
};

export default VendorHome;
