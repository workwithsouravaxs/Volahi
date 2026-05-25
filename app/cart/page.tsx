"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useVolahiStore } from '@/lib/store';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart } = useVolahiStore();

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 15000 ? 0 : 499;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  return (
    <main className="min-h-screen bg-[#FFF9F7] font-body text-primary">
      <Navbar />
      
      <div className="pt-40 pb-32 max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-heading mb-12 uppercase tracking-tighter">Shopping Bag</h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div 
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white p-6 rounded border border-neutral-100 flex gap-6 shadow-sm"
                  >
                    <div className="w-24 h-32 rounded bg-neutral-50 overflow-hidden border border-neutral-100/50 flex-shrink-0">
                      <img src={item.product.image} className="w-full h-full object-cover" alt={item.product.name} />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-[8px] text-cta font-bold uppercase tracking-[0.2em]">{item.product.category}</span>
                          <h3 className="font-heading text-xl mt-1 mb-2 uppercase tracking-tighter">{item.product.name}</h3>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                            Allocation: {item.selectedSize} / {item.selectedColor}
                          </p>
                        </div>
                        <p className="font-bold text-slate-800">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-100 rounded overflow-hidden bg-white">
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-2 hover:bg-neutral-50"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 font-bold text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-2 hover:bg-neutral-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-neutral-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="pt-6">
                <Link href="/products" className="text-[10px] font-bold text-cta uppercase tracking-[0.3em] hover:underline">
                  ← Continue Exploring Creations
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded border border-neutral-100 shadow-sm sticky top-36 space-y-8">
                <h3 className="font-heading text-2xl uppercase tracking-tighter pb-4 border-b border-neutral-50">Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-slate-800">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Atelier Delivery</span>
                    <span className="text-slate-800">{shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Tax (GST 12%)</span>
                    <span className="text-slate-800">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="pt-6 border-t border-neutral-100 flex justify-between items-end">
                    <span className="font-heading text-lg uppercase tracking-tighter">Total Allocation</span>
                    <span className="text-2xl font-bold text-primary tracking-tight">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full btn-primary py-4.5 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 rounded">
                  Acquire Order <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-cta" /> Insured Secure Atelier Transaction
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-32 text-center max-w-md mx-auto space-y-6">
            <div className="bg-white border w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <ShoppingBag className="w-8 h-8 text-neutral-300" />
            </div>
            <h2 className="text-3xl font-heading uppercase tracking-tighter">Your bag is empty</h2>
            <p className="text-neutral-400 text-xs tracking-widest leading-[1.8]">Looks like you haven't allocated any couture creations to your shopping bag yet.</p>
            <div className="pt-4">
              <Link href="/products" className="btn-primary py-4 px-10 text-[9px] font-bold tracking-widest uppercase">Start Exploring</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
