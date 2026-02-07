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
    const [isSteady, setIsSteady] = useState(false);

    const frameRef = useRef(null);
    const prevFrameData = useRef(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            resetStates();
        }
        return () => {
            stopCamera();
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isOpen]);

    const resetStates = () => {
        setCapturedImage(null);
        setScanStatus('initializing');
        setLockProgress(0);
        setError(null);
        setIsSteady(false);
        prevFrameData.current = null;
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
                // Start the analysis loop
                frameRef.current = requestAnimationFrame(analyzeFrame);
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
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };

    const analyzeFrame = () => {
        if (!videoRef.current || !canvasRef.current || capturedImage) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // Sampling at a smaller scale for performance
            const sampleWidth = 100;
            const sampleHeight = 100;
            canvas.width = sampleWidth;
            canvas.height = sampleHeight;

            ctx.drawImage(video, 0, 0, sampleWidth, sampleHeight);
            const frameData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

            if (prevFrameData.current) {
                let diff = 0;
                let skinPresence = 0;

                // Compare frame data and check for "face-like" colors
                for (let i = 0; i < frameData.length; i += 20) { // Sample every 5th pixel (4 bytes per pixel)
                    const r = frameData[i];
                    const g = frameData[i + 1];
                    const b = frameData[i + 2];

                    // Movement detection (simple pixel change)
                    const pr = prevFrameData.current[i];
                    diff += Math.abs(r - pr);

                    // Basic Skin Color Heuristic (R > G > B and some range checks)
                    if (r > 60 && g > 40 && b > 20 && r > g && r > b) {
                        skinPresence++;
                    }
                }

                const movementScore = diff / (frameData.length / 20);
                const skinScore = skinPresence / (frameData.length / 80); // Adjusted for sample rate

                // STABILITY & PRESENCE LOGIC
                // MovementScore < 10 is very steady
                // SkinScore > 0.1 means some skin-like color is present
                const steady = movementScore < 15;
                const faceDetected = skinScore > 0.15;

                if (steady && faceDetected) {
                    setIsSteady(true);
                    setLockProgress(prev => {
                        const next = prev + 4;
                        if (next >= 100) {
                            setScanStatus('ready');
                            return 100;
                        }
                        return next;
                    });
                } else {
                    // IF FACE REMOVED OR MOVING -> RESET TO RED
                    setIsSteady(false);
                    setScanStatus('scanning');
                    setLockProgress(prev => Math.max(0, prev - 10)); // Faster drain
                }
            }
            prevFrameData.current = frameData;
        }

        frameRef.current = requestAnimationFrame(analyzeFrame);
    };

    const capturePhoto = () => {
        if (scanStatus !== 'ready') return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            // Full resolution for the final capture
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
        setIsSteady(false);
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
                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Header */}
                <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-xl">{title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI-Powered Identity Verification</p>
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
                                <div className={`relative w-[85%] h-[75%] rounded-[5rem] border-4 transition-all duration-700 shadow-[0_0_0_2000px_rgba(0,0,0,0.6)] 
                                    ${scanStatus === 'ready' ? 'border-emerald-500 scale-100' : 'border-rose-500/50 scale-[0.98]'}`}>

                                    <div className={`absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 rounded-tl-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />
                                    <div className={`absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 rounded-tr-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />
                                    <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 rounded-bl-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />
                                    <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 rounded-br-[1.5rem] transition-colors ${scanStatus === 'ready' ? 'border-emerald-500' : 'border-rose-500'}`} />

                                    {scanStatus === 'ready' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-0 -top-12 flex justify-center">
                                            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                                                <CheckCircle2 size={10} /> Face Recognition Locked
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                {scanStatus === 'scanning' && (
                                    <div className="absolute bottom-12 w-64 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                                        <motion.div
                                            className={`h-full ${isSteady ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                            animate={{ width: `${lockProgress}%` }}
                                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-10 px-6">
                                <span className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 backdrop-blur-xl border transition-all duration-500
                                    ${scanStatus === 'ready' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100 scale-100' : 'bg-rose-500/20 border-rose-500/40 text-rose-100'}`}>
                                    {scanStatus === 'ready' ? <Check size={14} /> : <Scan size={14} className="animate-spin-slow" />}
                                    {scanStatus === 'ready' ? 'Ready to Capture' : isSteady ? 'Authenticating...' : 'Scanning Identity... Please Wait'}
                                </span>
                            </div>

                            {scanStatus !== 'ready' && !isSteady && (
                                <motion.div
                                    animate={{ top: ['20%', '80%', '20%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_#f43f5e] z-10"
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-12 bg-[#f8fafb] flex flex-col items-center">
                    {capturedImage ? (
                        <div className="flex w-full gap-5">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleRetake} className="flex-1 h-16 bg-white text-slate-600 rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
                                <RefreshCcw size={18} /> Retake
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleConfirm} className="flex-1 h-16 bg-[#0c8182] text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(12,129,130,0.3)] hover:bg-[#0a6d6d] transition-all">
                                <Check size={18} /> Confirm
                            </motion.button>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center w-full flex flex-col items-center">
                            <motion.button
                                whileHover={{ scale: scanStatus === 'ready' ? 1.1 : 1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={capturePhoto}
                                disabled={scanStatus !== 'ready'}
                                className={`w-24 h-24 rounded-full border-8 transition-all duration-300 relative flex items-center justify-center overflow-hidden
                                    ${scanStatus === 'ready' ? 'bg-emerald-500 border-emerald-100/50 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'bg-slate-200 border-slate-100 opacity-50 cursor-not-allowed grayscale'}`}
                            >
                                <Camera size={32} className="text-white relative z-10" />
                                {scanStatus === 'ready' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-400" />}
                                {scanStatus === 'ready' && <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/40" />}
                            </motion.button>
                            <div className="space-y-4">
                                <p className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${scanStatus === 'ready' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {scanStatus === 'ready' ? 'System Locked • Tap to Capture' : 'Hold Steady within Frame'}
                                </p>
                                <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border transition-all duration-500 ${scanStatus === 'ready' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <Scan size={14} className={scanStatus === 'ready' ? 'text-emerald-500' : 'text-amber-500'} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${scanStatus === 'ready' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        Requirement: White background selfie
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CameraModal;
