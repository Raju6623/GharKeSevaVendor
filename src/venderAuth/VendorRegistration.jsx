import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, ArrowRight, CheckCircle2, Camera, MapPin, 
  CreditCard, Briefcase, Map, Loader2, User, Eye, EyeOff, Phone, IdCard, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorRegistration = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Registration state (Sync with Backend Schema)
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    userEmail: '',
    userPhone: '',
    userPassword: '',
    aadharNumber: '',
    panNumber: '',
    vendorCategory: '',
    vendorStreet: '',
    vendorCity: '',
    vendorState: '',
    vendorPincode: '',
    vendorPhoto: null
  });

  // Login state
  const [loginData, setLoginData] = useState({ userEmail: '', userPassword: '' });

  // Pincode Auto-fill Logic
  useEffect(() => {
    const fetchAddress = async () => {
      if (regData.vendorPincode && regData.vendorPincode.length === 6) {
        setPincodeLoading(true);
        try {
          const res = await axios.get(`https://api.postalpincode.in/pincode/${regData.vendorPincode}`);
          if (res.data[0].Status === "Success") {
            const details = res.data[0].PostOffice[0];
            setRegData(prev => ({
              ...prev,
              vendorCity: details.District,
              vendorState: details.State
            }));
          }
        } catch (err) {
          console.error("Pincode fetch failed");
        } finally {
          setPincodeLoading(false);
        }
      }
    };
    fetchAddress();
  }, [regData.vendorPincode]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegData({ ...regData, vendorPhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.vendorPhoto) return alert("Please upload a Profile Photo");
    
    setLoading(true);
    const formData = new FormData();
    Object.keys(regData).forEach(key => {
      formData.append(key, regData[key]);
    });

    try {
      const res = await axios.post('http://localhost:3001/api/auth/vendor/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Registration Successful! Now Login.`);
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/vendor/login', loginData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // Backend bhej raha hai res.data.user {id, name, role...}
        localStorage.setItem('vendorData', JSON.stringify(res.data.user));
        alert("Welcome back, " + res.data.user.name);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100"
      >
        
        {/* Left Side Info Panel */}
        <div className="w-full md:w-2/5 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-tight italic uppercase">
              {isLogin ? "PRO LOGIN" : "PARTNER JOIN"}
            </h2>
            <p className="mt-4 text-slate-400 font-medium text-sm leading-relaxed italic">
              Grow your local business with real-time job alerts and easy task management.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800">
             <div className="flex items-center gap-3 text-blue-500 font-bold uppercase tracking-widest text-[10px]">
                <Zap size={18} className="animate-pulse" />
                <span>Verified Expert Program</span>
             </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="mb-8 flex justify-between items-end">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <button 
                onClick={() => { setIsLogin(!isLogin); setShowPassword(false); }} 
                className="text-blue-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-blue-600"
            >
              {isLogin ? 'Join as Partner' : 'Login Here'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isLogin ? (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister} 
                className="space-y-4"
              >
                {/* Photo Upload Section */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
                      {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="Preview"/> : <Camera className="text-slate-400" size={24}/>}
                    </div>
                    <input type="file" id="regPhoto" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    <label htmlFor="regPhoto" className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <Camera size={14}/>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200 transition-all" onChange={(e) => setRegData({...regData, firstName: e.target.value})} required />
                    <input type="text" placeholder="Last Name" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200 transition-all" onChange={(e) => setRegData({...regData, lastName: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Professional Email" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200" onChange={(e) => setRegData({...regData, userEmail: e.target.value})} required />
                  <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200" onChange={(e) => setRegData({...regData, userPhone: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Aadhar No." maxLength="12" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200" onChange={(e) => setRegData({...regData, aadharNumber: e.target.value})} required />
                    <input type="text" placeholder="PAN Number" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200 uppercase" onChange={(e) => setRegData({...regData, panNumber: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200" onChange={(e) => setRegData({...regData, vendorCategory: e.target.value})} required>
                      <option value="">Category</option>
                      <option value="AC">AC specialist</option>
                      <option value="Plumbing">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="RO">RO Service</option>
                      <option value="PestControl">Pest Control</option>
                      <option value="HouseMaid">House Maid</option>
                      <option value="Painting">Painting</option>
                      <option value="SmartLock">Smart Lock</option>
                      <option value="Appliances">Appliances</option>
                  </select>
                  <div className="relative">
                    <input type="number" placeholder="Pincode" className="w-full px-5 py-4 bg-slate-100 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 transition-all" onChange={(e) => setRegData({...regData, vendorPincode: e.target.value})} required />
                    {pincodeLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-600" size={16}/>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={regData.vendorCity} readOnly className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-500 cursor-not-allowed" />
                    <input type="text" placeholder="State" value={regData.vendorState} readOnly className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-500 cursor-not-allowed" />
                </div>

                <input type="text" placeholder="Full Street Address" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-slate-200" onChange={(e) => setRegData({...regData, vendorStreet: e.target.value})} required />

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create Secure Password" 
                    className="w-full px-5 py-4 bg-slate-100 rounded-2xl outline-none font-bold text-sm border-2 border-slate-100 focus:border-blue-500 transition-all" 
                    onChange={(e) => setRegData({...regData, userPassword: e.target.value})} 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18}/> : 'Join as Partner'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin} 
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input type="email" placeholder="Email Address" required className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" onChange={(e) => setLoginData({...loginData, userEmail: e.target.value})} />
                </div>
                
                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      required 
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-blue-500/10 transition-all" 
                      onChange={(e) => setLoginData({...loginData, userPassword: e.target.value})} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <>Pro Login <ArrowRight size={16}/></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorRegistration;