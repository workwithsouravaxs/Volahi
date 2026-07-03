"use client";

import React, { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useVolahiStore, getSizeWithNumber } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Truck, ShieldCheck, ChevronRight, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const { products, toggleWishlist, wishlist, addToCart, addReview } = useVolahiStore();

  const product = products.find((p) => p.id === id);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Collapsible Accordion States
  const [narrativeOpen, setNarrativeOpen] = useState(true);
  const [compositionOpen, setCompositionOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  // Review Form States
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveImageIndex(index);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-body text-primary">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-heading uppercase tracking-[0.18em]">Piece Not Found</h1>
          <p className="text-neutral-400 text-xs tracking-widest font-body">The requested couture piece does not exist in our collections.</p>
          <Link href="/products" className="btn-primary inline-block rounded-none font-heading">Back to Collection</Link>
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
    alert(`${product.name} has been added to your Shopping Cart.`);
  };

  return (
    <div className="pt-36 md:pt-40 pb-24 max-w-7xl mx-auto px-4 font-body">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-300 mb-8 font-heading">
        <Link href="/" className="hover:text-primary transition-colors">Volahi</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-primary transition-colors">Couture</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 xl:gap-20 mb-24 items-start">
        
        {/* ==================== LEFT COLUMN: VISUAL GALLERY ==================== */}
        <div>
          {/* Desktop stacked layout (large scrolling screens, Nishorama Eleena Corset style) */}
          <div className="hidden lg:flex flex-col gap-6 w-full">
            {product.images.map((img, i) => (
              <div key={i} className="w-full bg-[#FAFAF9] border border-[#E4DFDE] overflow-hidden aspect-[3/4]">
                <img 
                  src={img} 
                  className="w-full h-full object-cover transition-opacity duration-300" 
                  alt={`${product.name} view ${i + 1}`} 
                />
              </div>
            ))}
          </div>

          {/* Mobile horizontal swipe carousel */}
          <div className="lg:hidden w-full relative">
            <div 
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full gap-4 pb-4"
            >
              {product.images.map((img, i) => (
                <div key={i} className="w-full aspect-[3/4] flex-shrink-0 snap-center bg-[#FAFAF9] border border-[#E4DFDE] overflow-hidden relative">
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            {/* Dots navigation inside a rounded container */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-1.5 items-center">
              {product.images.map((_, i) => (
                <span 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === i ? 'bg-white w-3' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: STICKY METADATA PANEL ==================== */}
        <div className="sticky top-32 lg:top-36 space-y-8 flex flex-col justify-start lg:border-l lg:border-[#E4DFDE] lg:pl-12 xl:pl-16 pt-2 w-full">
          <div>
            <span className="text-primary font-bold uppercase tracking-[0.18em] mb-1.5 text-[10px] font-heading">{product.category}</span>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-heading mb-3 md:mb-4 leading-tight uppercase tracking-[0.18em]">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-6 border-b border-[#E4DFDE] pb-4 font-body">
              <div className="flex items-center gap-1 text-primary">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <span className="text-neutral-400 text-[9px] uppercase tracking-[0.18em] font-bold font-heading">Verified Couture</span>
              <span className="text-neutral-200">/</span>
              <span className={`text-[9px] uppercase tracking-[0.18em] font-bold font-heading ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-6 font-body">
              <div className="flex items-baseline gap-4">
                <span className="text-2xl md:text-3xl font-semibold text-primary tracking-tighter">₹{product.price.toLocaleString()}</span>
                {product.discountPrice && (
                  <span className="text-lg text-neutral-300 line-through tracking-tighter">₹{product.discountPrice.toLocaleString()}</span>
                )}
              </div>
              <p className="text-neutral-400 text-[9px] uppercase tracking-[0.18em] font-bold mt-2 font-heading">
                {product.deliveryFeeEnabled 
                  ? `Delivery: ₹${product.deliveryFeeAmount} ${product.deliveryFeeNotes ? `(${product.deliveryFeeNotes})` : ''}`
                  : "Free Delivery"
                }
              </p>
            </div>
          </div>

          {/* Colors Selection */}
          {product.colors.length > 0 && product.colors[0] !== 'Natural' && (
            <div className="font-body">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3 font-heading">Color: {selectedColor || 'Select Option'}</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 px-4 border text-[10px] font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${selectedColor === color ? 'border-primary bg-primary text-white' : 'bg-white border-[#E4DFDE] text-neutral-400 hover:border-neutral-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="font-body">
            <div className="flex justify-between items-center mb-4 relative">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.18em] font-heading">Choose Size: {selectedSize ? getSizeWithNumber(selectedSize) : 'Select Option'}</h3>
              <button 
                onClick={() => setIsSizeChartOpen(!isSizeChartOpen)} 
                className="text-[9px] text-primary font-bold uppercase tracking-[0.18em] border-b border-primary relative z-10 font-heading cursor-pointer"
              >
                Size Chart
              </button>

              <AnimatePresence>
                {isSizeChartOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsSizeChartOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-[384px] max-w-[90vw] h-[288px] bg-white border border-[#E4DFDE] p-4 z-50 overflow-auto text-primary rounded-none shadow-md"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-[#E4DFDE] mb-3">
                        <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#1C1C1C] font-heading">Size Guide (Inches)</span>
                        <button 
                          onClick={() => setIsSizeChartOpen(false)}
                          className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.18em] font-heading cursor-pointer"
                        >
                          ✕ Close
                        </button>
                      </div>
                      
                      <table className="w-full text-left text-[9px] tracking-wider border-collapse">
                        <thead>
                          <tr className="border-b border-[#E4DFDE] text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                            <th className="py-2 px-2">Size</th>
                            <th className="py-2 px-2">Bust</th>
                            <th className="py-2 px-2">Waist</th>
                            <th className="py-2 px-2">Hips</th>
                            <th className="py-2 px-2">Shoulder</th>
                            <th className="py-2 px-2">Sleeves</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-[9px] text-neutral-600 font-body">
                          {[
                            { size: 'XS', bust: '38', waist: '33', hips: '39', shoulder: '15.5', sleeves: '24' },
                            { size: 'S', bust: '40', waist: '35', hips: '42', shoulder: '16', sleeves: '24' },
                            { size: 'M', bust: '42', waist: '37', hips: '44', shoulder: '16.5', sleeves: '24.5' },
                            { size: 'XL', bust: '44', waist: '39', hips: '46', shoulder: '17', sleeves: '25' },
                            { size: 'XXL', bust: '47', waist: '40', hips: '49', shoulder: '18', sleeves: '25' },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-2 px-2 font-bold text-primary">{row.size}</td>
                              <td className="py-2 px-2">{row.bust}</td>
                              <td className="py-2 px-2">{row.waist}</td>
                              <td className="py-2 px-2">{row.hips}</td>
                              <td className="py-2 px-2">{row.shoulder}</td>
                              <td className="py-2 px-2">{row.sleeves}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[56px] h-12 border font-bold text-[10px] transition-all flex items-center justify-center px-4 rounded-none cursor-pointer ${selectedSize === size ? 'border-primary bg-primary text-white' : 'bg-white border-[#E4DFDE] text-neutral-400 hover:border-neutral-300'}`}
                >
                  {getSizeWithNumber(size)}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex gap-4 font-body">
            <button 
              onClick={handleAcquire}
              disabled={product.stock <= 0}
              className="flex-1 btn-primary py-4.5 bg-primary text-white font-medium text-xs uppercase tracking-[0.18em] hover:bg-accent disabled:bg-neutral-200 transition-all rounded-none cursor-pointer font-heading"
            >
              {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
            </button>
            <button 
              onClick={() => toggleWishlist(product.id)}
              className="w-16 h-16 border border-[#E4DFDE] flex items-center justify-center hover:bg-[#FAFAF9] transition-colors group rounded-none cursor-pointer"
            >
              <Heart className={`w-5 h-5 transition-colors ${wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Delivery & Security Accents */}
          <div className="grid grid-cols-1 gap-4 pt-6 border-t border-[#E4DFDE] font-body">
            <div className="flex items-center gap-5">
              <div className="p-3 border border-[#E4DFDE] rounded-none"><Truck className="w-4 h-4 text-neutral-900" /></div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] font-heading">Estimated Delivery</p>
                <p className="text-[9px] text-neutral-400 tracking-widest mt-1 font-body">
                  {product.deliveryFeeEnabled 
                    ? `Insured courier delivery for ₹${product.deliveryFeeAmount}${product.deliveryFeeNotes ? ` (${product.deliveryFeeNotes})` : ''}`
                    : "Complimentary Free Delivery & packaging"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-3 border border-[#E4DFDE] rounded-none"><ShieldCheck className="w-4 h-4 text-neutral-900" /></div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] font-heading">Authenticity Guaranteed</p>
                <p className="text-[9px] text-neutral-400 tracking-widest mt-1 font-body">Each creation arrives certified premium Volahi</p>
              </div>
            </div>
          </div>

          {/* ==================== COLLAPSIBLE ACCORDION ROWS ==================== */}
          <div className="pt-8 border-t border-[#E4DFDE] space-y-4 font-body">
            
            {/* Row 1: Narrative */}
            <div className="border-b border-[#E4DFDE] pb-4">
              <button 
                onClick={() => setNarrativeOpen(!narrativeOpen)}
                className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.18em] font-heading text-left cursor-pointer"
              >
                <span>Silhouette Narrative</span>
                <span className="text-xs font-semibold">{narrativeOpen ? '—' : '+'}</span>
              </button>
              <AnimatePresence initial={false}>
                {narrativeOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-neutral-500 text-[11px] md:text-xs leading-[1.8] md:leading-[2] tracking-[0.16em] pt-4 font-body">
                      {product.description} Every dynamic stitch and precise seam in this Volahi creation has been meticulously cataloged to fulfill premium high-fashion attributes.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Row 2: Composition */}
            <div className="border-b border-[#E4DFDE] pb-4">
              <button 
                onClick={() => setCompositionOpen(!compositionOpen)}
                className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.18em] font-heading text-left cursor-pointer"
              >
                <span>Composition & Features</span>
                <span className="text-xs font-semibold">{compositionOpen ? '—' : '+'}</span>
              </button>
              <AnimatePresence initial={false}>
                {compositionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      <p className="text-neutral-500 text-[11px] md:text-xs leading-[1.8] md:leading-[2] tracking-widest font-body">
                        This couture piece is synthesized with premium <span className="text-primary font-bold">{product.material}</span>, selected specifically to ensure an editorial drape and lightweight luxury tactile sensation.
                      </p>
                      {product.features.length > 0 && (
                        <ul className="space-y-2 text-[9px] uppercase tracking-[0.18em] font-bold text-neutral-400">
                          {product.features.map((f, idx) => (
                            <li key={idx}><span className="text-primary mr-3">•</span> {f}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Row 3: Care Guide */}
            <div className="border-b border-[#E4DFDE] pb-4">
              <button 
                onClick={() => setCareOpen(!careOpen)}
                className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.18em] font-heading text-left cursor-pointer"
              >
                <span>Atelier Care Guide</span>
                <span className="text-xs font-semibold">{careOpen ? '—' : '+'}</span>
              </button>
              <AnimatePresence initial={false}>
                {careOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-neutral-500 text-[11px] md:text-xs leading-[1.8] md:leading-[2] tracking-widest pt-4 font-body">
                      {product.careInstructions || 'Dry Clean recommended. Store in our custom garment breathable cloth bags on structured padded hangers to preserve delicate threads.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== REVIEWS & RATING MODULE ==================== */}
      <div className="mb-40 border-t border-[#E4DFDE] pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Reviews list */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl md:text-2xl font-heading uppercase tracking-[0.18em] mb-8 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neutral-600" /> Dynamic Reviews ({product.reviews?.length || 0})
            </h3>

            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r, idx) => (
                  <div key={idx} className="border-b border-neutral-100 pb-6 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider font-heading">
                      <span className="text-primary">{r.reviewerName}</span>
                      <span className="text-neutral-300 font-bold uppercase tracking-[0.18em]">{r.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-yellow-500 py-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 tracking-widest leading-relaxed font-body">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-400 uppercase tracking-widest py-10">No reviews placed yet. Be the first to catalog your couture experience.</p>
              )}
            </div>
          </div>

          {/* Leave a review Form */}
          <div className="lg:col-span-5 bg-secondary p-8 border border-[#E4DFDE] rounded-none font-body">
            <h4 className="text-lg md:text-xl font-heading uppercase tracking-[0.18em] mb-6">Leave an Atelier Review</h4>
            
            {reviewSuccess && (
              <div className="mb-6 p-4 bg-green-50/50 border border-green-100 text-green-700 text-xs font-semibold uppercase tracking-widest leading-relaxed text-center font-body">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5 font-heading">Reviewer Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                  placeholder="e.g. Charlotte Dupont"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5 font-heading">Acquisition rating</label>
                <select 
                  className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-bold focus:outline-none focus:border-primary font-heading cursor-pointer"
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
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5 font-heading">Your review statement</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary tracking-wide"
                  placeholder="Reflect on the styling, silhouette drape, fabric tactile quality..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-white py-3.5 font-bold text-[10px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-accent transition-colors rounded-none cursor-pointer font-heading"
              >
                Publish Review <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Related Creations */}
      {relatedProducts.length > 0 && (
        <div className="font-heading">
          <div className="flex items-end justify-between mb-16 border-b border-[#E4DFDE] pb-4">
            <h2 className="text-2xl md:text-3xl font-heading uppercase tracking-[0.18em]">Similar Creations</h2>
            <Link href="/products" className="text-[10px] uppercase tracking-[0.18em] font-bold border-b border-primary pb-1">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-12 font-body">
            {relatedProducts.map((p) => (
              <Link 
                key={p.id} 
                href={`/products/detail?id=${p.id}`} 
                className="group block relative transition-all duration-300 rounded-none text-left"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#FAFAF9] border border-[#E4DFDE] mb-3 relative rounded-none">
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 aspect-[4/5] rounded-none" 
                    style={{ objectPosition: p.imagePosition?.[0] ?? 'center 50%' }}
                    alt={p.name} 
                  />
                   {/* New In Badge */}
                   {(p.newArrival || p.discountPrice) && (
                     <div className="absolute top-0 left-0 z-10 bg-white text-[#1C1C1C] text-[8px] font-bold px-2 py-1 border-r border-b border-[#E4DFDE] tracking-widest uppercase select-none">
                       New
                     </div>
                   )}
                   {/* Size Hover Overlay */}
                   <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2.5 px-3 border-t border-[#E4DFDE] flex flex-wrap gap-1 justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none rounded-none">
                     <span className="text-[7px] font-bold tracking-[0.18em] text-neutral-400 uppercase mr-1">Sizes:</span>
                     {p.sizes.map((s: string) => (
                       <span key={s} className="text-[8px] font-bold text-primary px-1.5 py-0.5 border border-[#E4DFDE] bg-slate-50 uppercase tracking-[0.18em] rounded-none">
                         {getSizeWithNumber(s)}
                       </span>
                     ))}
                   </div>
                </div>
                <div className="text-left mt-3 space-y-1">
                  <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C1C1C] group-hover:text-primary transition-colors leading-tight">{p.name}</h3>
                  <div className="pt-0.5">
                    <span className="font-body text-xs font-semibold text-primary tracking-wide">₹{p.price.toLocaleString()}</span>
                  </div>
                </div>
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
    <main className="bg-background min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="pt-40 text-center font-heading text-3xl uppercase tracking-[0.18em] animate-pulse">Entering Volahi Collection...</div>}>
        <ProductDetailsContent />
      </Suspense>
    </main>
  );
}
