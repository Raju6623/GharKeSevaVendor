import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, Lock, ArrowRight, CheckCircle2, Camera, Zap, User, Eye, EyeOff, Loader2, Phone, ShieldCheck, MapPin, CreditCard, UserCircle, X, RefreshCw } from 'lucide-react';
import CameraModal from '../components/CameraModal';

// ... (existing code matches until VendorAuth component start)



// Aadhar Formatter (adds space every 4 digits)
const formatAadhar = (value) => {
  const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const parts = cleaned.match(/.{1, 4}/g);
  if (parts) return parts.join(' ').substring(0, 14);
  return cleaned;
};

const VendorAuth = function () {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [previews, setPreviews] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    experienceCert: null
  });
  const [manualEntry, setManualEntry] = useState({ local: false, permanent: false });
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const mobileCameraRef = React.useRef(null);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const navigate = useNavigate();

  const [regData, setRegData] = useState({
    firstName: '', lastName: '', userEmail: '', userPhone: '', alternatePhone: '',
    userPassword: '', confirmPassword: '', aadharNumber: '', panNumber: '',
    gender: '', dob: '', experience: '',
    bankName: '', accountNumber: '', ifscCode: '',
    vendorCategory: '',
    // Address Split
    localStreet: '', localCity: '', localState: '', localPincode: '',
    permanentStreet: '', permanentCity: '', permanentState: '', permanentPincode: '',
    vendorPhoto: null,
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    experienceCert: null,
    isSameAsLocal: false
  });

  const [loginData, setLoginData] = useState({ userEmail: '', userPassword: '' });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  // Toast configuration
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return Toast.fire({ icon: 'error', title: 'Please enter your registered email' });

    setIsSubmittingForgot(true);
    // Simulate real-time working
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Inquiry Sent',
        text: 'Your password reset request has been received. Our team will contact you shortly.',
        confirmButtonColor: '#2d308b'
      });
      setIsSubmittingForgot(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 1500);
  };


  // Pincode logic for Local Address
  useEffect(() => {
    const fetchLocalAddress = async () => {
      if (regData.localPincode.length === 6) {
        setPincodeLoading(true);
        try {
          const res = await axios.get(`https://api.postalpincode.in/pincode/${regData.localPincode}`, { timeout: 5000 });
          if (res.data[0].Status === "Success") {
            const details = res.data[0].PostOffice[0];
            setRegData(prev => ({ ...prev, localCity: details.District, localState: details.State }));
            setManualEntry(prev => ({ ...prev, local: false }));
          } else {
            throw new Error("Invalid Pincode");
          }
        } catch (err) {
          console.error("Pincode fetch failed", err);
          setManualEntry(prev => ({ ...prev, local: true }));
          Toast.fire({ icon: "info", title: "Enter City & State manually" });
        }
        finally { setPincodeLoading(false); }
      }
    };
    fetchLocalAddress();
  }, [regData.localPincode]);

  // Pincode logic for Permanent Address
  useEffect(() => {
    const fetchPermAddress = async () => {
      if (regData.permanentPincode.length === 6) {
        try {
          const res = await axios.get(`https://api.postalpincode.in/pincode/${regData.permanentPincode}`, { timeout: 5000 });
          if (res.data[0].Status === "Success") {
            const details = res.data[0].PostOffice[0];
            setRegData(prev => ({ ...prev, permanentCity: details.District, permanentState: details.State }));
            setManualEntry(prev => ({ ...prev, permanent: false }));
          } else {
            throw new Error("Invalid Pincode");
          }
        } catch (err) {
          console.error("Pincode fetch failed", err);
          setManualEntry(prev => ({ ...prev, permanent: true }));
          Toast.fire({ icon: "info", title: "Enter City & State manually" });
        }
      }
    };
    fetchPermAddress();
  }, [regData.permanentPincode]);

  const handleSameAsLocal = (e) => {
    const checked = e.target.checked;
    setRegData(prev => ({
      ...prev,
      isSameAsLocal: checked,
      permanentStreet: checked ? prev.localStreet : '',
      permanentCity: checked ? prev.localCity : '',
      permanentState: checked ? prev.localState : '',
      permanentPincode: checked ? prev.localPincode : ''
    }));
  };

  const handlePhotoCapture = (dataUrl) => {
    setImagePreview(dataUrl);
    // Convert base64 to file for form transparency
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        setRegData(prev => ({ ...prev, vendorPhoto: file }));
      });
  };

  const openCamera = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      mobileCameraRef.current.click();
    } else {
      setIsCameraOpen(true);
    }
  };

  const handleDocChange = (fieldname, e) => {
    const file = e.target.files[0];
    if (file) {
      setRegData(prev => ({ ...prev, [fieldname]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [fieldname]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePhoto = (e) => {
    e.preventDefault(); // Prevent label click if nested
    setImagePreview(null);
    setRegData(prev => ({ ...prev, vendorPhoto: null }));
  };

  const handleRemoveDoc = (fieldname) => {
    setRegData(prev => ({ ...prev, [fieldname]: null }));
    setPreviews(prev => ({ ...prev, [fieldname]: null }));
  };

  const handleSendOtp = () => {
    if (regData.userPhone.length !== 10) return Toast.fire({ icon: "warning", title: "Enter valid 10-digit number" });
    setSendingOtp(true);
    setTimeout(() => {
      setOtpSent(true);
      setSendingOtp(false);
      Swal.fire({ icon: 'info', title: 'Test OTP', text: 'Use: 123456', confirmButtonColor: '#2d308b' });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456') {
      setIsMobileVerified(true);
      Toast.fire({ icon: "success", title: "Verified!" });
      setCurrentStep(2);
    } else {
      Toast.fire({ icon: "error", title: "Invalid OTP" });
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!isMobileVerified) { Toast.fire({ icon: "warning", title: "Verify Phone First" }); return false; }
    }
    if (currentStep === 2) {
      if (!regData.vendorPhoto) { Toast.fire({ icon: "warning", title: "Upload Photo" }); return false; }
      if (!regData.firstName || !regData.lastName || !regData.userEmail || !regData.gender || !regData.dob || !regData.vendorCategory || !regData.experience) {
        Toast.fire({ icon: "warning", title: "Fill all mandatory fields" });
        return false;
      }
      if (regData.userPassword.length < 6) { Toast.fire({ icon: "warning", title: "Password: Min 6 chars" }); return false; }
      if (regData.userPassword !== regData.confirmPassword) { Toast.fire({ icon: "warning", title: "Passwords do not match" }); return false; }
    }
    if (currentStep === 3) {
      if (!regData.localStreet || !regData.localPincode || !regData.permanentStreet || !regData.permanentPincode) {
        Toast.fire({ icon: "warning", title: "Both addresses are required" });
        return false;
      }
    }
    if (currentStep === 4) {
      if (regData.aadharNumber.replace(/\s+/g, '').length !== 12) { Swal.fire({ icon: "warning", title: "Invalid Aadhar", text: "Aadhar Number must be exactly 12 digits." }); return false; }
      if (regData.panNumber.length !== 10) { Swal.fire({ icon: "warning", title: "Invalid PAN", text: "PAN Number must be 10 characters." }); return false; }
      if (!regData.aadharFront || !regData.aadharBack || !regData.panCard || !regData.experienceCert) {
        Swal.fire({ icon: "warning", title: "Missing Documents", text: "Please upload all 4 required KYC documents." });
        return false;
      }
      if (!regData.bankName || !regData.accountNumber || !regData.ifscCode) {
        Swal.fire({ icon: "warning", title: "Missing Bank Details", text: "Please fill in all bank information." });
        return false;
      }
      // Bank account length check (standard 9-18 digits)
      if (regData.accountNumber.length < 9 || regData.accountNumber.length > 18) {
        Swal.fire({ icon: "warning", title: "Invalid Account Number", text: "Account Number must be between 9 and 18 digits." });
        return false;
      }
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Prevent double submission
    if (loading) return;

    setLoading(true);
    const formData = new FormData();
    const cleanedData = {
      ...regData,
      aadharNumber: regData.aadharNumber.replace(/\s+/g, ''),
      // Map local address to vendor address fields for backend
      vendorStreet: regData.localStreet,
      vendorCity: regData.localCity,
      vendorState: regData.localState,
      vendorPincode: regData.localPincode
    };
    const fileFields = ['vendorPhoto', 'aadharFront', 'aadharBack', 'panCard', 'experienceCert'];
    Object.keys(cleanedData).forEach(key => {
      // Don't append empty or internal UI states OR file fields (handled explicitly below)
      if (!fileFields.includes(key) && key !== 'isSameAsLocal' && key !== 'confirmPassword' && cleanedData[key] !== null) {
        formData.append(key, cleanedData[key]);
      }
    });

    // Explicitly append files to ensure they are caught by multer
    if (regData.vendorPhoto) formData.append('vendorPhoto', regData.vendorPhoto);
    if (regData.aadharFront) formData.append('aadharFront', regData.aadharFront);
    if (regData.aadharBack) formData.append('aadharBack', regData.aadharBack);
    if (regData.panCard) formData.append('panCard', regData.panCard);
    if (regData.experienceCert) formData.append('experienceCert', regData.experienceCert);
    try {
      const res = await api.post('/vendor/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Success!', text: 'Account Created. Please Login.' });
        setIsLogin(true);
        setCurrentStep(1);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to Register";
      console.error("Registration Error:", err);
      Swal.fire({ icon: "error", title: "Registration Failed", text: errorMsg });
      Toast.fire({ icon: "error", title: errorMsg });
    }
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.userEmail || !loginData.userPassword) {
      return Toast.fire({ icon: "warning", title: "Please fill all fields" });
    }
    setLoading(true);
    try {
      const res = await api.post('/vendor/login', loginData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // Ensure we store the user object correctly with 'id' property
        const userData = res.data.user || {};
        // Map _id or customUserId to id if missing for frontend compatibility
        if (!userData.id && userData.customUserId) userData.id = userData.customUserId;

        localStorage.setItem('vendorData', JSON.stringify(userData));
        console.log("Login Success, stored:", userData);

        Toast.fire({ icon: "success", title: "Login Successful!" });
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Invalid credentials";
      console.error("Login Error:", err);

      if (errorMsg.includes('Pending')) {
        // Highlight Admin Message in Red if present
        let htmlContent = `<div style="color: #334155; font-size: 14px;">Your application is currently under review by the admin team.</div>`;

        if (errorMsg.includes('Admin Message:')) {
          const parts = errorMsg.split('Admin Message:');
          // parts[1] contains the actual note
          htmlContent += `<div style="margin-top: 15px; color: #dc2626; font-weight: 800; font-size: 14px; background: #fef2f2; padding: 10px; border-radius: 8px; border: 1px solid #fee2e2;">ADMIN FEEDBACK: ${parts[1].trim()}</div>`;
        }

        Swal.fire({
          icon: 'info',
          title: 'Approval Pending',
          html: htmlContent,
          confirmButtonText: 'Understood',
          confirmButtonColor: '#2563eb'
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Login Failed', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-2.5 bg-white border border-slate-300 rounded-md text-sm font-medium focus:border-indigo-600 outline-none transition-all";
  const labelClass = "text-[10px] font-black uppercase text-slate-500 mb-1 block tracking-wider";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row overflow-hidden">

        {/* Brand Side */}
        <div className="w-full md:w-5/12 bg-[#2d308b] p-10 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <CheckCircle2 size={24} />
              <span className="font-bold text-xl uppercase tracking-tighter">GKS Partner</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Partner Registration</h2>
            <p className="text-indigo-100/60 text-sm">Join our network of skilled professionals.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-7/12 p-10 bg-white max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-bold text-slate-800">{isLogin ? 'Login' : `Step ${currentStep} of 4`}</h3>
            <button onClick={() => {
              setIsLogin(!isLogin);
              setCurrentStep(1);
              setOtpSent(false);
              setOtpCode('');
              setIsMobileVerified(false);
            }} className="text-indigo-600 font-bold text-xs uppercase tracking-widest">
              {isLogin ? 'Join Now' : 'Back to Login'}
            </button>
          </div>

          <CameraModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handlePhotoCapture}
            title="Profile Identity Scan"
          />

          {!isLogin ? (
            <form onSubmit={handleRegister} className="space-y-6">

              {/* Simple Progress Line */}
              <div className="flex gap-1 mb-8">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full ${currentStep >= s ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                ))}
              </div>

              {currentStep === 1 && (
                <div className="space-y-4">
                  {!otpSent && !isMobileVerified ? (
                    <>
                      <div>
                        <label className={labelClass}>Mobile Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={regData.userPhone}
                          maxLength="10"
                          className={inputClass}
                          placeholder="10-digit number"
                          onChange={e => setRegData({ ...regData, userPhone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || regData.userPhone.length !== 10}
                        className="w-full py-3 bg-[#2d308b] text-white rounded font-bold shadow-lg shadow-indigo-100 hover:bg-[#1e206b] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {sendingOtp ? <Loader2 size={18} className="animate-spin" /> : 'Send Verification OTP'}
                      </button>
                    </>
                  ) : !isMobileVerified && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-100">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Code sent to</p>
                        <div className="flex items-center justify-center gap-3">
                          <p className="text-base font-black text-[#2d308b] tracking-wider">+91 {regData.userPhone}</p>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtpCode(''); }}
                            className="p-1.5 bg-white text-indigo-600 rounded-full shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                            title="Change Number"
                          >
                            <RefreshCw size={12} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Enter 6-Digit OTP</label>
                        <input
                          type="text"
                          maxLength="6"
                          inputMode="numeric"
                          className={`${inputClass} text-center tracking-[0.5em] font-black text-lg focus:border-[#2d308b]`}
                          placeholder="••••••"
                          onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          autoFocus
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        Verify & Continue
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                          Didn't get the code? <span className="text-indigo-600">Resend OTP</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={handleRemoveProfilePhoto}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10 shadow-lg"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : <UserCircle size={32} className="text-slate-200" />}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={openCamera}
                          className="flex items-center gap-2 px-6 py-3 bg-[#2d308b] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95"
                        >
                          <Camera size={14} /> Take Live Photo *
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Your face must be clear for approval</p>
                      </div>
                    </div>
                    {/* Hidden input for mobile camera or fallback upload */}
                    <input type="file" ref={mobileCameraRef} className="hidden" accept="image/*" capture="user" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setRegData(prev => ({ ...prev, vendorPhoto: file }));
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name</label><input type="text" className={inputClass} value={regData.firstName} onChange={e => setRegData({ ...regData, firstName: e.target.value })} required /></div>
                    <div><label className={labelClass}>Last Name</label><input type="text" className={inputClass} value={regData.lastName} onChange={e => setRegData({ ...regData, lastName: e.target.value })} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Gender</label><select className={inputClass} value={regData.gender} onChange={e => setRegData({ ...regData, gender: e.target.value })}><option value="" disabled hidden>Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                    <div><label className={labelClass}>DOB</label><input type="date" max={new Date().toISOString().split('T')[0]} className={inputClass} value={regData.dob} onChange={e => setRegData({ ...regData, dob: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <label className={labelClass}>Expertise Categories (Select up to 3)</label>
                        {(!regData.vendorCategories || regData.vendorCategories.length === 0) && (
                          <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">* Required</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { id: 'AC', label: 'AC Specialist' },
                          { id: 'Plumbing', label: 'Plumber' },
                          { id: 'Electrician', label: 'Electrician' },
                          { id: 'Carpenter', label: 'Carpenter' },
                          { id: 'RO', label: 'RO Expert' },
                          { id: 'Salon', label: 'Salon & Spa' },
                          { id: 'HouseMaid', label: 'Home Maids' },
                          { id: 'Painting', label: 'Painter' },
                          { id: 'SmartLock', label: 'Smart Lock' },
                          { id: 'Appliances', label: 'Appliances Repair' }
                        ].map(cat => {
                          const isSelected = (regData.vendorCategories || []).includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                let current = [...(regData.vendorCategories || [])];
                                if (isSelected) {
                                  current = current.filter(id => id !== cat.id);
                                } else if (current.length < 3) {
                                  current.push(cat.id);
                                } else {
                                  return Toast.fire({ icon: 'warning', title: 'Limit: 3 categories' });
                                }
                                setRegData({
                                  ...regData,
                                  vendorCategories: current,
                                  vendorCategory: current[0] || "" // First selection is primary
                                });
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight border transition-all ${isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div><label className={labelClass}>Exp. (Years)</label><input type="number" className={inputClass} value={regData.experience} onChange={e => setRegData({ ...regData, experience: e.target.value })} required /></div>
                  </div>
                  <div><label className={labelClass}>Email Address</label><input type="email" autoComplete="off" className={inputClass} value={regData.userEmail} onChange={e => setRegData({ ...regData, userEmail: e.target.value })} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClass}>Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={inputClass}
                        value={regData.userPassword}
                        onChange={e => setRegData({ ...regData, userPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[26px] text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label className={labelClass}>Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={inputClass}
                        value={regData.confirmPassword}
                        onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                        required
                      />
                      {/* Using same state for simplicity, or we can make separate state if needed. Usually users want to see both. */}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Local Address */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-2">Current / Local Address</h4>
                    <div className={`grid ${manualEntry.local ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                      <div><label className={labelClass}>Pincode</label><input type="number" className={inputClass} value={regData.localPincode} onChange={e => setRegData({ ...regData, localPincode: e.target.value })} required /></div>
                      {manualEntry.local ? (
                        <>
                          <div><label className={labelClass}>City</label><input type="text" className={inputClass} value={regData.localCity} onChange={e => setRegData({ ...regData, localCity: e.target.value })} required /></div>
                          <div><label className={labelClass}>State</label><input type="text" className={inputClass} value={regData.localState} onChange={e => setRegData({ ...regData, localState: e.target.value })} required /></div>
                        </>
                      ) : (
                        <div><label className={labelClass}>City/State</label><input type="text" value={`${regData.localCity}${regData.localState ? ', ' + regData.localState : ''}`} readOnly className="bg-slate-50 w-full p-2.5 border rounded text-slate-500 font-bold text-xs" /></div>
                      )}
                    </div>
                    <div><label className={labelClass}>Full Street Address</label><input type="text" className={inputClass} value={regData.localStreet} onChange={e => setRegData({ ...regData, localStreet: e.target.value })} required /></div>
                  </div>

                  <div className="flex items-center gap-2 py-2 border-y border-slate-50">
                    <input type="checkbox" id="same" className="w-4 h-4 cursor-pointer" onChange={handleSameAsLocal} />
                    <label htmlFor="same" className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter cursor-pointer">Same as local address</label>
                  </div>

                  {/* Permanent Address */}
                  <div className={`space-y-4 transition-all ${regData.isSameAsLocal ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-200 pl-2">Permanent Address</h4>
                    <div className={`grid ${manualEntry.permanent ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                      <div><label className={labelClass}>Pincode</label><input type="number" className={inputClass} value={regData.permanentPincode} onChange={e => setRegData({ ...regData, permanentPincode: e.target.value })} required={!regData.isSameAsLocal} /></div>
                      {manualEntry.permanent ? (
                        <>
                          <div><label className={labelClass}>City</label><input type="text" className={inputClass} value={regData.permanentCity} onChange={e => setRegData({ ...regData, permanentCity: e.target.value })} required={!regData.isSameAsLocal} /></div>
                          <div><label className={labelClass}>State</label><input type="text" className={inputClass} value={regData.permanentState} onChange={e => setRegData({ ...regData, permanentState: e.target.value })} required={!regData.isSameAsLocal} /></div>
                        </>
                      ) : (
                        <div><label className={labelClass}>City/State</label><input type="text" value={`${regData.permanentCity}${regData.permanentState ? ', ' + regData.permanentState : ''}`} readOnly className="bg-slate-50 w-full p-2.5 border rounded text-slate-500 font-bold text-xs" /></div>
                      )}
                    </div>
                    <div><label className={labelClass}>Full Street Address</label><input type="text" className={inputClass} value={regData.permanentStreet} onChange={e => setRegData({ ...regData, permanentStreet: e.target.value })} required={!regData.isSameAsLocal} /></div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Aadhar Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={inputClass}
                        value={regData.aadharNumber}
                        onChange={e => setRegData({ ...regData, aadharNumber: formatAadhar(e.target.value) })}
                        maxLength="14"
                        placeholder="XXXX XXXX XXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>PAN Number</label>
                      <input
                        type="text"
                        maxLength="10"
                        className={`${inputClass} uppercase ${regData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(regData.panNumber) && regData.panNumber.length === 10 ? 'border-red-500 text-red-600 focus:border-red-500' : ''}`}
                        value={regData.panNumber}
                        onChange={e => setRegData({ ...regData, panNumber: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        required
                      />
                      {regData.panNumber && regData.panNumber.length > 0 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(regData.panNumber) && (
                        <p className="text-[9px] text-red-500 mt-1 font-bold">
                          {regData.panNumber.length < 10 ? `${regData.panNumber.length}/10 Characters` : 'Invalid Format (Ex: ABCDE1234F)'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* KYC Document Uploads */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">KYC Documents (Required)</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      {[
                        { id: 'aadharFront', label: 'Aadhar Front' },
                        { id: 'aadharBack', label: 'Aadhar Back' },
                        { id: 'panCard', label: 'PAN Card' },
                        { id: 'experienceCert', label: 'Exp. Certificate' }
                      ].map(doc => (
                        <div key={doc.id} className="space-y-2">
                          <label className={labelClass}>{doc.label}</label>
                          <div className="relative group">
                            <div className="w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 relative">
                              {previews[doc.id] ? (
                                <>
                                  <img src={previews[doc.id]} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDoc(doc.id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all z-20"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <Camera size={20} className="text-slate-300 mb-1" />
                              )}
                              <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                accept="image/*"
                                onChange={(e) => handleDocChange(doc.id, e)}
                                title={previews[doc.id] ? "Click to replace" : "Click to upload"}
                              />
                            </div>
                            {previews[doc.id] && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl pointer-events-none">
                                <span className="text-white text-[8px] font-bold uppercase tracking-widest">Change</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Settlement Bank</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Bank Name</label><input type="text" className={`${inputClass} uppercase`} value={regData.bankName} onChange={e => setRegData({ ...regData, bankName: e.target.value.toUpperCase() })} required /></div>
                      <div><label className={labelClass}>IFSC Code</label><input type="text" maxLength="11" className={`${inputClass} uppercase`} value={regData.ifscCode} onChange={e => setRegData({ ...regData, ifscCode: e.target.value })} required /></div>
                    </div>
                    <div>
                      <label className={labelClass}>Account Number</label>
                      <input type="text" maxLength="18" className={inputClass} value={regData.accountNumber} onChange={e => setRegData({ ...regData, accountNumber: e.target.value.replace(/[^0-9]/g, '') })} required />
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Standard 9-18 digit account number only</p>
                    </div>
                  </div>
                  <div><label className={labelClass}>Alternate Phone (Optional)</label><input type="tel" maxLength="10" className={inputClass} value={regData.alternatePhone} onChange={e => setRegData({ ...regData, alternatePhone: e.target.value })} /></div>
                </div>
              )}

              {currentStep > 1 && (
                <div className="flex gap-4 pt-4 border-t mt-8">
                  <button type="button" disabled={loading} onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">Back</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-3 bg-indigo-600 text-white rounded font-bold shadow-indigo-100 shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      currentStep === 4 ? 'Submit Application' : 'Next Step'
                    )}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label className={labelClass}>Email or Mobile Number</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  className={inputClass}
                  onChange={e => setLoginData({ ...loginData, userEmail: e.target.value })}
                />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass}>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className={inputClass}
                    onChange={e => setLoginData({ ...loginData, userPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#2d308b] text-white rounded font-bold mt-4 uppercase tracking-widest text-xs">Sign In</button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="bg-[#2d308b] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Partner Reset</h3>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1 italic italic">Security Protocol</p>
              </div>
              <button onClick={() => setShowForgotModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                  <p className="text-xs font-medium text-indigo-700 leading-relaxed">
                    Enter your registered email below. Our support team will review your request and send reset instructions to your email.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Registered Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className={inputClass}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForgot}
                  className="flex-[2] py-4 bg-[#2d308b] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingForgot ? <RefreshCw className="animate-spin text-white" size={16} /> : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAuth;
