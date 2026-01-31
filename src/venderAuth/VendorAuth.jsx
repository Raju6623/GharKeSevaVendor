import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, Lock, ArrowRight, CheckCircle2, Camera, Zap, User, Eye, EyeOff, Loader2, Phone, ShieldCheck, MapPin, CreditCard, UserCircle } from 'lucide-react';

// Aadhar Formatter (adds space every 4 digits)
const formatAadhar = (value) => {
  const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const parts = cleaned.match(/.{1,4}/g);
  if (parts) return parts.join(' ').substring(0, 14);
  return cleaned;
};

const VendorAuth = function () {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const navigate = useNavigate();

  const [regData, setRegData] = useState({
    firstName: '', lastName: '', userEmail: '', userPhone: '', alternatePhone: '',
    userPassword: '', aadharNumber: '', panNumber: '',
    gender: '', dob: '', experience: '',
    bankName: '', accountNumber: '', ifscCode: '',
    vendorCategory: '',
    // Address Split
    localStreet: '', localCity: '', localState: '', localPincode: '',
    permanentStreet: '', permanentCity: '', permanentState: '', permanentPincode: '',
    vendorPhoto: null,
    isSameAsLocal: false
  });

  const [loginData, setLoginData] = useState({ userEmail: '', userPassword: '' });

  // Toast configuration
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });

  // Pincode logic for Local Address
  useEffect(() => {
    const fetchLocalAddress = async () => {
      if (regData.localPincode.length === 6) {
        setPincodeLoading(true);
        try {
          const res = await axios.get(`https://api.postalpincode.in/pincode/${regData.localPincode}`);
          if (res.data[0].Status === "Success") {
            const details = res.data[0].PostOffice[0];
            setRegData(prev => ({ ...prev, localCity: details.District, localState: details.State }));
          }
        } catch (err) { console.error("Pincode fetch failed"); }
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
          const res = await axios.get(`https://api.postalpincode.in/pincode/${regData.permanentPincode}`);
          if (res.data[0].Status === "Success") {
            const details = res.data[0].PostOffice[0];
            setRegData(prev => ({ ...prev, permanentCity: details.District, permanentState: details.State }));
          }
        } catch (err) { console.error("Pincode fetch failed"); }
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegData({ ...regData, vendorPhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
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
    }
    if (currentStep === 3) {
      if (!regData.localStreet || !regData.localPincode || !regData.permanentStreet || !regData.permanentPincode) {
        Toast.fire({ icon: "warning", title: "Both addresses are required" });
        return false;
      }
    }
    if (currentStep === 4) {
      if (regData.aadharNumber.replace(/\s+/g, '').length !== 12) { Toast.fire({ icon: "warning", title: "Aadhar: 12 digits" }); return false; }
      if (regData.panNumber.length !== 10) { Toast.fire({ icon: "warning", title: "PAN: 10 chars" }); return false; }
      if (!regData.bankName || !regData.accountNumber || !regData.ifscCode) {
        Toast.fire({ icon: "warning", title: "Bank details required" });
        return false;
      }
      // Bank account length check (standard 9-18 digits)
      if (regData.accountNumber.length < 9 || regData.accountNumber.length > 18) {
        Toast.fire({ icon: "warning", title: "Invalid Account Number" });
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
    Object.keys(cleanedData).forEach(key => {
      // Don't append empty or internal UI states
      if (key !== 'isSameAsLocal' && cleanedData[key] !== null) {
        formData.append(key, cleanedData[key]);
      }
    });
    try {
      const res = await axios.post('http://localhost:3001/api/auth/vendor/register', formData);
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
      const res = await axios.post('http://localhost:3001/api/auth/vendor/login', loginData);
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
      Swal.fire({ icon: 'error', title: 'Login Failed', text: errorMsg });
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
              <span className="font-bold text-xl uppercase tracking-tighter">VendorPro</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Partner Registration</h2>
            <p className="text-indigo-100/60 text-sm">Join our network of skilled professionals.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-7/12 p-10 bg-white max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-bold text-slate-800">{isLogin ? 'Login' : `Step ${currentStep} of 4`}</h3>
            <button onClick={() => { setIsLogin(!isLogin); setCurrentStep(1); }} className="text-indigo-600 font-bold text-xs uppercase tracking-widest">
              {isLogin ? 'Join Now' : 'Back to Login'}
            </button>
          </div>

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
                  <div>
                    <label className={labelClass}>Mobile Number</label>
                    <input type="tel" value={regData.userPhone} disabled={otpSent || isMobileVerified} maxLength="10" className={inputClass} placeholder="10-digit number" onChange={e => setRegData({ ...regData, userPhone: e.target.value })} required />
                  </div>
                  {!otpSent ? (
                    <button type="button" onClick={handleSendOtp} className="w-full py-3 bg-[#2d308b] text-white rounded font-bold">Send OTP</button>
                  ) : !isMobileVerified && (
                    <div className="space-y-4">
                      <input type="text" maxLength="6" className={inputClass} placeholder="Enter Code" onChange={e => setOtpCode(e.target.value)} />
                      <button type="button" onClick={handleVerifyOtp} className="w-full py-3 bg-indigo-600 text-white rounded font-bold">Verify OTP</button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-50 border rounded-md flex items-center justify-center overflow-hidden shrink-0">
                      {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Camera size={20} className="text-slate-300" />}
                    </div>
                    <label className="text-[10px] font-black border-2 border-slate-200 px-4 py-2 cursor-pointer bg-white hover:border-indigo-600 transition-all uppercase tracking-widest">
                      Upload Photo *
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name</label><input type="text" className={inputClass} value={regData.firstName} onChange={e => setRegData({ ...regData, firstName: e.target.value })} required /></div>
                    <div><label className={labelClass}>Last Name</label><input type="text" className={inputClass} value={regData.lastName} onChange={e => setRegData({ ...regData, lastName: e.target.value })} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Gender</label><select className={inputClass} value={regData.gender} onChange={e => setRegData({ ...regData, gender: e.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                    <div><label className={labelClass}>DOB</label><input type="date" className={inputClass} value={regData.dob} onChange={e => setRegData({ ...regData, dob: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Expertise Categories (Select up to 3)</label>
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
                      {(!regData.vendorCategories || regData.vendorCategories.length === 0) && (
                        <p className="text-[9px] text-red-400 mt-2 font-bold uppercase tracking-tighter">* Required</p>
                      )}
                    </div>
                    <div><label className={labelClass}>Exp. (Years)</label><input type="number" className={inputClass} value={regData.experience} onChange={e => setRegData({ ...regData, experience: e.target.value })} required /></div>
                  </div>
                  <div><label className={labelClass}>Email Address</label><input type="email" className={inputClass} value={regData.userEmail} onChange={e => setRegData({ ...regData, userEmail: e.target.value })} required /></div>
                  <div><label className={labelClass}>Password</label><input type="password" className={inputClass} value={regData.userPassword} onChange={e => setRegData({ ...regData, userPassword: e.target.value })} required /></div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Local Address */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-2">Current / Local Address</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Pincode</label><input type="number" className={inputClass} value={regData.localPincode} onChange={e => setRegData({ ...regData, localPincode: e.target.value })} required /></div>
                      <div><label className={labelClass}>City/State</label><input type="text" value={`${regData.localCity}${regData.localState ? ', ' + regData.localState : ''}`} readOnly className="bg-slate-50 w-full p-2.5 border rounded text-slate-500 font-bold text-xs" /></div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Pincode</label><input type="number" className={inputClass} value={regData.permanentPincode} onChange={e => setRegData({ ...regData, permanentPincode: e.target.value })} required={!regData.isSameAsLocal} /></div>
                      <div><label className={labelClass}>City/State</label><input type="text" value={`${regData.permanentCity}${regData.permanentState ? ', ' + regData.permanentState : ''}`} readOnly className="bg-slate-50 w-full p-2.5 border rounded text-slate-500 font-bold text-xs" /></div>
                    </div>
                    <div><label className={labelClass}>Full Street Address</label><input type="text" className={inputClass} value={regData.permanentStreet} onChange={e => setRegData({ ...regData, permanentStreet: e.target.value })} required={!regData.isSameAsLocal} /></div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Aadhar Number</label><input type="text" className={inputClass} value={regData.aadharNumber} onChange={e => setRegData({ ...regData, aadharNumber: formatAadhar(e.target.value) })} maxLength="14" placeholder="XXXX XXXX XXXX" required /></div>
                    <div><label className={labelClass}>PAN Number</label><input type="text" maxLength="10" className={`${inputClass} uppercase`} value={regData.panNumber} onChange={e => setRegData({ ...regData, panNumber: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Settlement Bank</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Bank Name</label><input type="text" className={inputClass} value={regData.bankName} onChange={e => setRegData({ ...regData, bankName: e.target.value })} required /></div>
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
                  <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded font-bold hover:bg-slate-200">Back</button>
                  <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded font-bold shadow-indigo-100 shadow-lg hover:bg-indigo-700">
                    {currentStep === 4 ? 'Submit Application' : 'Next Step'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label className={labelClass}>Email</label><input type="email" required className={inputClass} onChange={e => setLoginData({ ...loginData, userEmail: e.target.value })} /></div>
              <div><label className={labelClass}>Password</label><input type="password" required className={inputClass} onChange={e => setLoginData({ ...loginData, userPassword: e.target.value })} /></div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#2d308b] text-white rounded font-bold mt-4 uppercase tracking-widest text-xs">Sign In</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorAuth;