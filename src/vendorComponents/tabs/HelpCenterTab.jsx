import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HelpCenterTab = ({ profile }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: `Hi ${profile?.firstName || 'Partner'}! Main GharKeSeva Support AI hoon. Main aapki kya madad kar sakta hoon?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            let response = "";
            const query = text.toLowerCase();

            if (query.includes('payment') || query.includes('paisa') || query.includes('credit') || query.includes('salary')) {
                response = "Aapke payments har Tuesday ko process hote hain. Aap 'Credits' section me apna balance dekh sakte hain.";
            } else if (query.includes('job') || query.includes('booking') || query.includes('order') || query.includes('kaam')) {
                response = "Nayi bookings 'Home' tab par dikhengi. On-duty rehne par aapko alerts milte rahenge.";
            } else if (query.includes('profile') || query.includes('verify') || query.includes('kyc') || query.includes('aadhar')) {
                response = "Profile verification me 24-48 hours lagte hain. Kripya apne documents check karein.";
            } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
                response = "Hello! Main aapki help karne ke liye taiyaar hoon. Kya janna chahte hain aap?";
            } else if (query.includes('ok') || query.includes('thik') || query.includes('yes')) {
                response = "Ji! Kuch aur poochna hai toh batayein.";
            } else {
                response = "Samajh gaya. Kya aap chahte hain ki humare support team aapko call karein?";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: response, timestamp: new Date() }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {/* Simple Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Support Assistant</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.type === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.type === 'ai'
                                ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-none font-medium'
                                : 'bg-indigo-600 text-white rounded-tr-none font-semibold shadow-md shadow-indigo-100'
                            }`}>
                            {m.text}
                            <p className={`text-[9px] mt-1.5 opacity-50 ${m.type === 'ai' ? 'text-slate-400' : 'text-white'}`}>
                                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-tl-none">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Simple Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 items-center bg-slate-100 p-1.5 rounded-2xl">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterTab;
