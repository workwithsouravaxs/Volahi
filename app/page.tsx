"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useVolahiStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ShoppingCart, Zap, Heart, Sparkles, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { products, banners, middleBanner, toggleWishlist, wishlist, addToCart, socialLinks } = useVolahiStore();

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Active Banners from Admin
  const activeBanners = banners.filter(b => b.active);

  // Dynamic Product Sections
  const activeProducts = products.filter(p => p.status === 'Active');
  const featuredProducts = activeProducts.filter(p => p.featured).slice(0, 8);
  const bestSellers = activeProducts.filter(p => p.bestSeller).slice(0, 8);
  const newArrivals = activeProducts.filter(p => p.newArrival).slice(0, 8);

  const handleNextBanner = () => {
    if (activeBanners.length > 0) {
      setActiveBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }
  };

  const handlePrevBanner = () => {
    if (activeBanners.length > 0) {
      setActiveBannerIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product,
      quantity: 1,
      selectedSize: product.sizes[0] || 'S',
      selectedColor: product.colors[0] || 'Natural',
    });
  };

  // Curated Categories from active products or standard fallbacks
  const availableCategories = Array.from(new Set(activeProducts.map(p => p.category)));

  return (
    <main className="relative overflow-hidden bg-[#FFF9F7] font-body text-primary">
      <Navbar />
      
      {/* ==================== SECTION 1: HERO DYNAMIC BANNERS ==================== */}
      <section className="relative w-full h-auto pt-20 bg-neutral-950 overflow-hidden">
        {activeBanners.length > 0 ? (
          <div className="relative w-full h-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeBanners[activeBannerIdx].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full h-auto"
              >
                <Link href={activeBanners[activeBannerIdx].ctaLink || '/products'} className="block w-full h-auto">
                  <img 
                    src={activeBanners[activeBannerIdx].image} 
                    alt={activeBanners[activeBannerIdx].title || 'Volahi Banner'} 
                    className="w-full h-auto object-contain block hover:opacity-95 transition-opacity"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Banner Selectors */}
            {activeBanners.length > 1 && (
              <>
                <button 
                  onClick={handlePrevBanner}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md rounded-full transition-colors z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextBanner}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md rounded-full transition-colors z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          /* Default Editorial Brand Hero */
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-neutral-900/60 z-0">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
                alt="Fashion Hero" 
                className="w-full h-full object-cover brightness-[0.5]"
              />
            </div>
            
            <div className="relative z-10 text-center text-white px-4 max-w-4xl space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-cta block mb-2">New Season Arrival</span>
              <h1 className="text-5xl md:text-7xl font-heading mb-8 leading-tight uppercase tracking-tight">
                Discover Volahi <br /> The Women's Couture
              </h1>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <Link href="/products" className="btn-primary flex items-center gap-2 px-10 py-4 bg-white text-primary border border-white hover:bg-transparent hover:text-white transition-all uppercase tracking-widest text-[10px] font-bold">
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/admin" className="bg-white/10 backdrop-blur-md border border-white/20 px-10 py-4 font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                  Open Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==================== AESTHETIC EMPTY STATE CHECK ==================== */}
      {products.length === 0 ? (
        <section className="py-32 px-6 text-center max-w-3xl mx-auto space-y-8">
          <Sparkles className="w-12 h-12 text-cta mx-auto animate-pulse" />
          <h2 className="text-4xl font-heading uppercase tracking-tighter">The Atelier is Customizing</h2>
          <p className="text-neutral-500 text-xs tracking-widest leading-[2]">
            Our digital archives are currently pristine. All collections, banners, and dynamic couture are designed to be managed dynamically from our administrator interface.
          </p>
          <div className="pt-6">
            <Link href="/admin" className="btn-primary px-10 py-4.5 text-[10px] font-bold tracking-widest uppercase">
              Configure Store via Admin Dashboard
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* ==================== CURATED CATEGORIES ==================== */}
          {availableCategories.length > 0 && (
            <section className="py-24 bg-white border-b border-neutral-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col mb-16 pl-6 border-l-2 border-primary">
                  <span className="text-[10px] text-cta font-bold uppercase tracking-[0.3em] mb-2">Signature Styles</span>
                  <h2 className="text-4xl font-heading uppercase tracking-tighter">Shop by Category</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                  {availableCategories.slice(0, 4).map((cat) => {
                    const sampleProduct = activeProducts.find(p => p.category === cat);
                    return (
                      <Link 
                        key={cat} 
                        href={`/products?category=${cat}`}
                        className="group relative aspect-[4/5] overflow-hidden bg-neutral-50 shadow-sm border border-neutral-100 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(210,140,129,0.15)]"
                      >
                        <img 
                          src={sampleProduct?.image} 
                          alt={cat}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.1] aspect-[4/5]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent flex items-end p-8">
                          <h3 className="text-white text-2xl font-heading uppercase tracking-tighter">{cat}</h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ==================== CATEGORY PROMOTIONAL MAIN BANNER ==================== */}
          {middleBanner && (
            <section className="w-full h-auto bg-[#FFF9F7] overflow-hidden border-b border-neutral-100/50">
              <Link href={middleBanner.ctaLink || '/products'} className="block w-full h-auto">
                <img 
                  src={middleBanner.image} 
                  alt={middleBanner.title || 'Category Spotlight'} 
                  className="w-full h-auto object-contain block hover:opacity-95 transition-opacity"
                />
              </Link>
            </section>
          )}

          {/* ==================== SECTION 2: FEATURED COUTURE ==================== */}
          {featuredProducts.length > 0 && (
            <section className="py-24 bg-[#FFF9F7]">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pl-6 border-l-2 border-primary">
                  <div>
                    <span className="text-[10px] text-cta font-bold uppercase tracking-[0.3em] mb-2">Featured Selection</span>
                    <h2 className="text-4xl font-heading uppercase tracking-tighter">The Couture Collection</h2>
                  </div>
                  <Link href="/products" className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-primary pb-1 hover:text-cta hover:border-cta transition-all mt-4 md:mt-0">
                    Explore all creations
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {featuredProducts.map((p) => (
                    <div 
                      key={p.id}
                      className="group border border-neutral-100/50 bg-white p-4 shadow-sm relative transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(210,140,129,0.15)]"
                    >
                      <Link href={`/products/detail?id=${p.id}`} className="block relative aspect-[4/5] overflow-hidden bg-neutral-50 mb-6">
                        <img 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Size Hover Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2.5 px-3 border-t border-neutral-100 flex flex-wrap gap-1 justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                          <span className="text-[7px] font-bold tracking-widest text-neutral-400 uppercase mr-1">Sizes:</span>
                          {p.sizes.map((s: string) => (
                            <span key={s} className="text-[8px] font-bold text-primary px-1.5 py-0.5 border border-neutral-200 bg-slate-50 uppercase tracking-widest">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="absolute top-4 right-4 z-10">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(p.id);
                            }}
                            className="bg-white/90 p-2.5 rounded shadow-sm hover:bg-white transition-colors"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${wishlist.includes(p.id) ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} />
                          </button>
                        </div>
                      </Link>
                      <div className="text-center space-y-2">
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.3em]">{p.category}</p>
                        <Link href={`/products/detail?id=${p.id}`} className="block font-heading text-[12px] hover:italic transition-all uppercase tracking-tighter">
                          {p.name}
                        </Link>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-slate-800 tracking-tighter text-md">₹{p.price.toLocaleString()}</span>
                          <button 
                            onClick={(e) => handleAddToCart(e, p)}
                            className="bg-primary text-white p-2.5 rounded hover:bg-cta transition-colors active:scale-95"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================== SECTION 3: BEST SELLERS ==================== */}
          {bestSellers.length > 0 && (
            <section className="py-24 bg-white border-t border-neutral-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pl-6 border-l-2 border-primary">
                  <div>
                    <span className="text-[10px] text-cta font-bold uppercase tracking-[0.3em] mb-2"><Zap className="w-3.5 h-3.5 fill-cta inline mr-1" /> Now Trending</span>
                    <h2 className="text-4xl font-heading uppercase tracking-tighter">The Hot List</h2>
                  </div>
                  <Link href="/products" className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-primary pb-1 hover:text-cta hover:border-cta transition-all mt-4 md:mt-0">
                    Explore all bestsellers
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {bestSellers.map((p) => (
                    <div 
                      key={p.id}
                      className="group border border-neutral-100/50 bg-[#FFF9F7] p-4 shadow-sm relative transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(210,140,129,0.15)]"
                    >
                      <Link href={`/products/detail?id=${p.id}`} className="block relative aspect-[4/5] overflow-hidden bg-neutral-50 mb-6">
                        <img 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Size Hover Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2.5 px-3 border-t border-neutral-100 flex flex-wrap gap-1 justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                          <span className="text-[7px] font-bold tracking-widest text-neutral-400 uppercase mr-1">Sizes:</span>
                          {p.sizes.map((s: string) => (
                            <span key={s} className="text-[8px] font-bold text-primary px-1.5 py-0.5 border border-neutral-200 bg-slate-50 uppercase tracking-widest">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="absolute top-4 right-4 z-10">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(p.id);
                            }}
                            className="bg-white/90 p-2.5 rounded shadow-sm hover:bg-white transition-colors"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${wishlist.includes(p.id) ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} />
                          </button>
                        </div>
                      </Link>
                      <div className="text-center space-y-2">
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.3em]">{p.category}</p>
                        <Link href={`/products/detail?id=${p.id}`} className="block font-heading text-[12px] hover:italic transition-all uppercase tracking-tighter">
                          {p.name}
                        </Link>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-slate-800 tracking-tighter text-md">₹{p.price.toLocaleString()}</span>
                          <button 
                            onClick={(e) => handleAddToCart(e, p)}
                            className="bg-primary text-white p-2.5 rounded hover:bg-cta transition-colors active:scale-95"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================== SECTION 4: NEW ARRIVALS ==================== */}
          {newArrivals.length > 0 && (
            <section className="py-24 bg-[#FFF9F7] border-t border-neutral-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pl-6 border-l-2 border-primary">
                  <div>
                    <span className="text-[10px] text-cta font-bold uppercase tracking-[0.3em] mb-2">New Season arrivals</span>
                    <h2 className="text-4xl font-heading uppercase tracking-tighter">Fresh Additions</h2>
                  </div>
                  <Link href="/products" className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-primary pb-1 hover:text-cta hover:border-cta transition-all mt-4 md:mt-0">
                    Explore all additions
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {newArrivals.map((p) => (
                    <div 
                      key={p.id}
                      className="group border border-neutral-100/50 bg-white p-4 shadow-sm relative transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(210,140,129,0.15)]"
                    >
                      <Link href={`/products/detail?id=${p.id}`} className="block relative aspect-[4/5] overflow-hidden bg-neutral-50 mb-6">
                        <img 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Size Hover Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2.5 px-3 border-t border-neutral-100 flex flex-wrap gap-1 justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                          <span className="text-[7px] font-bold tracking-widest text-neutral-400 uppercase mr-1">Sizes:</span>
                          {p.sizes.map((s: string) => (
                            <span key={s} className="text-[8px] font-bold text-primary px-1.5 py-0.5 border border-neutral-200 bg-slate-50 uppercase tracking-widest">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="absolute top-4 right-4 z-10">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(p.id);
                            }}
                            className="bg-white/90 p-2.5 rounded shadow-sm hover:bg-white transition-colors"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${wishlist.includes(p.id) ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} />
                          </button>
                        </div>
                      </Link>
                      <div className="text-center space-y-2">
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.3em]">{p.category}</p>
                        <Link href={`/products/detail?id=${p.id}`} className="block font-heading text-[12px] hover:italic transition-all uppercase tracking-tighter">
                          {p.name}
                        </Link>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-slate-800 tracking-tighter text-md">₹{p.price.toLocaleString()}</span>
                          <button 
                            onClick={(e) => handleAddToCart(e, p)}
                            className="bg-primary text-white p-2.5 rounded hover:bg-cta transition-colors active:scale-95"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ==================== DYNAMIC LUXURY FOOTER ==================== */}
      <footer className="bg-neutral-900 text-white py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-3xl font-heading font-bold tracking-tighter uppercase">Volahi</h2>
            <p className="text-neutral-400 text-xs leading-[2] tracking-widest">
              Empowering dynamic lifestyle couture through dynamic, elegant, custom design structures.
            </p>
            <div className="flex gap-3 flex-wrap">
              {([
                { key: 'instagram' as const, label: 'Ig' },
                { key: 'facebook' as const, label: 'Fb' },
                { key: 'twitter' as const, label: 'Tw' },
                { key: 'youtube' as const, label: 'Yt' },
                { key: 'whatsapp' as const, label: 'Wa' },
                { key: 'pinterest' as const, label: 'Pt' },
              ] as const).map(({ key, label }) =>
                socialLinks[key] ? (
                  <a
                    key={key}
                    href={socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-cta transition-colors text-xs font-bold uppercase"
                    title={key}
                  >
                    {label}
                  </a>
                ) : (
                  <div
                    key={key}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold uppercase text-white/20 cursor-default"
                    title={`${key} (not configured)`}
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-heading text-xl uppercase tracking-tighter">Creations</h4>
            <ul className="space-y-3 text-xs text-neutral-400 font-bold uppercase tracking-wider">
              {availableCategories.length > 0 ? (
                availableCategories.slice(0, 4).map((c) => (
                  <li key={c}><Link href={`/products?category=${c}`} className="hover:text-white transition-colors">{c}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="/products?category=Designer Sarees" className="hover:text-white transition-colors">Designer Sarees</Link></li>
                  <li><Link href="/products?category=Wedding Lehengas" className="hover:text-white transition-colors">Wedding Lehengas</Link></li>
                  <li><Link href="/products?category=Western Dresses" className="hover:text-white transition-colors">Western Dresses</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-heading text-xl uppercase tracking-tighter">Atelier Care</h4>
            <ul className="space-y-3 text-xs text-neutral-400 font-bold uppercase tracking-wider">
              <li>Track Order</li>
              <li>Returns & Exchanges</li>
              <li>Shipping Policy</li>
              <li>Director Panel</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-heading text-xl uppercase tracking-tighter">Newsletter</h4>
            <p className="text-xs text-neutral-400 leading-[1.8] tracking-wider">Subscribe to acquire confidential custom collection launches.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="bg-white/5 border border-white/10 px-4 py-2.5 focus:outline-none focus:border-white/30 text-xs w-full font-bold uppercase tracking-widest placeholder:text-neutral-600 text-white"
              />
              <button className="bg-white text-primary text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-cta hover:text-white hover:border-cta border border-white transition-all">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
          &copy; 2026 Volahi. All rights reserved. Premium Women's Couture.
        </div>
      </footer>
    </main>
  );
}
