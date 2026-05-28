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

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-body text-primary bg-white border-b border-neutral-100/80 shadow-[0_2px_12px_rgba(210,140,129,0.06)] ${
      isScrolled ? 'py-3.5 shadow-[0_4px_18px_rgba(210,140,129,0.1)]' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-16">
          <Link href="/" className="text-3xl font-heading font-bold tracking-tighter uppercase">
            Volahi
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em]">
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
            <Link href="/products" className="hover:text-cta transition-colors relative" title="Wishlist">
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cta text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="hover:text-cta transition-colors relative" title="Shopping bag">
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <Link 
              href={currentUser ? '/profile' : '/auth'} 
              className="hidden sm:block hover:text-cta transition-colors relative"
              title={currentUser ? `Profile: ${currentUser.name}` : 'Sign In'}
            >
              <User className={`w-5 h-5 ${currentUser ? 'text-cta' : ''}`} />
            </Link>

            <Link 
              href="/admin" 
              className="hidden sm:block hover:text-cta transition-colors relative"
              title="Atelier Panel"
            >
              <Shield className={`w-4 h-4 ${isAdminAuthenticated ? 'text-green-600' : 'text-neutral-400'}`} />
            </Link>

            <button 
              className="md:hidden p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[59]"
              onClick={closeMobile}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white z-[60] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <Link href="/" onClick={closeMobile} className="text-2xl font-heading font-bold tracking-tighter uppercase text-primary">
                  Volahi
                </Link>
                <button
                  onClick={closeMobile}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 border-b border-neutral-100">
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    closeMobile();
                  }}
                  className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5 focus-within:border-primary transition-colors"
                >
                  <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search pieces..."
                    className="bg-transparent border-none focus:outline-none text-xs font-semibold w-full text-primary placeholder:text-neutral-400"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                  />
                </form>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-6 pt-6 pb-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-400 mb-4">Shop</p>
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/products"
                      onClick={closeMobile}
                      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-bold tracking-wide text-primary"
                    >
                      All Couture
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">View All</span>
                    </Link>
                    <Link
                      href="/products?category=Designer Sarees"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Designer Sarees
                    </Link>
                    <Link
                      href="/products?category=Wedding Lehengas"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Wedding Lehengas
                    </Link>
                    <Link
                      href="/products?category=Ethnic Suits"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Ethnic Suits
                    </Link>
                    <Link
                      href="/products?category=Western Dresses"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Western Dresses
                    </Link>
                    <Link
                      href="/products?category=Party Gowns"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Party Gowns
                    </Link>
                    <Link
                      href="/products?category=Co-ord Sets"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Co-ord Sets
                    </Link>
                    <Link
                      href="/products?category=Luxury Loungewear"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Luxury Loungewear
                    </Link>
                    <Link
                      href="/products?category=Winter Collection"
                      onClick={closeMobile}
                      className="py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold tracking-wide text-neutral-700 block"
                    >
                      Winter Collection
                    </Link>
                  </div>
                </div>

                <div className="mx-6 my-4 border-t border-neutral-100" />

                <div className="px-6 pb-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-400 mb-4">Account</p>
                  <div className="flex flex-col gap-1">
                    <Link
                      href={currentUser ? '/profile' : '/auth'}
                      onClick={closeMobile}
                      className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${currentUser ? 'bg-cta/10' : 'bg-neutral-100'}`}>
                        <User className={`w-4 h-4 ${currentUser ? 'text-cta' : 'text-neutral-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary tracking-wide">
                          {currentUser ? 'My Profile' : 'Sign In'}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-semibold">
                          {currentUser ? currentUser.name : 'Access your account'}
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeMobile}
                      className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 relative">
                        <ShoppingBag className="w-4 h-4 text-neutral-500" />
                        {totalCartCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                            {totalCartCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary tracking-wide">Shopping Bag</p>
                        <p className="text-[10px] text-neutral-400 font-semibold">
                          {totalCartCount > 0 ? `${totalCartCount} item${totalCartCount > 1 ? 's' : ''} in bag` : 'Your bag is empty'}
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/products"
                      onClick={closeMobile}
                      className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 relative">
                        <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : 'text-neutral-500'}`} />
                        {wishlist.length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 bg-cta text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                            {wishlist.length}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary tracking-wide">Wishlist</p>
                        <p className="text-[10px] text-neutral-400 font-semibold">
                          {wishlist.length > 0 ? `${wishlist.length} saved piece${wishlist.length > 1 ? 's' : ''}` : 'No saved pieces yet'}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="mx-6 my-4 border-t border-neutral-100" />

                <div className="px-6 pb-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-400 mb-4">Administration</p>
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isAdminAuthenticated ? 'bg-green-50' : 'bg-neutral-100'}`}>
                      <Shield className={`w-4 h-4 ${isAdminAuthenticated ? 'text-green-600' : 'text-neutral-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary tracking-wide">Admin Panel</p>
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        {isAdminAuthenticated ? 'Session Active' : 'Director Access'}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50">
                <Link
                  href="/products"
                  onClick={closeMobile}
                  className="block w-full bg-primary text-white text-center text-xs font-bold uppercase tracking-[0.25em] py-3.5 rounded-lg hover:bg-neutral-800 transition-colors active:scale-[0.98]"
                >
                  Explore Collection
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
