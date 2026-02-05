import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShieldCheck, MapPin, HelpCircle, MessageCircle, ArrowLeft, Building2, AlertCircle, Headphones, Send, User, X, Loader2, Globe } from 'lucide-react';

const MyHubTab = ({ profile, onBack }) => {
    const [view, setView] = useState('main'); // main, help, support
    const [chatStep, setChatStep] = useState('language'); // language, chat
    const [selectedLang, setSelectedLang] = useState(null);
    const [typing, setTyping] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([]);

    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (view === 'support' && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, typing, view]);

    // Scroll window ONLY when switching to a different section (Main/Help)
    // NOT when chat is active
    useEffect(() => {
        if (chatStep === 'language' || view !== 'support') {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [view, chatStep]);

    // Rishika's enhanced response logic
    const getSmartResponse = (input, lang) => {
        const text = input.toLowerCase();

        const responses = {
            Hindi: {
                greeting: `नमस्ते ${profile?.firstName || 'पार्टनर'}! बताइए, हब, जॉब या पेमेंट से जुड़ी कोई परेशानी है क्या?`,
                hub: "हब आपका काम करने का इलाका होता है। यह लगभग 7-10 किलोमीटर के अंदर होता है ताकि आप ज़्यादा से ज़्यादा काम कर सकें।",
                tag: "मैं देख रही हूँ कि आपका हब अभी टैग नहीं है। फ़िक्र मत कीजिये, मैंने आपके मैनेजर को बोल दिया है। जल्दी ही टैग हो जाएगा।",
                job: "जॉब्स मिलने के लिए आपका 'ऑन ड्यूटी' रहना और हब का टैग होना ज़रूरी है। अपना ड्यूटी बटन होम स्क्रीन पर चेक करें।",
                payment: "पेमेंट हर सोमवार को प्रोसेस होती है। आप अपना वॉलेट या बैंक अकाउंट चेक कर सकते हैं।",
                profile: "अपना प्रोफाइल या फोटो बदलने के लिए आप 'Profile' टैब में जाकर एडिट कर सकते हैं।",
                manager_yes: "ठीक है, मैं आपके लिए टिकट रेज़ कर रही हूँ। मैनेजर आपको अगले 30 मिनट में कॉल करेंगे।",
                manager_no: "ठीक है पार्टनर। अगर कुछ और पूछना हो तो ज़रूर बताइएगा।",
                thanks: "कोई बात नहीं! हम हमेशा आपकी मदद के लिए तैयार हैं। घर की सेवा में जुड़े रहने के लिए धन्यवाद।",
                default: "मैं आपकी पूरी बात समझना चाहती हूँ। क्या आप हब के बारे में पूछ रहे हैं या फिर मैनेजर से बात करना चाहते हैं?"
            },
            Hinglish: {
                greeting: `Namaste ${profile?.firstName || 'Partner'}! Bataiye, Hub, Job ya Payment se judi koi pareshani hai kya?`,
                hub: "Hub aapka kaam karne ka ilaaka hota hai. Ye lagbhag 7-10 kms ke andar hota hai taaki aap zada se zada jobs kar sakein.",
                tag: "Main dekh rahi hoon ki aapka Hub abhi tag nahi hai. Fikar mat kijiye, maine aapke manager ko bol diya hai. Thodi der mein sahi ho jayega.",
                job: "Jobs milne ke liye aapka 'On Duty' rehna aur Hub ka tagged hona zaroori hai. Duty button Home page par check kar lein.",
                payment: "Payments har Monday ko process hoti hain. Aap apna 'Financial Details' check kar sakte hain.",
                profile: "Profile update karne ke liye aap 'Profile' tab mein jayein. Waha se sab change ho sakta hai.",
                manager_yes: "Ok Partner, main aapka request manager ko bhej rahi hoon. 30 mins mein vo aapse contact karenge.",
                manager_no: "Theek hai. Koi aur sawaal hai to please poocho.",
                thanks: "You're welcome! Hum hamesha aapke saath hain. Kuch aur help chahiye?",
                default: "Main sahi se samajh nahi paayi. Kya aap Hub, Job ya Salary ke baare mein pooch rahe hain? Ya Manager se baat karni hai?"
            },
            English: {
                greeting: `Hello ${profile?.firstName || 'Partner'}! How can I help you with your Hub, Jobs, or Payments today?`,
                hub: "A Hub is your service area, typically within a 7-10 km radius, allowing you to handle jobs efficiently.",
                tag: "I see your Hub is not tagged yet. Don't worry, I've informed your manager. It will be resolved shortly.",
                job: "To receive jobs, ensure you are 'On Duty' and your Hub is correctly tagged. Check your status on the Home screen.",
                payment: "Payments are processed every Monday. Please check your wallet or bank details in the Finance tab.",
                profile: "To update your profile or documents, please navigate to the 'Profile' section.",
                manager_yes: "Sure, I am raising a priority ticket. A manager will call you within 30 minutes.",
                manager_no: "Got it. Let me know if you have any other questions.",
                thanks: "You're welcome! We are always here to support our partners. Have a great day!",
                default: "Could you please elaborate? Are you asking about Hubs, Jobs, or would you like to speak with a manager?"
            }
        };

        const res = responses[lang] || responses.Hinglish;

        // Keywords Matching Logic
        if (text.includes('yes') || text.includes('ha') || text.includes('han') || text.includes('ji') || text.includes('हाँ') || text.includes('हा')) return res.manager_yes;
        if (text.includes('no') || text.includes('nhi') || text.includes('nahi') || text.includes('na') || text.includes('नहीं') || text.includes('नही')) return res.manager_no;
        if (text.includes('hi') || text.includes('hello') || text.includes('namaste') || text.includes('नमस्ते')) return res.greeting;
        if (text.includes('hub') || text.includes('हब') || text.includes('ilaaka')) return res.hub;
        if (text.includes('assign') || text.includes('tag') || text.includes('manager')) return res.tag;
        if (text.includes('job') || text.includes('kaam') || text.includes('work') || text.includes('जॉब')) return res.job;
        if (text.includes('paisa') || text.includes('salary') || text.includes('payment') || text.includes('rupay') || text.includes('पेमेंट')) return res.payment;
        if (text.includes('profile') || text.includes('photo') || text.includes('document')) return res.profile;
        if (text.includes('thank') || text.includes('shukriya') || text.includes('dhanyawad')) return res.thanks;

        return res.default;
    };

    const handleLanguageSelect = (lang) => {
        setSelectedLang(lang);
        setChatStep('chat');

        let welcomeMsg = "";
        if (lang === 'Hindi') welcomeMsg = `नमस्ते ${profile?.firstName || 'पार्टनर'}! मैं ऋषिका हूँ। मैं आज आपकी कैसे मदद कर सकती हूँ? (हब, जॉब या पेमेंट)`;
        else if (lang === 'Hinglish') welcomeMsg = `Namaste ${profile?.firstName || 'Partner'}! Main Rishika hoon. Aaj main aapki kaise help kar sakti hoon? (Hub, Job ya Payment)`;
        else welcomeMsg = `Hello ${profile?.firstName || 'Partner'}! I am Rishika. How can I help you today? (Hub, Job or Payments)`;

        setMessages([{ id: Date.now(), sender: 'bot', text: welcomeMsg, time: 'Abhi' }]);
    };

    const handleSend = () => {
        if (!chatInput.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setChatInput("");
        setTyping(true);

        setTimeout(() => {
            const botResponse = getSmartResponse(userMsg.text, selectedLang);
            const botMsg = { id: Date.now() + 1, sender: 'bot', text: botResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setMessages(prev => [...prev, botMsg]);
            setTyping(false);
        }, 1200);
    };

    const renderChat = () => {
        return (
            <div className="flex flex-col h-[calc(100vh-160px)] bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl">
                <header className="px-10 py-8 bg-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setView('main'); setChatStep('language'); }} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Rishika (Support Manager)</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-slate-100 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                        <User size={28} className="text-slate-300" />
                    </div>
                </header>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    {chatStep === 'language' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-teal-50 rounded-[2.5rem] flex items-center justify-center text-[#0c8182] mb-4">
                                <Globe size={40} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Choose your language</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Baat karne ke liye bhasha chunein</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleLanguageSelect('Hindi')}
                                    className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-3 group hover:border-[#0c8182] transition-all"
                                >
                                    <span className="text-3xl">🇮🇳</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-slate-700 tracking-tight group-hover:text-[#0c8182]">हिन्दी</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-teal-600/50">Pure Hindi</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleLanguageSelect('Hinglish')}
                                    className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-3 group hover:border-[#0c8182] transition-all"
                                >
                                    <span className="text-3xl">💬</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-slate-700 tracking-tight group-hover:text-[#0c8182]">हिन्दी (English)</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-teal-600/50">Hinglish</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleLanguageSelect('English')}
                                    className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col items-center gap-3 group hover:border-[#0c8182] transition-all"
                                >
                                    <span className="text-3xl">🇺🇸</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black text-slate-700 tracking-tight group-hover:text-[#0c8182]">English</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-teal-600/50">English</span>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((m) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={m.id}
                                    className={`flex ${m.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[85%] p-6 rounded-[2.2rem] shadow-sm relative ${m.sender === 'bot' ? 'bg-white border-t border-r border-b text-slate-700 rounded-tl-none' : 'bg-[#0c8182] text-white rounded-tr-none'}`}>
                                        <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                                        <p className={`text-[9px] mt-3 font-black uppercase tracking-widest ${m.sender === 'bot' ? 'text-slate-400' : 'text-teal-200'}`}>{m.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-6 py-4 rounded-[1.5rem] rounded-tl-none border shadow-sm">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Rishika is typing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </>
                    )}
                </div>

                {chatStep === 'chat' && (
                    <footer className="p-10 bg-white border-t">
                        <div className="relative flex gap-4">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={selectedLang === 'English' ? "Type your message..." : "यहाँ लिखें..."}
                                className="flex-1 h-16 bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 font-bold text-slate-700 outline-none focus:border-[#0c8182] focus:bg-white transition-all shadow-inner"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!chatInput.trim() || typing}
                                className="w-16 h-16 bg-[#0c8182] text-white rounded-3xl flex items-center justify-center shadow-xl shadow-teal-100/50 hover:bg-[#0a6d6d] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        );
    };

    const renderHelp = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
        >
            <header className="flex items-center gap-6">
                <button onClick={() => setView('main')} className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0c8182] transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">What is a hub?</h2>
            </header>

            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="space-y-4">
                    <p className="text-lg font-bold text-slate-700 leading-normal">
                        Hub is the area of service or region where a partner provides services. The distance partners are supposed to travel is approximately <span className="text-[#0c8182]">7-10kms</span>.
                    </p>
                    <p className="text-lg font-bold text-slate-700 leading-normal">
                        Partner should respond to all <span className="font-black uppercase tracking-tight">exclusive</span> and <span className="font-black uppercase tracking-tight">normal</span> leads coming within the hub.
                    </p>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-32">
            <AnimatePresence mode="wait">
                {view === 'main' ? (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12"
                    >
                        <header className="flex items-center gap-6">
                            <button onClick={onBack} className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0c8182] transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">My Hub</h1>
                        </header>

                        <div className="bg-white p-12 lg:p-20 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center">
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-amber-100 blur-3xl opacity-30 rounded-full" />
                                <div className="w-32 h-32 bg-[#fdf2f2] rounded-full flex items-center justify-center relative border-4 border-white shadow-lg">
                                    <Building2 size={48} className="text-[#0c8182]" />
                                    <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-rose-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                                        <X size={20} strokeWidth={4} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">No hub tagged.</h3>
                            <p className="text-lg font-bold text-slate-400 max-w-md leading-relaxed">
                                Please ask your <span className="text-slate-900">CM (Category Manager)</span> to assign you a hub to start receiving jobs for this category.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setView('support')}
                                className="mt-12 px-10 py-5 bg-[#0c8182] text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-teal-100/50 flex items-center gap-3"
                            >
                                <Headphones size={18} /> Contact Support
                            </motion.button>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8">Need help?</h4>
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                <HelpLink icon={<HelpCircle size={20} />} title="What is a Hub?" onClick={() => setView('help')} />
                                <HelpLink icon={<MapPin size={20} />} title="Getting rebooking leads outside hub" onClick={() => setView('support')} isLast />
                            </div>
                        </div>
                    </motion.div>
                ) : view === 'help' ? (
                    renderHelp()
                ) : (
                    renderChat()
                )}
            </AnimatePresence>
        </div>
    );
};

const HelpLink = ({ icon, title, onClick, isLast }) => (
    <button
        onClick={onClick}
        className={`w-full p-10 flex items-center justify-between hover:bg-slate-50 transition-all text-left ${!isLast ? 'border-b border-slate-50' : ''}`}
    >
        <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white transition-all">
                {icon}
            </div>
            <span className="text-lg font-bold text-slate-700 tracking-tight">{title}</span>
        </div>
        <ChevronRight size={20} className="text-slate-300" />
    </button>
);

export default MyHubTab;
