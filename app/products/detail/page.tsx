"use client";

import React, { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useVolahiStore, Product } from '@/lib/store';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, ShieldCheck, ChevronRight, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const { products, toggleWishlist, wishlist, addToCart, addReview } = useVolahiStore();

  const product = products.find((p) => p.id === id);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'care'>('details');

  // Review Form States
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-body text-primary">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-heading uppercase tracking-widest">Piece Not Found</h1>
          <p className="text-neutral-400 text-xs tracking-widest">The requested couture piece does not exist in our collections.</p>
          <Link href="/products" className="btn-primary inline-block">Back to Collection</Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.status === 'Active')
    .slice(0, 4);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    addReview(product.id, {
      reviewerName: reviewerName.trim(),
      rating,
      comment: reviewComment.trim(),
    });

    setReviewerName('');
    setRating(5);
    setReviewComment('');
    setReviewSuccess('Your elegant review has been submitted to the atelier archives.');
    setTimeout(() => setReviewSuccess(''), 4000);
  };

  const handleAcquire = () => {
    if (!selectedSize && product.sizes.length > 0) {
      alert('Please allocate your desired Size before acquiring this creation.');
      return;
    }
    if (!selectedColor && product.colors.length > 0) {
      alert('Please allocate your desired Color before acquiring this creation.');
      return;
    }

    addToCart({
      product,
      quantity: 1,
      selectedSize: selectedSize || 'OS',
      selectedColor: selectedColor || product.colors[0] || 'Natural',
    });
    alert(`${product.name} has been added to your Shopping Bag.`);
  };

  return (
    <div className="pt-40 pb-32 max-w-7xl mx-auto px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 mb-12">
        <Link href="/" className="hover:text-primary transition-colors">Volahi</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-primary transition-colors">Couture</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 mb-40">
        {/* Visual Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[2/3] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm rounded"
          >
            <img 
              src={product.images[activeImage] || product.image} 
              className="w-full h-full object-cover grayscale-[0.05]"
              style={{ objectPosition: product.imagePosition?.[activeImage] ?? 'center 50%' }}
              alt={product.name}
            />
          </motion.div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <div 
                  key={i}
                  className={`aspect-[3/4] overflow-hidden cursor-pointer border transition-all rounded ${activeImage === i ? 'border-primary' : 'border-neutral-100 hover:border-neutral-300'}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" style={{ objectPosition: product.imagePosition?.[i] ?? 'center 50%' }} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Specifications & Purchases */}
        <div className="flex flex-col justify-center lg:border-l lg:border-neutral-100 lg:pl-16 xl:pl-24">
          <span className="text-cta font-bold uppercase tracking-[0.4em] mb-4 text-[10px]">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-heading mb-6 leading-tight uppercase tracking-tighter">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-10 border-b border-slate-50 pb-6">
            <div className="flex items-center gap-1 text-primary">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <span className="text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-bold">Verified Couture</span>
            <span className="text-neutral-200">/</span>
            <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          <div className="mb-10">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-medium text-primary tracking-tighter">₹{product.price.toLocaleString()}</span>
              {product.discountPrice && (
                <span className="text-xl text-neutral-300 line-through tracking-tighter">₹{product.discountPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-neutral-400 text-[9px] uppercase tracking-[0.3em] font-bold mt-3">Complimentary White Glove Delivery Included</p>
          </div>

          {/* Colors Selection */}
          {product.colors.length > 0 && product.colors[0] !== 'Natural' && (
            <div className="mb-8">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-3">Color: {selectedColor || 'Select Option'}</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 px-4 border text-[10px] font-bold uppercase tracking-wider transition-all rounded ${selectedColor === color ? 'border-primary bg-primary text-white' : 'border-neutral-100 text-neutral-400 hover:border-neutral-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.4em]">Choose Size</h3>
              <button className="text-[9px] text-cta font-bold uppercase tracking-[0.2em] border-b border-cta">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[56px] h-12 border font-bold text-[10px] transition-all flex items-center justify-center px-4 rounded ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-neutral-100 text-neutral-400 hover:border-neutral-300'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-12">
            <button 
              onClick={handleAcquire}
              disabled={product.stock <= 0}
              className="flex-1 btn-primary py-4.5 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-200 transition-all rounded"
            >
              {product.stock > 0 ? 'Acquire Creation' : 'Sold Out'}
            </button>
            <button 
              onClick={() => toggleWishlist(product.id)}
              className="w-16 h-16 border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors group rounded"
            >
              <Heart className={`w-5 h-5 transition-colors ${wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-10 border-t border-neutral-100">
            <div className="flex items-center gap-5">
              <div className="p-3 border border-neutral-100 rounded"><Truck className="w-4 h-4 text-neutral-900" /></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.2em]">Global Courier</p><p className="text-[9px] text-neutral-400 tracking-widest mt-1">Insured complimentary shipping & packaging</p></div>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 border border-neutral-100 rounded"><ShieldCheck className="w-4 h-4 text-neutral-900" /></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.2em]">Authenticity Guaranteed</p><p className="text-[9px] text-neutral-400 tracking-widest mt-1">Each creation arrives certified premium Volahi</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mb-40">
        <div className="flex gap-12 border-b border-neutral-100 mb-10 text-[9px] font-bold uppercase tracking-[0.4em]">
          <button 
            onClick={() => setActiveTab('details')}
            className={`py-4 transition-all relative ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-neutral-400'}`}
          >
            The Narrative
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`py-4 transition-all relative ${activeTab === 'specs' ? 'border-b-2 border-primary text-primary' : 'text-neutral-400'}`}
          >
            Composition details
          </button>
          <button 
            onClick={() => setActiveTab('care')}
            className={`py-4 transition-all relative ${activeTab === 'care' ? 'border-b-2 border-primary text-primary' : 'text-neutral-400'}`}
          >
            Couture Care
          </button>
        </div>

        <div className="max-w-4xl">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-4">
                <h4 className="text-2xl font-heading uppercase tracking-tighter">silhouette narrative</h4>
                <p className="text-neutral-500 text-xs leading-[2] tracking-widest">
                  {product.description} Every dynamic stitch and precise seam in this Volahi creation has been meticulously cataloged to fulfill premium high-fashion attributes.
                </p>
              </div>
              {product.features.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-2xl font-heading uppercase tracking-tighter">Artisanal Details</h4>
                  <ul className="space-y-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                    {product.features.map((f, idx) => (
                      <li key={idx}><span className="text-cta mr-3">•</span> {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h4 className="text-2xl font-heading uppercase tracking-tighter">Material & Composition</h4>
              <p className="text-neutral-500 text-xs leading-[2] tracking-widest max-w-xl">
                This couture piece is synthesized with premium <span className="text-primary font-bold">{product.material}</span>, selected specifically to ensure an editorial drape and lightweight luxury tactile sensation.
              </p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4">
              <h4 className="text-2xl font-heading uppercase tracking-tighter">Specialist Care Guide</h4>
              <p className="text-neutral-500 text-xs leading-[2] tracking-widest max-w-xl">
                {product.careInstructions || 'Dry Clean recommended. Store in our custom garment breathable cloth bags on structured padded hangers to preserve delicate threads.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== REVIEWS & RATING MODULE ==================== */}
      <div className="mb-40 border-t border-neutral-100 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Reviews list */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-2xl font-heading uppercase tracking-tighter mb-8 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neutral-600" /> Dynamic Reviews ({product.reviews?.length || 0})
            </h3>

            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r, idx) => (
                  <div key={idx} className="border-b border-neutral-50 pb-6 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-primary">{r.reviewerName}</span>
                      <span className="text-neutral-300 font-bold uppercase tracking-widest">{r.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-yellow-500 py-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 tracking-widest leading-relaxed">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-400 uppercase tracking-widest py-10">No reviews placed yet. Be the first to catalog your couture experience.</p>
              )}
            </div>
          </div>

          {/* Leave a review Form */}
          <div className="lg:col-span-5 bg-[#FFF9F7] p-8 border border-neutral-100 shadow-sm rounded">
            <h4 className="text-xl font-heading uppercase tracking-tighter mb-6">Leave an Atelier Review</h4>
            
            {reviewSuccess && (
              <div className="mb-6 p-4 bg-green-50/50 border border-green-100 text-green-700 text-xs font-semibold uppercase tracking-wider leading-relaxed text-center">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Reviewer Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-white border border-neutral-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                  placeholder="e.g. Charlotte Dupont"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Acquisition rating</label>
                <select 
                  className="w-full bg-white border border-neutral-200 rounded p-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Exquisite - 5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (Premium - 4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (Standard - 3 Stars)</option>
                  <option value={2}>⭐⭐ (Fair - 2 Stars)</option>
                  <option value={1}>⭐ (Unsatisfactory - 1 Star)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Your review statement</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full bg-white border border-neutral-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary tracking-wide"
                  placeholder="Reflect on the styling, silhouette drape, fabric tactile quality..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-white py-3.5 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors rounded"
              >
                Publish Review <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Related Creations */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-16 border-b border-neutral-100 pb-4">
            <h2 className="text-3xl font-heading uppercase tracking-tighter">Similar Creations</h2>
            <Link href="/products" className="text-[10px] uppercase tracking-[0.3em] font-bold border-b border-primary pb-1">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {relatedProducts.map((p) => (
              <Link 
                key={p.id} 
                href={`/products/detail?id=${p.id}`} 
                className="group block p-4 bg-white border border-neutral-100/50 shadow-sm rounded transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(210,140,129,0.15)] text-center"
              >
                <div className="aspect-[4/5] overflow-hidden bg-neutral-50 mb-6 relative">
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 aspect-[4/5]" 
                    style={{ objectPosition: p.imagePosition?.[0] ?? 'center 50%' }}
                    alt={p.name} 
                  />
                  {/* Size Hover Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2 px-3 border-t border-neutral-100 flex flex-wrap gap-1 justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                    <span className="text-[7px] font-bold tracking-widest text-neutral-400 uppercase mr-1">Sizes:</span>
                    {p.sizes.map((s: string) => (
                      <span key={s} className="text-[8px] font-bold text-primary px-1.5 py-0.5 border border-neutral-200 bg-slate-50 uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="font-heading text-[12px] mb-2 group-hover:italic transition-all uppercase tracking-tighter">{p.name}</h3>
                <p className="font-semibold tracking-tighter text-slate-800">₹{p.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <main className="bg-[#FFF9F7] min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="pt-40 text-center font-heading text-3xl uppercase tracking-widest animate-pulse">Entering Volahi Collection...</div>}>
        <ProductDetailsContent />
      </Suspense>
    </main>
  );
}
