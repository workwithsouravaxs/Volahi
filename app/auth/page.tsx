"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVolahiStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Heart, Phone } from 'lucide-react';

function CustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithDb, signupWithDb, currentUser } = useVolahiStore();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTarget = searchParams.get('redirect') || '/profile';

  // If already logged in, redirect
  React.useEffect(() => {
    if (currentUser) {
      router.push(redirectTarget);
    }
  }, [currentUser, router, redirectTarget]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all security fields.');
      setIsLoading(false);
      return;
    }

    const result = await loginWithDb(email.trim(), password);

    switch (result) {
      case 'success':
        // currentUser will be set by the store action, useEffect above will redirect
        break;
      case 'not_found':
        setError('No account found with this email address. Please create a new account.');
        break;
      case 'wrong_password':
        setError('Incorrect password. Please check your credentials and try again.');
        break;
      case 'error':
      default:
        setError('Authentication service is temporarily unavailable. Please try again.');
        break;
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password || !phone) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const result = await signupWithDb(email.trim(), password, name.trim(), phone.trim());

    switch (result) {
      case 'success':
        // currentUser will be set by the store action, useEffect above will redirect
        break;
      case 'already_exists':
        setError('An account with this email address already exists. Please sign in instead.');
        break;
      case 'error':
      default:
        setError('Unable to create your account. Please try again or contact support.');
        break;
    }

    setIsLoading(false);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your registered email address.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setSuccess('A confidential password recovery link has been dispatched to your email.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#FFF9F7] relative overflow-hidden flex flex-col justify-center">
      <Navbar />

      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto w-full flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white border border-neutral-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
          
          {/* Editorial Brand Half */}
          <div className="md:col-span-6 relative bg-neutral-900 overflow-hidden hidden md:flex flex-col justify-between p-12 text-white">
            <div className="absolute inset-0 opacity-40">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" 
                alt="Volahi Couture"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">Volahi Couture</span>
            </div>

            <div className="relative z-10 max-w-sm">
              <h2 className="text-4xl font-heading mb-6 leading-tight italic uppercase tracking-tighter">Become part of the Volahi Atelier</h2>
              <p className="text-xs text-neutral-300 tracking-widest leading-relaxed">
                Unlock complimentary white-glove deliveries, priority collection launches, and direct custom size allocations.
              </p>
            </div>

            <div className="relative z-10 text-[9px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-cta fill-cta" /> Premium Couture Lifestyle
            </div>
          </div>

          {/* Form Half */}
          <div className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
            
            {/* Tabs */}
            <div className="flex gap-8 border-b border-neutral-100 mb-10">
              <button 
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-primary'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setActiveTab('signup'); setError(''); setSuccess(''); }}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-neutral-400 hover:text-primary'}`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-700 text-xs font-semibold uppercase tracking-wider leading-relaxed text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50/50 border border-green-100 text-green-700 text-xs font-semibold uppercase tracking-wider leading-relaxed text-center">
                {success}
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'login' && (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2.5">
                      Email Address
                    </label>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="COUTURE@VOLAHI.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                        Password
                      </label>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('reset')}
                        className="text-[9px] text-cta font-bold uppercase tracking-[0.2em] hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="password" 
                        required
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-4 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:bg-neutral-300"
                  >
                    {isLoading ? 'VERIFYING CREDENTIALS...' : 'SIGN IN'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                    New to Volahi?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signup'); setError(''); }}
                      className="text-cta hover:underline"
                    >
                      Create an Account
                    </button>
                  </p>
                </motion.form>
              )}

              {activeTab === 'signup' && (
                <motion.form 
                  key="signup"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSignup}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2.5">
                      Your Full Name
                    </label>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="CHARLOTTE DUPONT"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2.5">
                      Email Address
                    </label>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="COUTURE@VOLAHI.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2.5">
                      Phone Number
                    </label>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="tel" 
                        required
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2.5">
                      Choose Password
                    </label>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="password" 
                        required
                        minLength={6}
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="•••••••• (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-4 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:bg-neutral-300"
                  >
                    {isLoading ? 'CREATING ATELIER ACCOUNT...' : 'REGISTER ACCOUNT'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                    Already a patron?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setError(''); }}
                      className="text-cta hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.form>
              )}

              {activeTab === 'reset' && (
                <motion.form 
                  key="reset"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleReset}
                  className="space-y-6"
                >
                  <p className="text-xs text-neutral-500 tracking-widest leading-relaxed mb-6">
                    Enter the email registered with your Volahi profile. We will forward dynamic recovery steps to authorize resetting your security key.
                  </p>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-2.5">
                      Email Address
                    </label>
                    <div className="relative border-b border-neutral-200 py-1.5 focus-within:border-neutral-900 transition-all">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                        placeholder="COUTURE@VOLAHI.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-primary text-white py-4 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:bg-neutral-300"
                    >
                      {isLoading ? 'DISPATCHING SECURE KEY...' : 'SEND RECOVERY LINK'} <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                      className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] hover:underline"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

        </div>
      </div>
    </main>
  );
}

export default function CustomerAuth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF9F7] flex items-center justify-center font-body text-primary">
        <div className="text-center font-heading text-xl uppercase tracking-widest animate-pulse">
          Loading Authorization...
        </div>
      </div>
    }>
      <CustomerAuthContent />
    </Suspense>
  );
}
