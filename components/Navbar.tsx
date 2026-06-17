"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, Heart, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVolahiStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, wishlist, currentUser, isAdminAuthenticated, logoutUser, socialLinks } = useVolahiStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerCategoriesOpen, setIsDrawerCategoriesOpen] = useState(false);
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

  const closeMobile = () => {
    setIsMobileMenuOpen(false);
    setIsDrawerCategoriesOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-body text-primary bg-white border-b border-[#E8DED3] flex items-center h-16 md:h-20 ${
      isScrolled ? 'shadow-[0_4px_18px_rgba(146,28,82,0.06)]' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 w-full relative flex items-center justify-between h-full">
        {/* Left Section (Hamburger on mobile, Logo + Links on desktop) */}
        <div className="flex items-center gap-4 md:gap-16 h-full">
          <button 
            className="md:hidden p-1 text-primary hover:text-cta transition-colors relative z-20 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 z-10 flex items-center">
            <Link href="/" className="flex items-center" onClick={closeMobile}>
              <Logo iconClassName="w-8 h-8" wordmarkClassName="h-4.5 w-auto" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] h-full">
            <Link href="/products?category=Designer Sarees" className="hover:text-cta transition-colors flex items-center h-full">Sarees</Link>
            <Link href="/products?category=Wedding Lehengas" className="hover:text-cta transition-colors flex items-center h-full">Lehengas</Link>
            <Link href="/products?category=Western Dresses" className="hover:text-cta transition-colors flex items-center h-full">Dresses</Link>
            <Link href="/products" className="hover:text-cta transition-colors flex items-center h-full">All Couture</Link>
          </div>
        </div>

        {/* Right Section (Search, Wishlist, Cart, Profile, Admin) */}
        <div className="flex items-center gap-4 md:gap-8 h-full">
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center border-b border-neutral-200 py-1 transition-all focus-within:border-primary">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search pieces..." 
              className="bg-transparent border-none focus:outline-none text-[9px] font-bold tracking-widest ml-3 w-24 lg:w-32 placeholder:text-neutral-300 uppercase"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </form>
          
          <div className="flex items-center gap-4 sm:gap-6 relative z-20 h-full">
            <Link href="/products" className="hover:text-cta transition-colors relative flex items-center h-full" title="Wishlist">
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-2.5 -right-1.5 bg-cta text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="hover:text-cta transition-colors relative flex items-center h-full" title="Shopping Cart">
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-2.5 -right-1.5 bg-primary text-white text-[7px] w-4 h-4 flex items-center justify-center font-bold rounded-full">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <Link 
              href={currentUser ? '/profile' : '/auth'} 
              className="hidden md:flex hover:text-cta transition-colors relative items-center h-full"
              title={currentUser ? `Profile: ${currentUser.name}` : 'Sign In'}
            >
              <User className={`w-5 h-5 ${currentUser ? 'text-cta' : ''}`} />
            </Link>

            <Link 
              href="/admin" 
              className="hidden md:flex hover:text-cta transition-colors relative items-center h-full"
              title="Atelier Panel"
            >
              <Shield className={`w-4 h-4 ${isAdminAuthenticated ? 'text-green-600' : 'text-neutral-400'}`} />
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#1e0d0e]/18 backdrop-blur-[1px] z-[9998]"
              onClick={closeMobile}
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 left-0 bottom-0 w-[82vw] max-w-[82vw] md:w-80 bg-white z-[9999] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Top logo and close */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DED3]">
                <Logo iconClassName="w-6 h-6" wordmarkClassName="h-3.5 w-auto" />
                <button
                  onClick={closeMobile}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-[#1e0d0e] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Search Bar */}
              <div className="px-6 py-4 border-b border-[#E8DED3]">
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    closeMobile();
                  }}
                  className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E8DED3] rounded px-4 py-2.5 focus-within:border-primary transition-colors"
                >
                  <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search collection..."
                    className="bg-transparent border-none focus:outline-none text-xs font-semibold w-full text-primary placeholder:text-neutral-400"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                  />
                </form>
              </div>

              {/* Scrollable Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="px-6 space-y-4">
                  
                  {/* Home */}
                  <Link
                    href="/"
                    onClick={closeMobile}
                    className={`flex items-center px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      isActive('/') 
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    Home
                  </Link>

                  {/* Shop */}
                  <Link
                    href="/products"
                    onClick={closeMobile}
                    className={`flex items-center px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      pathname === '/products' && !pathname.includes('category=') && !pathname.includes('new=true')
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    Shop
                  </Link>

                  {/* New Arrivals */}
                  <Link
                    href="/products?new=true"
                    onClick={closeMobile}
                    className={`flex items-center px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      pathname === '/products' && pathname.includes('new=true')
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    New Arrivals
                  </Link>

                  {/* Sarees Direct shortcut */}
                  <Link
                    href="/products?category=Designer Sarees"
                    onClick={closeMobile}
                    className={`flex items-center px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      pathname === '/products' && pathname.includes('Designer Sarees')
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    Sarees
                  </Link>

                  {/* Categories Accordion */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setIsDrawerCategoriesOpen(!isDrawerCategoriesOpen)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase text-[#1e0d0e] hover:bg-[#FAF7F2] transition-all duration-200 cursor-pointer"
                    >
                      <span>Categories</span>
                      {isDrawerCategoriesOpen ? <ChevronUp className="w-4 h-4 text-[#921c52]" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isDrawerCategoriesOpen && (
                      <div className="pl-4 border-l-2 border-[#E8DED3] ml-4 mt-1 space-y-1">
                        {[
                          { name: 'Designer Sarees', href: '/products?category=Designer Sarees' },
                          { name: 'Wedding Lehengas', href: '/products?category=Wedding Lehengas' },
                          { name: 'Western Dresses', href: '/products?category=Western Dresses' },
                          { name: 'Ethnic Suits', href: '/products?category=Ethnic Suits' },
                          { name: 'Party Gowns', href: '/products?category=Party Gowns' },
                          { name: 'Co-ord Sets', href: '/products?category=Co-ord Sets' },
                          { name: 'Luxury Loungewear', href: '/products?category=Luxury Loungewear' },
                          { name: 'Winter Collection', href: '/products?category=Winter Collection' },
                        ].map((cat) => (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            onClick={closeMobile}
                            className="block px-4 py-2.5 text-[14px] font-medium text-neutral-600 hover:text-primary hover:bg-[#FAF7F2] rounded transition-all duration-200"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Wishlist */}
                  <Link
                    href="/products"
                    onClick={closeMobile}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      isActive('/wishlist') 
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>Wishlist</span>
                    {wishlist.length > 0 && (
                      <span className="bg-cta text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  {/* Orders */}
                  <Link
                    href={currentUser ? '/profile' : '/auth'}
                    onClick={closeMobile}
                    className={`flex items-center px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      isActive('/profile') && pathname.includes('orders')
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    Orders
                  </Link>

                  {/* Account */}
                  <Link
                    href={currentUser ? '/profile' : '/auth'}
                    onClick={closeMobile}
                    className={`flex items-center px-4 py-3.5 rounded-[5px] text-[16px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                      isActive('/profile') 
                        ? 'bg-[#F7EAF0] text-[#921c52] border-l-4 border-[#921c52]' 
                        : 'text-[#1e0d0e] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    Account
                  </Link>

                </div>
              </div>

              {/* Bottom Drawer actions */}
              <div className="px-6 py-5 border-t border-[#E8DED3] bg-white flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  <a href="#footer" onClick={closeMobile} className="hover:text-primary transition-colors">Contact</a>
                  {currentUser && (
                    <button 
                      onClick={() => {
                        logoutUser();
                        closeMobile();
                        router.push('/auth');
                      }}
                      className="text-red-600 hover:text-red-700 font-bold uppercase transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  )}
                </div>
                
                {/* Social links */}
                <div className="flex gap-4 justify-center pt-2">
                  {socialLinks?.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 transition-opacity text-xs uppercase tracking-widest font-bold">Instagram</a>
                  )}
                  {socialLinks?.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 transition-opacity text-xs uppercase tracking-widest font-bold">Facebook</a>
                  )}
                  {socialLinks?.whatsapp && (
                    <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 transition-opacity text-xs uppercase tracking-widest font-bold">WhatsApp</a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
