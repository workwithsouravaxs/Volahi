"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, Heart, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVolahiStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const { cart, wishlist, currentUser, isAdminAuthenticated } = useVolahiStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-body text-primary bg-white border-b border-neutral-100/80 shadow-[0_2px_12px_rgba(210,140,129,0.06)] ${
      isScrolled ? 'py-3.5 shadow-[0_4px_18px_rgba(210,140,129,0.1)]' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-16">
          <Link href="/" className="text-3xl font-heading font-bold tracking-tighter uppercase">
            Volahi
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.3em]">
            <Link href="/products?category=Designer Sarees" className="hover:text-cta transition-colors">Sarees</Link>
            <Link href="/products?category=Wedding Lehengas" className="hover:text-cta transition-colors">Lehengas</Link>
            <Link href="/products?category=Western Dresses" className="hover:text-cta transition-colors">Dresses</Link>
            <Link href="/products" className="hover:text-cta transition-colors">All Couture</Link>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center border-b border-neutral-200 py-1 transition-all focus-within:border-primary">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="SEARCH" 
              className="bg-transparent border-none focus:outline-none text-[9px] font-bold tracking-widest ml-3 w-24 lg:w-32 placeholder:text-neutral-300 uppercase"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </form>
          
          <div className="flex items-center gap-6">
            {/* Wishlist Link */}
            <Link href="/products" className="hover:text-cta transition-colors relative" title="Wishlist">
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cta text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Link */}
            <Link href="/cart" className="hover:text-cta transition-colors relative" title="Shopping bag">
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Patron Profile Link */}
            <Link 
              href={currentUser ? '/profile' : '/auth'} 
              className="hidden sm:block hover:text-cta transition-colors relative"
              title={currentUser ? `Profile: ${currentUser.name}` : 'Sign In'}
            >
              <User className={`w-5 h-5 ${currentUser ? 'text-cta' : ''}`} />
            </Link>

            {/* Admin Panel Gateway Link */}
            <Link 
              href="/admin" 
              className="hidden sm:block hover:text-cta transition-colors relative"
              title="Atelier Panel"
            >
              <Shield className={`w-4 h-4 ${isAdminAuthenticated ? 'text-green-600' : 'text-neutral-400'}`} />
            </Link>

            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 bg-white z-[60] p-12 flex flex-col justify-center text-primary"
          >
            <button 
              className="absolute top-10 right-10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col gap-8 font-heading text-4xl lowercase border-b border-neutral-100 pb-8">
              <Link href="/products?category=Designer Sarees" onClick={() => setIsMobileMenuOpen(false)}>Sarees</Link>
              <Link href="/products?category=Wedding Lehengas" onClick={() => setIsMobileMenuOpen(false)}>Lehengas</Link>
              <Link href="/products?category=Western Dresses" onClick={() => setIsMobileMenuOpen(false)}>Dresses</Link>
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>All Creations</Link>
            </div>
            
            <div className="flex flex-col gap-6 pt-8 font-bold text-xs uppercase tracking-widest">
              <Link href={currentUser ? '/profile' : '/auth'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <User className="w-4 h-4 text-cta" /> {currentUser ? `Patron Profile: ${currentUser.name}` : 'Sign In'}
              </Link>
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" /> Director Atelier Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
