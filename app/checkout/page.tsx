"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useVolahiStore, getSizeWithNumber } from '@/lib/store';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, currentUser, placeOrder, clearCart } = useVolahiStore();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || '');

  // Checkout States
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center font-body text-primary p-6">
        <Navbar />
        <div className="w-full max-w-xl bg-white border border-[#E4DFDE] p-12 text-center space-y-8 rounded-none shadow-md">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto" />
          
          <div className="space-y-3">
            <span className="text-[9px] text-primary font-bold uppercase tracking-[0.18em] font-heading">Atelier Authentication Required</span>
            <h2 className="text-3xl font-heading uppercase tracking-[0.18em]">Client Account Required</h2>
            <p className="text-neutral-400 text-xs tracking-widest max-w-sm mx-auto leading-relaxed font-body">
              To secure your couture acquisitions, manage tracking allocations, and register designer warranties, you must log in or sign up first.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center font-body">
            <Link href="/auth?redirect=checkout" className="btn-primary py-4 px-8 text-[10px] font-bold tracking-[0.18em] uppercase bg-primary text-white hover:bg-accent transition-all rounded-none">
              Sign In or Register
            </Link>
            <Link href="/products" className="border border-[#E4DFDE] py-4 px-8 text-[10px] font-bold tracking-[0.18em] uppercase hover:bg-[#FAFAF9] text-primary transition-all rounded-none font-heading">
              Explore Couture
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = cart.reduce((acc, item) => {
    if (item.product.deliveryFeeEnabled) {
      return acc + (Number(item.product.deliveryFeeAmount) || 0) * item.quantity;
    }
    return acc;
  }, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsLoading(true);

    setTimeout(() => {
      const orderId = placeOrder({
        customerEmail: emailAddress || currentUser?.email || 'guest@volahi.com',
        customerName: fullName || currentUser?.name || 'COUTURE GUEST',
        shippingDetails: {
          address,
          city,
          zipCode,
          phone,
        },
        items: cart,
        subtotal,
        tax,
        shipping,
        total,
      });

      setGeneratedId(orderId);
      clearCart();
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center font-body text-primary p-6">
        <div className="w-full max-w-xl bg-white border border-[#E4DFDE] p-12 text-center space-y-8 rounded-none shadow-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto animate-bounce" />
          
          <div className="space-y-3">
            <span className="text-[9px] text-primary font-bold uppercase tracking-[0.18em] font-heading">Atelier Order authorized</span>
            <h2 className="text-3xl font-heading uppercase tracking-[0.18em]">Purchase Complete</h2>
            <p className="text-neutral-400 text-xs tracking-widest max-w-sm mx-auto leading-relaxed">
              We appreciate your couture acquisition. Your items are being carefully prepared in our design atelier.
            </p>
          </div>

          <div className="bg-[#FAFAF9] border border-[#E4DFDE] p-6 rounded-none space-y-2">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.18em] block font-heading">Authorized Couture ID</span>
            <span className="text-xl font-bold tracking-[0.18em] uppercase text-primary block font-heading">{generatedId}</span>
          </div>

          <p className="text-[10px] text-neutral-400 font-semibold tracking-widest leading-relaxed">
            Order tracking codes are registered under your account profile dashboard.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={currentUser ? '/profile' : '/products'} className="btn-primary py-4 px-8 text-[10px] font-bold tracking-[0.18em] uppercase bg-primary text-white hover:bg-accent transition-all rounded-none">
              {currentUser ? 'Track Orders on Profile' : 'Continue Shopping'}
            </Link>
            <Link href="/" className="border border-[#E4DFDE] py-4 px-8 text-[10px] font-bold tracking-[0.18em] uppercase hover:bg-[#FAFAF9] text-primary transition-all rounded-none font-heading">
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background font-body text-primary">
      <Navbar />

      <div className="pt-40 pb-32 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-heading mb-12 uppercase tracking-[0.18em]">Secure Checkout</h1>

        {cart.length > 0 ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Form Half */}
            <div className="lg:col-span-7 bg-white border border-[#E4DFDE] p-8 sm:p-12 rounded-none space-y-10">
              
              {/* Account details */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 border-b border-[#E4DFDE] pb-3 font-heading">1. Contact Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                      placeholder="CHARLOTTE DUPONT"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                      placeholder="COUTURE@VOLAHI.COM"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 border-b border-[#E4DFDE] pb-3 font-heading">2. Delivery Destination</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5">Complete Address</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                      placeholder="APARTMENT, SUITE, STREET NAME"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5">City / Town</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                        placeholder="MUMBAI"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5">Zip Code</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                        placeholder="400001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2.5">Contact Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      className="w-full bg-white border border-[#E4DFDE] rounded-none p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section - Elegant Mock */}
              <div className="space-y-6 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400 border-b border-[#E4DFDE] pb-3 font-heading">3. Payment Allocation</h3>
                <div className="p-4 border border-[#E4DFDE] rounded-none bg-[#FAFAF9] flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-accent font-heading">Cash on Delivery</span>
                    <span className="block text-[8px] text-neutral-400 uppercase tracking-widest mt-0.5 font-body">Settle with courier at doorstep</span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
              </div>

            </div>

            {/* Sticky Order Summaries half */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E4DFDE] p-8 sm:p-12 rounded-none sticky top-36 space-y-8">
                <h3 className="font-heading text-xl uppercase tracking-[0.18em] pb-4 border-b border-[#E4DFDE]">Order Summary</h3>
                
                {/* List items */}
                <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center border-b border-[#E4DFDE] pb-4">
                      <img src={item.product.image} className="w-10 h-14 object-cover rounded-none border border-[#E4DFDE]" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-accent uppercase tracking-tight truncate font-body">{item.product.name}</p>
                        <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest mt-1 font-body">
                          {getSizeWithNumber(item.selectedSize)} / {item.selectedColor} x {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-accent font-body">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-4 pt-4 font-body">
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
                    <span className="font-heading text-sm uppercase tracking-[0.18em]">Acquisition total</span>
                    <span className="text-xl font-bold text-primary tracking-tighter">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-4.5 font-bold text-xs uppercase tracking-[0.18em] hover:bg-accent transition-all flex items-center justify-center gap-2 rounded-none disabled:bg-neutral-200 cursor-pointer font-heading"
                >
                  {isLoading ? 'AUTHORIZING COUTURE...' : 'PLACE AUTHORIZED ORDER'} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[9px] text-neutral-400 font-bold uppercase tracking-[0.18em] pt-2 font-body">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Insured Secure Atelier Transaction
                </div>
              </div>
            </div>

          </form>
        ) : (
          <div className="py-20 border border-dashed border-[#E4DFDE] text-center rounded-none bg-white max-w-md mx-auto space-y-6 font-body">
            <h3 className="text-xl font-heading mb-2 uppercase tracking-[0.18em]">Awaiting Cart Allocations</h3>
            <p className="text-neutral-400 text-xs tracking-widest mb-8">You cannot checkout without items inside your Shopping Cart.</p>
            <Link href="/products" className="btn-primary inline-block rounded-none font-heading">Begin Exploration</Link>
          </div>
        )}
      </div>
    </main>
  );
}
