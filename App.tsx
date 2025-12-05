import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, BaseArea, VehicleOwner, VehicleType, Rider } from './types';
import { ApiService } from './services/mockBackend';
import { Button, Input, Card, Modal, Select } from './components/ui';
import { APP_NAME, CURRENCY_SYMBOL, SUBSCRIPTION_COST, SUBSCRIPTION_DAYS, DEFAULT_LAT, DEFAULT_LNG, VEHICLE_IMAGES } from './constants';
import { MapPin, Navigation, Phone, Menu, X, CheckCircle, AlertTriangle, LogOut, Car, LayoutDashboard, Settings, Loader2, Sun, Moon, Map as MapIcon, List, Edit2, Trash2, Key, CreditCard, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';

// --- Theme Component ---
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    const isDarkSystem = !('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDarkStored || isDarkSystem) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggle = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button onClick={toggle} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300" aria-label="Toggle Dark Mode">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// --- Reusable Payment Processor Component ---
const PaymentProcessor = ({ userId, isOpen, onClose, onSuccess }: { userId: string, isOpen: boolean, onClose: () => void, onSuccess: (user: User) => void }) => {
  const [status, setStatus] = useState<'idle' | 'creating' | 'waiting' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleInitiatePayment = async () => {
    setStatus('creating');
    setErrorMsg('');
    try {
      const res = await ApiService.createPaymentOrder(userId);
      if (res.success && res.data?.paymentLink) {
        // Open payment link
        window.open(res.data.paymentLink, '_blank');
        setStatus('waiting');
      } else {
        throw new Error(res.message || "Failed to generate payment link.");
      }
    } catch (e: any) {
      console.error("Payment Init Error:", e);
      setStatus('error');
      setErrorMsg(e.message || "Could not connect to payment gateway.");
    }
  };

  const handleVerifyPayment = async () => {
    setStatus('verifying');
    try {
      const res = await ApiService.confirmPayment(userId);
      if (res.success && res.data) {
        setStatus('success');
        setTimeout(() => {
          onSuccess(res.data!);
          onClose();
        }, 2000);
      } else {
        throw new Error(res.message || "Payment verification failed.");
      }
    } catch (e: any) {
      console.error("Payment Verify Error:", e);
      setStatus('error');
      setErrorMsg(e.message || "Could not verify payment. If amount was deducted, please contact support.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renew Subscription">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="text-center space-y-2">
          <p className="text-slate-600 dark:text-slate-300">
            Pay <strong>{CURRENCY_SYMBOL}{SUBSCRIPTION_COST}</strong> to extend service for <strong>{SUBSCRIPTION_DAYS} days</strong>.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs text-left space-y-1 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Gateway</span>
              <span className="font-medium dark:text-slate-200">Cashfree (Secure)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Plan</span>
              <span className="font-medium dark:text-slate-200">Standard Renewal</span>
            </div>
          </div>
        </div>

        {/* Action Area based on Status */}
        <div className="space-y-4">
          
          {status === 'idle' && (
            <Button onClick={handleInitiatePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Pay Now Securely
            </Button>
          )}

          {status === 'creating' && (
             <div className="flex flex-col items-center py-4 space-y-2 text-slate-500">
               <Loader2 className="animate-spin text-blue-600" size={32} />
               <p>Creating Secure Order...</p>
             </div>
          )}

          {status === 'waiting' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center space-y-4 animate-in fade-in">
              <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ExternalLink size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Payment Page Opened</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Please complete the payment in the new browser tab.</p>
              </div>
              <Button onClick={handleVerifyPayment} variant="secondary" className="w-full">
                I Have Completed Payment
              </Button>
              <button onClick={handleInitiatePayment} className="text-xs text-slate-400 hover:underline">
                Link didn't open? Click to retry
              </button>
            </div>
          )}

          {status === 'verifying' && (
             <div className="flex flex-col items-center py-4 space-y-2 text-slate-500">
               <Loader2 className="animate-spin text-green-600" size={32} />
               <p>Verifying Transaction...</p>
             </div>
          )}

          {status === 'success' && (
             <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center space-y-2 animate-in zoom-in">
               <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                 <CheckCircle size={24} />
               </div>
               <h4 className="font-bold text-green-700 dark:text-green-300">Payment Successful!</h4>
               <p className="text-sm text-green-600 dark:text-green-400">Your subscription has been renewed.</p>
             </div>
          )}

          {status === 'error' && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center space-y-3 animate-in shake">
               <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                 <AlertTriangle size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-red-700 dark:text-red-300">Transaction Failed</h4>
                 <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
               </div>
               <div className="flex gap-2">
                 <Button onClick={() => setStatus('waiting')} variant="outline" className="flex-1 text-xs">Try Verify Again</Button>
                 <Button onClick={handleInitiatePayment} variant="primary" className="flex-1 text-xs">New Payment</Button>
               </div>
             </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// --- Profile Modal Component ---
const ProfileModal = ({ user, isOpen, onClose, onUpdate }: { user: User, isOpen: boolean, onClose: () => void, onUpdate: (u: User) => void }) => {
  const [formData, setFormData] = useState<Partial<User & VehicleOwner>>({});
  const [loading, setLoading] = useState(false);
  const [baseAreas, setBaseAreas] = useState<BaseArea[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...user });
      setNewPassword('');
      setShowPassword(false);
      if (user.role === UserRole.OWNER) {
        ApiService.getBaseAreas().then(res => res.data && setBaseAreas(res.data));
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Profile Data
      const res = await ApiService.updateProfile(user.id, formData);
      if (res.success && res.data) {
        // 2. Update Password if provided
        if (newPassword) {
           const pwdRes = await ApiService.changePassword(user.id, newPassword);
           if (!pwdRes.success) {
             alert(`Profile updated, but password change failed: ${pwdRes.message}`);
           } else {
             alert("Profile and password updated successfully!");
           }
        } else {
           alert("Profile updated successfully!");
        }
        onUpdate(res.data);
        onClose();
      } else {
        alert(res.message || "Update failed");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Full Name" 
          value={formData.name || ''} 
          onChange={e => setFormData({ ...formData, name: e.target.value })} 
          required 
        />
        <Input 
          label="Phone Number" 
          value={formData.phone || ''} 
          onChange={e => setFormData({ ...formData, phone: e.target.value })} 
          required 
        />
        
        {user.role === UserRole.OWNER && (
          <>
             <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
               <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Vehicle Details</h4>
               <div className="space-y-4">
                <Select 
                  label="Vehicle Type" 
                  value={formData.vehicleType || ''}
                  onChange={e => setFormData({...formData, vehicleType: e.target.value as VehicleType})}
                  options={Object.values(VehicleType).map(t => ({ label: t, value: t }))}
                />
                <Select 
                  label="Base Area" 
                  value={formData.baseArea || ''}
                  onChange={e => setFormData({...formData, baseArea: e.target.value})}
                  options={[{label: 'Select Area', value: ''}, ...baseAreas.map(b => ({ label: b.name, value: b.id }))]}
                  required
                />
                <Input 
                  label="Vehicle Number" 
                  value={formData.vehicleNumber || ''} 
                  onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} 
                />
               </div>
             </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-2">
             <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Security</h4>
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-amber-600 dark:text-amber-500 font-medium">
               {showPassword ? 'Cancel Change' : 'Change Password'}
             </button>
           </div>
           {showPassword && (
             <Input 
               label="New Password" 
               type="password"
               placeholder="Enter new password" 
               value={newPassword} 
               onChange={e => setNewPassword(e.target.value)}
             />
           )}
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>Save Changes</Button>
      </form>
    </Modal>
  );
};

// --- Sub-Components (Views) ---

// 1. Landing Page
const LandingView = ({ onNavigate }: { onNavigate: (view: string) => void }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <header className="p-6 flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 border-b dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
        <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">{APP_NAME}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button variant="outline" onClick={() => onNavigate('login')} className="!py-2 text-sm">Sign In</Button>
      </div>
    </header>
    
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4 max-w-md">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Your Ride, <span className="text-amber-500">Your Way.</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Connect directly with local vehicle owners. No middlemen, transparent pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <Card className="hover:border-amber-500 cursor-pointer transition-colors group dark:bg-slate-900 dark:border-slate-800" onClick={() => onNavigate('register-rider')}>
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Navigation size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1 dark:text-white">I need a Ride</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Find bikes, autos, and cars near you.</p>
          </div>
        </Card>

        <Card className="hover:border-amber-500 cursor-pointer transition-colors group dark:bg-slate-900 dark:border-slate-800" onClick={() => onNavigate('register-owner')}>
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1 dark:text-white">I have a Vehicle</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Register your vehicle and start earning.</p>
          </div>
        </Card>
      </div>
    </main>

    <footer className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
      &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </footer>
  </div>
);

// 2. Auth View (Login / Register / Forgot Password)
const AuthView = ({ mode, role, onLoginSuccess, onBack, onNavigate }: { mode: 'login' | 'register', role?: UserRole, onLoginSuccess: (user: User) => void, onBack: () => void, onNavigate: (view: string) => void }) => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '', vehicleType: VehicleType.AUTO, baseArea: '', vehicleNumber: '' });
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [baseAreas, setBaseAreas] = useState<BaseArea[]>([]);

  useEffect(() => {
    if (mode === 'register' && role === UserRole.OWNER) {
      ApiService.getBaseAreas().then(res => res.data && setBaseAreas(res.data));
    }
    // Reset internal state when mode changes
    setIsForgot(false);
    setError('');
    setSuccessMsg('');
  }, [mode, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isForgot) {
        // Forgot Password Flow
        const res = await ApiService.resetPassword(formData.email);
        if (res.success) {
          setSuccessMsg('Password reset link has been sent to your email.');
        } else {
          setError(res.message || 'Failed to send reset link.');
        }
      } else if (mode === 'login') {
        // Login Flow
        const res = await ApiService.login(formData.email, formData.password);
        if (res.success && res.data) onLoginSuccess(res.data);
        else setError(res.message || 'Login failed');
      } else {
        // Registration Flow
        const res = await ApiService.registerUser(
          { role, name: formData.name, email: formData.email, phone: formData.phone },
          formData.password,
          role === UserRole.OWNER ? { vehicleType: formData.vehicleType, baseArea: formData.baseArea, vehicleNumber: formData.vehicleNumber } : undefined
        );
        if (res.success && res.data) onLoginSuccess(res.data);
        else setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isForgot) return 'Recover Password';
    if (mode === 'login') return 'Welcome Back';
    return `Join as ${role === UserRole.OWNER ? 'Partner' : 'Rider'}`;
  };

  const getSubtitle = () => {
    if (isForgot) return 'Enter your email to receive a reset link.';
    if (mode === 'login') return 'Enter your details to access your account.';
    return 'Create an account to get started.';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex flex-col transition-colors duration-300">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={isForgot ? () => setIsForgot(false) : onBack} className="w-fit !px-2 !py-1 text-xs">← Back</Button>
          <ThemeToggle />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{getTitle()}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{getSubtitle()}</p>
        </div>

        {successMsg ? (
           <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center space-y-4">
             <CheckCircle className="mx-auto w-10 h-10"/>
             <p>{successMsg}</p>
             <Button onClick={() => { setIsForgot(false); setSuccessMsg(''); }} variant="outline" className="w-full">Back to Sign In</Button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common Email Field */}
            <Input label="Email Address" type="email" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            
            {!isForgot && (
              <>
                {mode === 'register' && (
                  <>
                    <Input label="Full Name" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <Input label="Phone Number" placeholder="9876543210" type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </>
                )}
                
                <Input label="Password" type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

                {mode === 'register' && role === UserRole.OWNER && (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300">Vehicle Details</h3>
                    <Select 
                      label="Vehicle Type" 
                      value={formData.vehicleType}
                      onChange={e => setFormData({...formData, vehicleType: e.target.value as VehicleType})}
                      options={Object.values(VehicleType).map(t => ({ label: t, value: t }))}
                    />
                    <Select 
                      label="Base Area" 
                      value={formData.baseArea}
                      onChange={e => setFormData({...formData, baseArea: e.target.value})}
                      options={[{label: 'Select Area', value: ''}, ...baseAreas.map(b => ({ label: b.name, value: b.id }))]}
                      required
                    />
                    <Input label="Vehicle Number (Optional)" placeholder="KA-01-AB-1234" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} />
                  </div>
                )}
              </>
            )}

            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}

            <Button type="submit" className="w-full" isLoading={loading}>
              {isForgot ? 'Send Reset Link' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>

            {/* Navigation Links */}
            {!isForgot && (
              <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 space-y-4">
                {mode === 'login' && (
                  <button type="button" onClick={() => setIsForgot(true)} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                    Forgot Password?
                  </button>
                )}
                
                {mode === 'login' ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p>Don't have an account?</p>
                    <div className="flex gap-4 justify-center items-center">
                      <button type="button" onClick={() => onNavigate('register-rider')} className="text-amber-600 dark:text-amber-500 hover:underline font-semibold">Register as Rider</button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button type="button" onClick={() => onNavigate('register-owner')} className="text-amber-600 dark:text-amber-500 hover:underline font-semibold">Partner Sign Up</button>
                    </div>
                  </div>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button type="button" onClick={() => onNavigate('login')} className="text-amber-600 dark:text-amber-500 hover:underline font-semibold">Sign In</button>
                  </p>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

// 3. Admin Dashboard
const AdminDashboard = ({ user, onUpdateUser, onLogout }: { user: User, onUpdateUser: (u: User) => void, onLogout: () => void }) => {
  const [areas, setAreas] = useState<BaseArea[]>([]);
  const [areaName, setAreaName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const fetchAreas = useCallback(async () => {
    const res = await ApiService.getBaseAreas();
    if (res.data) setAreas(res.data);
  }, []);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  const handleSubmit = async () => {
    if (!areaName.trim()) return;
    setLoading(true);
    
    if (editingId) {
      await ApiService.updateBaseArea(editingId, areaName);
      setEditingId(null);
    } else {
      await ApiService.addBaseArea(areaName);
    }
    
    setAreaName('');
    await fetchAreas();
    setLoading(false);
  };

  const handleDeleteArea = async (id: string) => {
    if(!confirm("Delete this area?")) return;
    await ApiService.deleteBaseArea(id);
    await fetchAreas();
  };

  const handleEditClick = (area: BaseArea) => {
    setEditingId(area.id);
    setAreaName(area.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAreaName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="!p-2" onClick={() => setProfileModalOpen(true)}>
               <Settings size={20} className="text-slate-600 dark:text-slate-300" />
            </Button>
            <Button variant="outline" onClick={onLogout} className="!py-2"><LogOut size={16} /> Logout</Button>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Manage Base Areas</h2>
          <div className="flex gap-2 mb-6">
            <Input 
              placeholder={editingId ? "Update Area Name" : "New Area Name"} 
              value={areaName} 
              onChange={e => setAreaName(e.target.value)} 
            />
            {editingId && (
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            )}
            <Button onClick={handleSubmit} isLoading={loading}>
              {editingId ? "Update" : "Add"}
            </Button>
          </div>
          <div className="space-y-2">
            {areas.map(area => (
              <div key={area.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="font-medium dark:text-slate-200">{area.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(area)} className="p-2 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteArea(area.id)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <ProfileModal 
          user={user} 
          isOpen={profileModalOpen} 
          onClose={() => setProfileModalOpen(false)} 
          onUpdate={onUpdateUser} 
        />
      </div>
    </div>
  );
};

// 4. Owner Dashboard
const OwnerDashboard = ({ user, onUpdateUser, onLogout }: { user: VehicleOwner, onUpdateUser: (u: User) => void, onLogout: () => void }) => {
  const [isAvailable, setIsAvailable] = useState(user.isAvailable);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  // Safe Expiry Check: If date is missing/invalid, treat as expired (unless free logic is handled by backend, but backend sets "" for expired)
  const expiryDate = new Date(user.expiresAt);
  const isValidDate = !isNaN(expiryDate.getTime());
  const daysLeft = isValidDate ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  const isExpired = !isValidDate || daysLeft <= 0;

  const toggleStatus = async () => {
    if (isExpired) {
      setPaymentModalOpen(true);
      return;
    }
    
    setIsToggling(true);
    let lat = user.lat || DEFAULT_LAT;
    let lng = user.lng || DEFAULT_LNG;

    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }
    } catch (e) {
      console.warn("Using last known location:", e);
    }

    const newState = !isAvailable;
    setIsAvailable(newState); // Optimistic UI update

    const res = await ApiService.toggleAvailability(user.id, newState, lat, lng);
    
    if (res.success) {
      onUpdateUser({ ...user, isAvailable: newState, lat, lng } as VehicleOwner);
    } else {
      setIsAvailable(!newState); // Revert
      alert("Failed to update status. Please try again.");
    }
    setIsToggling(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b dark:border-slate-800">
        <h1 className="font-bold text-lg dark:text-white">Owner Panel</h1>
        <div className="flex items-center gap-3">
           <ThemeToggle />
           <Button variant="outline" className="!p-2" onClick={() => setProfileModalOpen(true)}>
             <Settings size={20} className="text-slate-600 dark:text-slate-300" />
           </Button>
           <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
             <span className="text-sm font-medium dark:text-slate-200">{isAvailable ? 'Online' : 'Offline'}</span>
           </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {isExpired && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl flex flex-col gap-2">
             <div className="flex items-center gap-2 font-bold"><AlertTriangle size={20}/> Subscription Expired</div>
             <p className="text-sm">You cannot go online until you renew your subscription.</p>
             <Button onClick={() => setPaymentModalOpen(true)} variant="danger" className="w-full mt-2">Renew Now ({CURRENCY_SYMBOL}{SUBSCRIPTION_COST})</Button>
          </div>
        )}

        <Card className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className={`p-6 rounded-full ${isAvailable ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'} transition-colors`}>
            <Car size={48} />
          </div>
          <div className="text-center">
             <h2 className="text-xl font-bold dark:text-white">{user.vehicleType} • {user.baseArea}</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user.vehicleNumber || 'No Number'}</p>
          </div>
          <Button 
            onClick={toggleStatus} 
            variant={isAvailable ? 'secondary' : 'primary'} 
            className="w-full max-w-xs"
            disabled={isExpired || isToggling}
            isLoading={isToggling}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </Button>
        </Card>

        {/* Ride Activity Placeholder */}
        <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col justify-between">
               <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Profile Views</p>
                  <p className="text-2xl font-bold dark:text-white mt-1">--</p>
               </div>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
               <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Rides</p>
                  <p className="text-2xl font-bold dark:text-white mt-1">--</p>
               </div>
            </Card>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 flex gap-3">
          <BarChart3 className="shrink-0" size={20}/>
          <div>
            <p className="font-semibold mb-1">Ride Tracking</p>
            <p className="text-xs opacity-90">Automated tracking is in development. Currently, riders will contact you directly via phone call.</p>
          </div>
        </div>

        <Card className="p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Subscription</h3>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <p className={`font-medium ${isExpired ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'}`}>{!isExpired ? 'Active' : 'Expired'}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="text-right">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Days Left</p>
                 <p className="text-2xl font-bold dark:text-white">{Math.max(0, daysLeft)}</p>
               </div>
               {/* Explicit Renew Button for Active Users */}
               <Button 
                 variant="outline" 
                 onClick={() => setPaymentModalOpen(true)} 
                 className="!py-1 !px-3 text-xs"
               >
                 Extend
               </Button>
            </div>
          </div>
        </Card>

        <Button variant="outline" onClick={onLogout} className="w-full text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20">Log Out</Button>
      </main>

      {/* Modals */}
      <PaymentProcessor 
        userId={user.id} 
        isOpen={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        onSuccess={onUpdateUser} 
      />

      <ProfileModal 
        user={user} 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        onUpdate={onUpdateUser} 
      />
    </div>
  );
};

// 5. Rider Dashboard
const RiderDashboard = ({ user, onUpdateUser, onLogout }: { user: Rider, onUpdateUser: (u: User) => void, onLogout: () => void }) => {
  const [vehicles, setVehicles] = useState<VehicleOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOwner | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    // Show loading only on first fetch or list view, to avoid flicker on map polling
    if(vehicles.length === 0) setLoading(true);
    const res = await ApiService.getVehiclesNearby(DEFAULT_LAT, DEFAULT_LNG);
    if (res.data) setVehicles(res.data);
    setLoading(false);
  }, []); // Remove dependency on 'vehicles.length' to allow proper polling, handled inside.

  useEffect(() => { fetchVehicles(); }, []);

  // Polling for Map View
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (view === 'map') {
      fetchVehicles(); // Fetch immediately on switch
      intervalId = setInterval(fetchVehicles, 10000); // Poll every 10 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [view, fetchVehicles]);

  // Subscription Logic
  const expiryDate = new Date(user.expiresAt);
  const isValidDate = !isNaN(expiryDate.getTime());
  const daysLeft = isValidDate ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  const isExpired = !isValidDate || daysLeft <= 0;

  // Helper to position pins on the mock map (relative to DEFAULT_LAT/LNG)
  const getMapMarkerStyle = (lat: number, lng: number) => {
    // Zoom level: approx 0.05 degrees variance from center (roughly 5km radius)
    const RANGE = 0.05; 
    const xPercent = 50 + ((lng - DEFAULT_LNG) / RANGE) * 50;
    const yPercent = 50 - ((lat - DEFAULT_LAT) / RANGE) * 50;
    
    // Clamp to keep within view
    return {
      left: `${Math.min(95, Math.max(5, xPercent))}%`,
      top: `${Math.min(95, Math.max(5, yPercent))}%`
    };
  };

  // Mock Distance Calculation (approximate)
  const getDistance = (v: VehicleOwner) => {
    const R = 6371; // km
    const dLat = (v.lat - DEFAULT_LAT) * Math.PI / 180;
    const dLon = (v.lng - DEFAULT_LNG) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(DEFAULT_LAT * Math.PI / 180) * Math.cos(v.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b dark:border-slate-800">
        <h1 className="font-bold text-lg dark:text-white">{APP_NAME}</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Subscription Button */}
          <Button variant="outline" className={`!p-2 ${isExpired ? 'text-red-500 border-red-200 dark:border-red-900' : 'text-slate-600 dark:text-slate-300'}`} onClick={() => setSubscriptionModalOpen(true)}>
             <CreditCard size={20} />
          </Button>
          
          <Button variant="outline" className="!p-2" onClick={() => setView(view === 'list' ? 'map' : 'list')}>
             {view === 'list' ? <MapIcon size={20} className="text-slate-600 dark:text-slate-300"/> : <List size={20} className="text-slate-600 dark:text-slate-300"/>}
          </Button>
          <Button variant="outline" className="!p-2" onClick={() => setProfileModalOpen(true)}>
             <Settings size={20} className="text-slate-600 dark:text-slate-300" />
          </Button>
          <Button variant="outline" onClick={onLogout} className="!p-2 text-red-500"><LogOut size={20}/></Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Expiration Banner */}
        {isExpired && (
          <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Subscription Expired</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Your plan has ended. Renew now to continue finding rides.</p>
            <Button onClick={() => setSubscriptionModalOpen(true)} className="w-full max-w-xs">Renew Subscription</Button>
          </div>
        )}

        {view === 'map' ? (
          <div className="flex-1 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
             
             {/* Map Grid / Background decoration */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
                }}>
             </div>

             {/* User Location Center */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
               <div className="w-32 h-32 bg-amber-500/10 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
               <div className="w-4 h-4 bg-slate-900 dark:bg-white rounded-full ring-4 ring-slate-200 dark:ring-slate-700 shadow-xl relative z-10"></div>
             </div>
             
             {/* Vehicle Pins */}
             {vehicles.map(v => (
               <div 
                 key={v.id}
                 className="absolute w-10 h-10 -ml-5 -mt-5 cursor-pointer group z-10 transition-all duration-1000 ease-in-out"
                 style={getMapMarkerStyle(v.lat || DEFAULT_LAT, v.lng || DEFAULT_LNG)}
                 onClick={() => setSelectedVehicle(v)}
               >
                 <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center transition-transform group-hover:scale-110 ${v.vehicleType === VehicleType.AUTO ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}>
                    {v.vehicleType === VehicleType.AUTO ? '🛺' : '🚗'} 
                 </div>
                 
                 {/* Tooltip */}
                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                    <span className="font-bold block">{v.name}</span>
                    <span className="opacity-75">{v.vehicleType}</span>
                 </div>
               </div>
             ))}

             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-medium text-slate-600 dark:text-slate-300 pointer-events-none">
               Live Updates Active • {vehicles.length} Vehicles
             </div>
             
             <Button className="absolute bottom-6 right-6 shadow-xl !rounded-full !p-3" onClick={fetchVehicles}>
               <Loader2 size={20} className={loading ? "animate-spin" : ""} />
             </Button>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Available Vehicles Nearby</h2>
            {loading && vehicles.length === 0 ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-500"/></div>
            ) : vehicles.length === 0 ? (
               <div className="text-center py-12 text-slate-500 dark:text-slate-400">No vehicles found nearby.</div>
            ) : (
              vehicles.map(v => (
                <Card key={v.id} onClick={() => setSelectedVehicle(v)} className="flex items-center gap-4 cursor-pointer hover:border-amber-500 transition-colors">
                   <img src={VEHICLE_IMAGES[v.vehicleType]} alt={v.vehicleType} className="w-20 h-20 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <h3 className="font-bold text-slate-900 dark:text-white">{v.vehicleType}</h3>
                       <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">{getDistance(v)} km</span>
                     </div>
                     <p className="text-sm text-slate-500 dark:text-slate-400">{v.name}</p>
                     <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{v.baseArea}</p>
                   </div>
                </Card>
              ))
            )}
          </main>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      <Modal isOpen={!!selectedVehicle} onClose={() => setSelectedVehicle(null)} title="Vehicle Details">
         {selectedVehicle && (
           <div className="space-y-6">
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                <img src={VEHICLE_IMAGES[selectedVehicle.vehicleType]} className="w-full h-full object-cover" alt="Vehicle"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <p className="text-xs text-slate-500 dark:text-slate-400">Driver</p>
                   <p className="font-semibold dark:text-white">{selectedVehicle.name}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <p className="text-xs text-slate-500 dark:text-slate-400">Type</p>
                   <p className="font-semibold dark:text-white">{selectedVehicle.vehicleType}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <p className="text-xs text-slate-500 dark:text-slate-400">Base</p>
                   <p className="font-semibold dark:text-white">{selectedVehicle.baseArea}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                   <p className="text-xs text-slate-500 dark:text-slate-400">Distance</p>
                   <p className="font-semibold dark:text-white">{getDistance(selectedVehicle)} km</p>
                </div>
              </div>

              <div className="flex gap-3">
                 <a href={`tel:${selectedVehicle.phone}`} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 font-bold transition-colors">
                   <Phone size={20}/> Call Driver
                 </a>
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVehicle.lat},${selectedVehicle.lng}`} target="_blank" rel="noreferrer" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 font-bold transition-colors">
                   <Navigation size={20}/> Navigate
                 </a>
              </div>
           </div>
         )}
      </Modal>

      {/* Reused Payment Processor Modal */}
      <PaymentProcessor 
        userId={user.id} 
        isOpen={subscriptionModalOpen} 
        onClose={() => setSubscriptionModalOpen(false)} 
        onSuccess={onUpdateUser} 
      />

      <ProfileModal 
        user={user} 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        onUpdate={onUpdateUser} 
      />
    </div>
  );
};


// 6. Main App Component
const App = () => {
  const [view, setView] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);

  // Initialize theme
  useEffect(() => {
     const savedTheme = localStorage.getItem('theme');
     if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
     } else {
        document.documentElement.classList.remove('dark');
     }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.role === UserRole.ADMIN) setView('dashboard-admin');
    else if (u.role === UserRole.OWNER) setView('dashboard-owner');
    else setView('dashboard-rider');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderView = () => {
    switch(view) {
      case 'landing': return <LandingView onNavigate={setView} />;
      
      case 'login': 
        return <AuthView mode="login" onLoginSuccess={handleLogin} onBack={() => setView('landing')} onNavigate={setView} />;
      
      case 'register-rider': 
        return <AuthView mode="register" role={UserRole.RIDER} onLoginSuccess={handleLogin} onBack={() => setView('landing')} onNavigate={setView} />;
      
      case 'register-owner': 
        return <AuthView mode="register" role={UserRole.OWNER} onLoginSuccess={handleLogin} onBack={() => setView('landing')} onNavigate={setView} />;
      
      case 'dashboard-admin': 
        return user ? <AdminDashboard user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} /> : <LandingView onNavigate={setView} />;
      
      case 'dashboard-owner': 
        return user ? <OwnerDashboard user={user as VehicleOwner} onUpdateUser={handleUpdateUser} onLogout={handleLogout} /> : <LandingView onNavigate={setView} />;
      
      case 'dashboard-rider': 
        return user ? <RiderDashboard user={user as Rider} onUpdateUser={handleUpdateUser} onLogout={handleLogout} /> : <LandingView onNavigate={setView} />;
        
      default: return <LandingView onNavigate={setView} />;
    }
  };

  return <>{renderView()}</>;
};

export default App;