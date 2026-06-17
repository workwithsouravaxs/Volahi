"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useVolahiStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ShoppingCart, Heart, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const { products, toggleWishlist, wishlist, addToCart, categories } = useVolahiStore();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState(150000);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync category & search from URL changes (e.g. Navbar CTAs)
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const search = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(search);
  }, [searchParams]);

  // Derive unique colors and sizes from active products in the store
  const activeProducts = products.filter(p => p.status === 'Active');
  
  const allAvailableColors = useMemo(() => {
    const colors = new Set<string>();
    activeProducts.forEach(p => p.colors.forEach(c => colors.add(c)));
    return Array.from(colors);
  }, [activeProducts]);

  const allAvailableSizes = useMemo(() => {
    const sizes = new Set<string>();
    activeProducts.forEach(p => p.sizes.forEach(s => sizes.add(s)));
    return Array.from(sizes);
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter(p => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchPrice = p.price <= priceRange;
      const matchSize = selectedSize === 'All' || p.allSizesAvailable || p.sizes.includes(selectedSize);
      const matchColor = selectedColor === 'All' || p.colors.includes(selectedColor);
      
      return matchCategory && matchSearch && matchPrice && matchSize && matchColor;
    });
  }, [activeProducts, selectedCategory, searchQuery, priceRange, selectedSize, selectedColor]);

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

  return (
    <div className="pt-40 pb-20 px-4 max-w-7xl mx-auto font-body text-primary">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 border-l-2 border-primary pl-8">
        <div>
          <h1 className="text-6xl font-heading mb-4 uppercase tracking-tighter">The Collection</h1>
          <p className="text-neutral-400 text-[10px] uppercase tracking-[0.4em] font-bold">Discover {filteredProducts.length} unique pieces curated for Volahi</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="relative border-b border-neutral-200 py-1 transition-all focus-within:border-primary">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="SEARCH PIECES" 
              className="bg-transparent border-none focus:outline-none text-[10px] font-bold tracking-widest pl-8 w-48 lg:w-64 placeholder:text-neutral-300 uppercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold transition-all ${isFilterOpen ? 'text-cta' : 'text-primary'}`}
          >
            Filters <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto p-8 space-y-10">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">Refine</span>
              <button onClick={() => setIsFilterOpen(false)} className="text-neutral-400 hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Category */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 mb-6">Categories</h3>
              <div className="flex flex-col gap-3.5">
                <button onClick={() => { setSelectedCategory('All'); setIsFilterOpen(false); }} className={`text-left text-[10px] font-bold uppercase tracking-[0.2em] transition-all pb-1.5 border-b ${selectedCategory === 'All' ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-primary'}`}>All Creations</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }} className={`text-left text-[10px] font-bold uppercase tracking-[0.2em] transition-all pb-1.5 border-b ${selectedCategory === cat ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-primary'}`}>{cat}</button>
                ))}
              </div>
            </div>
            {/* Price */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400">Price</h3>
                <span className="text-[10px] font-bold text-cta">₹{priceRange.toLocaleString()}</span>
              </div>
              <input type="range" min="1000" max="250000" step="1000" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} className="w-full h-1 bg-neutral-100 appearance-none cursor-pointer accent-primary" />
            </div>
            {/* Sizes */}
            {allAvailableSizes.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 mb-6">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedSize('All')} className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedSize === 'All' ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}>All</button>
                  {allAvailableSizes.map(size => (<button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}>{size}</button>))}
                </div>
              </div>
            )}
            {/* Colors */}
            {allAvailableColors.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 mb-6">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedColor('All')} className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedColor === 'All' ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}>All</button>
                  {allAvailableColors.map(color => (<button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedColor === color ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}>{color}</button>))}
                </div>
              </div>
            )}
            {/* Reset */}
            <div className="pt-4 border-t border-neutral-100">
              <button onClick={() => { setSelectedCategory('All'); setPriceRange(150000); setSearchQuery(''); setSelectedSize('All'); setSelectedColor('All'); }} className="text-[9px] font-bold uppercase tracking-[0.4em] text-cta hover:underline">Reset Selection</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-20">
        {/* Filters - Sidebar Desktop only */}
        <aside className="lg:w-72 space-y-12 hidden lg:block">
          {/* Category Filter */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 mb-6">Categories</h3>
            <div className="flex flex-col gap-3.5">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`text-left text-[10px] font-bold uppercase tracking-[0.2em] transition-all pb-1.5 border-b ${selectedCategory === 'All' ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-primary'}`}
              >
                All Creations
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-[10px] font-bold uppercase tracking-[0.2em] transition-all pb-1.5 border-b ${selectedCategory === cat ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-primary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400">Price Threshold</h3>
              <span className="text-[10px] font-bold text-cta">₹{priceRange.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="250000" 
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full h-1 bg-neutral-100 appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Size Filter */}
          {allAvailableSizes.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 mb-6">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedSize('All')}
                  className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedSize === 'All' ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}
                >
                  All
                </button>
                {allAvailableSizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {allAvailableColors.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 mb-6">Colors</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedColor('All')}
                  className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedColor === 'All' ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}
                >
                  All
                </button>
                {allAvailableColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedColor === color ? 'bg-primary text-white border-primary' : 'bg-transparent text-neutral-400 hover:border-neutral-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Filters */}
          <div className="pt-8 border-t border-neutral-100">
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setPriceRange(150000);
                setSearchQuery('');
                setSelectedSize('All');
                setSelectedColor('All');
              }}
              className="text-[9px] font-bold uppercase tracking-[0.4em] text-cta hover:underline"
            >
              Reset Selection
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-16">
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={product.id}
                  className="group relative border border-[#E8DED3] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary hover:shadow-[0_12px_24px_rgba(30,13,14,0.08)] rounded-[5px]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50 mb-6 rounded-t-[5px]">
                    <Link href={`/products/detail?id=${product.id}`} className="block w-full h-full overflow-hidden rounded-t-[5px]">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 aspect-[4/5] rounded-t-[5px]"
                        style={{ objectPosition: product.imagePosition?.[0] ?? 'center 50%' }}
                      />
                    </Link>
                    {/* Size Hover Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2.5 px-3 border-t border-neutral-100 flex flex-wrap gap-1 justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                      <span className="text-[7px] font-bold tracking-widest text-neutral-400 uppercase mr-1">Sizes:</span>
                      {product.sizes.map((s: string) => (
                        <span key={s} className="text-[8px] font-bold text-primary px-1.5 py-0.5 border border-neutral-200 bg-slate-50 uppercase tracking-widest">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="bg-white/90 p-2.5 rounded shadow-sm hover:bg-white transition-colors"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.3em]">{product.category}</p>
                    <Link href={`/products/detail?id=${product.id}`} className="block font-heading text-[12px] hover:italic transition-all uppercase tracking-tighter">
                      {product.name}
                    </Link>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-slate-800 tracking-tighter text-md">₹{product.price.toLocaleString()}</span>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-primary text-white p-2.5 rounded hover:bg-cta transition-colors active:scale-95"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center border border-dashed border-neutral-200">
              <h3 className="text-2xl font-heading mb-4 uppercase tracking-widest">No matching pieces</h3>
              <p className="text-neutral-400 text-xs tracking-widest mb-10">Adjust your selection to explore other couture pieces.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setPriceRange(150000);
                  setSearchQuery('');
                  setSelectedSize('All');
                  setSelectedColor('All');
                }}
                className="btn-primary"
              >
                Show All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<div className="pt-40 text-center font-heading text-3xl uppercase tracking-widest animate-pulse">Entering Volahi Collection...</div>}>
        <ProductCatalogContent />
      </Suspense>
    </main>
  );
}
