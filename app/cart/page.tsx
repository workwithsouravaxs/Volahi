"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useVolahiStore, getSizeWithNumber } from '@/lib/store';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart } = useVolahiStore();

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = cart.reduce((acc, item) => {
    if (item.product.deliveryFeeEnabled) {
      return acc + (Number(item.product.deliveryFeeAmount) || 0) * item.quantity;
    }
    return acc;
  }, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  return (
    <main className="min-h-screen bg-background font-body text-primary">
      <Navbar />
      
      <div className="pt-40 pb-32 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-heading mb-12 uppercase tracking-[0.18em]">Shopping Cart</h1>

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
                    className="bg-white p-4 md:p-6 rounded-none border border-[#E4DFDE] flex gap-4 md:gap-6 hover:border-primary transition-colors"
                  >
                    <div className="w-20 h-28 md:w-24 md:h-32 rounded-none bg-neutral-50 overflow-hidden border border-[#E4DFDE] flex-shrink-0">
                      <img src={item.product.image} className="w-full h-full object-cover" alt={item.product.name} />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-[8px] text-primary font-bold uppercase tracking-[0.18em]">{item.product.category}</span>
                          <h3 className="font-heading text-sm md:text-lg mt-1 mb-1.5 uppercase tracking-[0.18em]">{item.product.name}</h3>
                          <p className="text-[9px] md:text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-body">
                            Allocation: {getSizeWithNumber(item.selectedSize)} / {item.selectedColor}
                          </p>
                        </div>
                        <p className="text-sm md:text-base font-semibold text-accent">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#E4DFDE] rounded-none overflow-hidden bg-white">
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-2 hover:bg-[#FAFAF9] rounded-none cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 font-bold text-xs font-body">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-2 hover:bg-[#FAFAF9] rounded-none cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-neutral-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="pt-6">
                <Link href="/products" className="text-[10px] font-bold text-primary uppercase tracking-[0.18em] hover:underline">
                  ← Continue Exploring Creations
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-none border border-[#E4DFDE] sticky top-36 space-y-8">
                <h3 className="font-heading text-xl uppercase tracking-[0.18em] pb-4 border-b border-[#E4DFDE]">Summary</h3>
                
                <div className="space-y-4 font-body">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-accent font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Atelier Delivery</span>
                    <span className="text-accent font-semibold">{shipping === 0 ? 'FREE DELIVERY' : `₹${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <span>Tax (GST 12%)</span>
                    <span className="text-accent font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="pt-6 border-t border-[#E4DFDE] flex justify-between items-end">
                    <span className="font-heading text-sm uppercase tracking-[0.18em]">Total Allocation</span>
                    <span className="text-xl font-bold text-primary tracking-tighter">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full btn-primary py-4.5 bg-primary text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-accent transition-all flex items-center justify-center gap-2 rounded-none">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[9px] text-neutral-400 font-bold uppercase tracking-[0.18em] font-body">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Insured Secure Atelier Transaction
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-32 text-center max-w-md mx-auto space-y-6">
            <div className="bg-white border border-[#E4DFDE] w-20 h-20 rounded-none flex items-center justify-center mx-auto shadow-sm">
              <ShoppingBag className="w-8 h-8 text-neutral-300" />
            </div>
            <h2 className="text-2xl font-heading uppercase tracking-[0.18em]">Your cart is empty</h2>
            <p className="text-neutral-400 text-xs tracking-widest leading-[1.8] font-body">Looks like you haven't allocated any couture creations to your shopping cart yet.</p>
            <div className="pt-4">
              <Link href="/products" className="btn-primary py-4 px-10 text-[9px] font-bold tracking-[0.18em] uppercase rounded-none">Start Exploring</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
