import React from 'react';
import { motion } from 'framer-motion';
import { X, User, Send } from 'lucide-react';

const ChatModal = ({ isOpen, chatMessages, newMessage, setNewMessage, onSend, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm h-[500px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><User size={20} /></div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Customer Chat</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Support</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20} /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {chatMessages.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs mt-20 font-medium">Start the conversation...</div>
                    ) : chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'Vendor' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.sender === 'Vendor' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-600 rounded-bl-none shadow-sm'}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                    <input
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSend()}
                    />
                    <button onClick={onSend} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition active:scale-95">
                        <Send size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ChatModal;
