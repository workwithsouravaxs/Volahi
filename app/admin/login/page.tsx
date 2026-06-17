"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVolahiStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { verifyAdmin } from '@/lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const { loginAdmin, isAdminAuthenticated } = useVolahiStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      router.push('/admin');
    }
  }, [isAdminAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Query against Supabase database admins table
      const isAuthorized = await verifyAdmin(email, password);
      
      if (isAuthorized) {
        loginAdmin();
        setIsLoading(false);
        router.push('/admin');
        return;
      }
      
      setError('Unauthorized credentials. Access restricted to authorized administrators only.');
      setIsLoading(false);
    } catch (err) {
      // 2. Fallback to predefined local credentials if DB query fails (e.g. table not created yet)
      if (email === 'admin@volahi.com' && password === 'admin123') {
        loginAdmin();
        setIsLoading(false);
        router.push('/admin');
      } else {
        setError('Unauthorized credentials. Access restricted to authorized administrators only.');
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Editorial Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 via-primary to-neutral-200" />
      <div className="absolute top-10 left-10 text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">
        Volahi Couture / Security Gate
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white border border-neutral-100 p-12 shadow-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-heading uppercase tracking-tighter mb-3">Atelier Admin</h1>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cta" /> Secured Administrator Access
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-50/50 border border-red-100 text-red-700 text-xs font-semibold uppercase tracking-wider leading-relaxed text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-3">
              Admin Email Address
            </label>
            <div className="relative border-b border-neutral-200 py-2 focus-within:border-neutral-900 transition-all">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <input 
                type="email" 
                required
                className="w-full pl-8 bg-transparent border-none focus:outline-none text-xs font-bold tracking-widest placeholder:text-neutral-300"
                placeholder="ADMIN@VOLAHI.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-3">
              Administrator Key
            </label>
            <div className="relative border-b border-neutral-200 py-2 focus-within:border-neutral-900 transition-all">
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
            {isLoading ? 'VERIFYING...' : 'AUTHORIZE SESSION'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-neutral-100 text-center">
          <Link href="/" className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">
            ← Return to Couture Shop
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
