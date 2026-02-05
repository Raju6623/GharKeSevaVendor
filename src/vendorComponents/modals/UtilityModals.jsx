import React, { useState } from 'react';
import { X, MessageSquare, Languages, Check, Globe, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import translations from '../../utils/translations';

export const WhatsAppModal = ({ isOpen, onClose, currentStatus, onUpdate, isLoading }) => {
    const [status, setStatus] = useState(currentStatus === 'Off' || currentStatus === false ? 'Off' : 'On');
    const { language } = useSelector(state => state.vendor);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdate({ whatsappUpdates: status });
    };

    return (
        <UtilityModalLayout title={language === 'Hindi' ? 'व्हाट्सएप अपडेट' : 'WhatsApp Updates'} icon={<MessageSquare className="text-green-500" />} onClose={onClose}>
            <div className="space-y-6">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {language === 'Hindi'
                        ? 'वास्तविक समय की नौकरी अलर्ट, भुगतान अपडेट और महत्वपूर्ण घोषणाएं सीधे अपने व्हाट्सएप पर प्राप्त करें।'
                        : 'Receive real-time job alerts, payment updates, and important announcements directly on your WhatsApp.'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {['On', 'Off'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold ${status === s
                                ? 'bg-green-50 border-green-500 text-green-700 shadow-lg shadow-green-100'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            <span>{language === 'Hindi' ? (s === 'On' ? 'चालू' : 'बंद') : s}</span>
                            {status === s && <div className="bg-green-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                        </button>
                    ))}
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100/50">
                    <BellRing size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-600 font-bold uppercase tracking-tight leading-normal">
                        {language === 'Hindi'
                            ? 'नोट: हम केवल जरूरी अपडेट भेजते हैं। कोई स्पैम नहीं!'
                            : 'NOTE: WE ONLY SEND ESSENTIAL UPDATES. NO SPAM, EVER!'}
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isLoading ? (language === 'Hindi' ? 'अपडेट हो रहा है...' : 'Updating...') : (language === 'Hindi' ? 'प्राथमिकताएं सहेजें' : 'Save Preferences')}
                </button>
            </div>
        </UtilityModalLayout>
    );
};

export const LanguageModal = ({ isOpen, onClose, currentLang, onUpdate, isLoading }) => {
    const [lang, setLang] = useState(currentLang || 'English');
    const { language } = useSelector(state => state.vendor);

    if (!isOpen) return null;

    const languages = [
        { name: 'English', sub: 'Primary language' },
        { name: 'Hindi', sub: 'हिंदी - भारत की राष्ट्रभाषा' }
    ];

    const handleSave = async () => {
        console.log('Language Save clicked, lang:', lang);
        console.log('Current language:', language);
        console.log('onUpdate function:', onUpdate);

        try {
            // First update Redux state immediately for instant UI change
            const result = await onUpdate({ language: lang });
            console.log('Language update result:', result);
        } catch (error) {
            console.error('Language update error:', error);
            console.error('Error details:', error.message, error.stack);
            // Don't show error - language already changed in Redux
            // Swal.fire({ icon: 'error', title: language === 'Hindi' ? 'त्रुटि!' : 'Error!', text: language === 'Hindi' ? 'भाषा बदलने में समस्या आई।' : 'Failed to change language.' });
        }
    };

    return (
        <UtilityModalLayout title={language === 'Hindi' ? 'भाषा बदलें' : 'Change Language'} icon={<Languages className="text-indigo-600" />} onClose={onClose}>
            <div className="space-y-4">
                {languages.map((l) => (
                    <button
                        key={l.name}
                        onClick={() => setLang(l.name)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${lang === l.name
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-lg shadow-indigo-100'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                            }`}
                    >
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="font-bold text-sm">{l.name}</span>
                            <span className={`text-[10px] font-medium ${lang === l.name ? 'text-indigo-400' : 'text-slate-400'}`}>{l.sub}</span>
                        </div>
                        {lang === l.name && <Check size={18} className="text-indigo-600" />}
                    </button>
                ))}

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4"
                >
                    {isLoading ? "Changing..." : "Apply Selection"}
                </button>
            </div>
        </UtilityModalLayout>
    );
};

const UtilityModalLayout = ({ title, icon, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        {icon}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
                </div>
                <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl shadow-sm border border-slate-100 transition-all">
                    <X size={20} />
                </button>
            </div>
            <div className="p-8">
                {children}
            </div>
        </motion.div>
    </div>
);
