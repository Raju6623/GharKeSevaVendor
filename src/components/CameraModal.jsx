import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, RefreshCcw, Check, Scan, CheckCircle2 } from 'lucide-react';

const CameraModal = ({ isOpen, onClose, onCapture, title = "Identity Scan" }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Logic States
    const [scanStatus, setScanStatus] = useState('initializing'); // initializing, scanning, ready, error
    const [lockProgress, setLockProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            resetStates();
        }
        return () => stopCamera();
    }, [isOpen]);

    const resetStates = () => {
        setCapturedImage(null);
        setScanStatus('initializing');
        setLockProgress(0);
        setError(null);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 900 } },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setScanStatus('scanning');
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Camera not found or permission denied.");
            setScanStatus('error');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Stricter Lock Logic simulation
    useEffect(() => {
        let interval;
        if (scanStatus === 'scanning' && !capturedImage) {
            interval = setInterval(() => {
                setLockProgress(prev => {
                    if (prev >= 100) {
                        setScanStatus('ready');
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [scanStatus, capturedImage]);

    const capturePhoto = () => {
        if (scanStatus !== 'ready') return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const handleConfirm = () => {
        onCapture(capturedImage);
        onClose();
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setScanStatus('scanning');
        setLockProgress(0);
        startCamera();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[3.5rem] overflow-hidden max-w-md w-full shadow-[0_32px_100px_rgba(0,0,0,0.4)] relative border border-white/20"
            >
                {/* Header */}
                <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-xl">{title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Security Protocol Enabled</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 hover:bg-white hover:shadow-xl rounded-[1.5rem] transition-all flex items-center justify-center text-slate-400 group">
                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Viewport */}
                <div className="relative aspect-[3/4] bg-black overflow-hidden bg-gradient-to-b from-slate-900 to-black">
                    {capturedImage ? (
                        <motion.img
                            initial={{ filter: 'blur(20px)', scale: 1.1 }}
                            animate={{ filter: 'blur(0px)', scale: 1 }}
                            src={capturedImage}
                            className="w-full h-full object-cover"
                            alt="Captured"
                        />
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-1000 ${scanStatus === 'scanning' ? 'opacity-80' : 'opacity-100'}`} />

                            {/* Scanning Overlays */}
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                <div className={`relative w-[85%] h-[75%] rounded-[5rem] border-4 transition-all duration-700 shadow-[0_0_0_2000px_rgba(0,0,0,0.5)] 
                                    ${scanStatus === 'ready' ? 'border-emerald-500 scale-100' : 'border-rose-500/50 scale-[0.98]'}`}>

                                    <div className={`absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 rounded-tl-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />
                                    <div className={`absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 rounded-tr-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />
                                    <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 rounded-bl-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />
                                    <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 rounded-br-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />

                                    {scanStatus === 'ready' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 -top-12 flex justify-center">
                                            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-4 py-1 rounded-full shadow-lg flex items-center gap-2">
                                                <CheckCircle2 size={10} /> Face Recognition Locked
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                {scanStatus === 'scanning' && (
                                    <div className="absolute bottom-12 w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-rose-500" animate={{ width: `${lockProgress}%` }} />
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-10">
                                <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 backdrop-blur-xl border transition-all
                                    ${scanStatus === 'ready' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100 scale-105' : 'bg-rose-500/20 border-rose-500/40 text-rose-100 animate-pulse'}`}>
                                    {scanStatus === 'ready' ? <Check size={14} /> : <Scan size={14} className="animate-spin-slow" />}
                                    {scanStatus === 'ready' ? 'Ready to Capture' : 'Scanning Identity... Please Wait'}
                                </span>
                            </div>

                            {scanStatus !== 'ready' && (
                                <motion.div
                                    animate={{ top: ['20%', '80%', '20%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] z-10"
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-12 bg-[#f8fafb] flex flex-col items-center">
                    {capturedImage ? (
                        <div className="flex w-full gap-5">
                            <motion.button onClick={handleRetake} className="flex-1 h-16 bg-white text-slate-600 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-sm border border-slate-200 hover:bg-slate-50">
                                <RefreshCcw size={18} /> Retake
                            </motion.button>
                            <motion.button onClick={handleConfirm} className="flex-1 h-16 bg-[#0c8182] text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(12,129,130,0.3)] hover:scale-[1.02] transition-all">
                                <Check size={18} /> Confirm
                            </motion.button>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <button
                                onClick={capturePhoto}
                                disabled={scanStatus !== 'ready'}
                                className={`w-20 h-20 rounded-full border-8 transition-all relative flex items-center justify-center
                                    ${scanStatus === 'ready' ? 'bg-emerald-600 border-white shadow-2xl scale-110' : 'bg-slate-200 border-slate-100 opacity-50 cursor-not-allowed grayscale'}`}
                            >
                                <Camera size={28} className="text-white" />
                                {scanStatus === 'ready' && <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/40" />}
                            </button>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                {scanStatus === 'ready' ? 'Tap to Capture Identity' : 'Hold Device Steady'}
                            </p>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                <Scan size={12} className="text-amber-600" />
                                <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider italic">Requirement: Click selfie on white background</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CameraModal;
