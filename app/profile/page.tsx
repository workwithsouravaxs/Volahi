"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useVolahiStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { ShoppingBag, User, LogOut, CheckCircle, Package, Truck, Compass, Sparkles, Phone } from 'lucide-react';
import Link from 'next/link';

export default function CustomerProfile() {
  const router = useRouter();
  const { currentUser, logoutUser, orders, deleteOrder, updateOrderStatus } = useVolahiStore();

  React.useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body">
        <p className="font-heading text-lg tracking-widest animate-pulse">Securing Client Authorization...</p>
      </div>
    );
  }

  // Filter orders placed by this customer
  const clientOrders = orders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());

  return (
    <main className="min-h-screen bg-background font-body text-primary">
      <Navbar />

      <div className="pt-40 pb-32 max-w-7xl mx-auto px-4">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-neutral-100 mb-16 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-heading text-2xl font-bold uppercase tracking-widest">
              {currentUser.name.slice(0, 2)}
            </div>
            <div>
              <span className="text-[10px] text-cta font-bold uppercase tracking-[0.3em] block">Volahi Atelier Patron</span>
              <h1 className="text-4xl font-heading uppercase tracking-tighter mt-1">{currentUser.name}</h1>
              <span className="text-xs text-neutral-400 font-bold tracking-wider uppercase mt-1 block">{currentUser.email}</span>
              {currentUser.phone && (
                <span className="text-xs text-neutral-400 font-bold tracking-wider mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {currentUser.phone}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              logoutUser();
              router.push('/auth');
            }}
            className="flex items-center gap-2 border border-neutral-200 px-5 py-3 hover:bg-neutral-50 transition-colors font-bold text-[10px] uppercase tracking-widest rounded"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Order Logs / Tracking */}
          <div className="lg:col-span-8 space-y-10">
            <h2 className="text-2xl font-heading uppercase tracking-tighter mb-8 flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-neutral-600" /> Couture Orders History ({clientOrders.length})
            </h2>

            {clientOrders.length > 0 ? (
              <div className="space-y-12">
                {clientOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-neutral-100 p-8 rounded shadow-sm space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-4 gap-4">
                      <div>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">ID Allocation</span>
                        <span className="text-sm font-bold text-slate-800 tracking-widest block">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Authorized On</span>
                        <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">{order.date}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Total Spent</span>
                        <span className="text-sm font-bold text-slate-900 block">₹{order.total.toLocaleString()}</span>
                      </div>
                      {(order.status === 'Pending Approval' || order.status === 'Approved' || order.status === 'Processing') && (
                        <div>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to cancel this couture order? This action cannot be undone.")) {
                                updateOrderStatus(order.id, 'Cancelled');
                              }
                            }}
                            className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded text-[9px] font-bold uppercase tracking-widest transition-colors hover:border-red-300 active:scale-95"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Tracking Notifications or Progress Steps */}
                    {order.status === 'Pending Approval' ? (
                      <div className="p-5 bg-slate-50 border border-slate-100 text-center rounded space-y-2">
                        <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-[8px] font-bold uppercase tracking-widest rounded-sm">Pending Review</span>
                        <h4 className="text-sm font-heading font-medium tracking-tight uppercase">Awaiting Atelier Authorization</h4>
                        <p className="text-neutral-400 text-[10px] tracking-wider leading-relaxed max-w-md mx-auto">
                          Our design directors are auditing your couture allocations. Standard review completes inside 1–3 business hours.
                        </p>
                      </div>
                    ) : order.status === 'Rejected' ? (
                      <div className="p-5 bg-red-50/50 border border-red-100 text-center rounded space-y-2">
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-bold uppercase tracking-widest rounded-sm">Rejected</span>
                        <h4 className="text-sm font-heading font-medium tracking-tight uppercase text-red-800">Acquisition Declined</h4>
                        <p className="text-red-600/70 text-[10px] tracking-wider leading-relaxed max-w-md mx-auto">
                          This order has been declined by the atelier directors. Please connect with our client services for assistance.
                        </p>
                      </div>
                    ) : order.status === 'Cancelled' ? (
                      <div className="p-5 bg-orange-50/50 border border-orange-100 text-center rounded space-y-2">
                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-bold uppercase tracking-widest rounded-sm">Cancelled</span>
                        <h4 className="text-sm font-heading font-medium tracking-tight uppercase text-orange-800">Order Cancelled by You</h4>
                        <p className="text-orange-600/70 text-[10px] tracking-wider leading-relaxed max-w-md mx-auto">
                          You have cancelled this couture acquisition. This record is kept for your reference.
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="flex justify-between max-w-lg mx-auto relative">
                          {/* Progress Bar */}
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-100 -translate-y-1/2 z-0" />
                          <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-700 z-0" 
                            style={{ 
                              width: order.status === 'Shipped' ? '50%' : order.status === 'Delivered' ? '100%' : '0%' 
                            }}
                          />

                          {/* Step 1: Processing */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                              <Package className="w-4 h-4" />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-wider mt-2.5 text-primary">Atelier Processing</span>
                          </div>

                          {/* Step 2: Shipped */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <Truck className="w-4 h-4" />
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider mt-2.5 ${
                              order.status === 'Shipped' || order.status === 'Delivered' ? 'text-primary' : 'text-neutral-400'
                            }`}>In Transit</span>
                          </div>

                          {/* Step 3: Delivered */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              order.status === 'Delivered' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider mt-2.5 ${
                              order.status === 'Delivered' ? 'text-primary' : 'text-neutral-400'
                            }`}>Hand Delivered</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {order.status === 'Shipped' && order.trackingUrl && (
                      <div className="bg-secondary p-5 border border-neutral-100 rounded flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div className="text-center sm:text-left">
                          <span className="block text-[8px] text-cta font-bold uppercase tracking-[0.2em]">Active Dispatch Courier Link</span>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Insured tracking index allocated</span>
                        </div>
                        <a 
                          href={order.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 hover:bg-neutral-800 transition-all rounded"
                        >
                          Track Couture Piece ↗
                        </a>
                      </div>
                    )}

                    {/* Order Items Details */}
                    <div className="border-t border-slate-50 pt-6 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Acquired Pieces</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <img src={item.product.image} className="w-10 h-14 object-cover rounded-sm border border-neutral-100" alt="" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{item.product.name}</p>
                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                              Allocation: {item.selectedSize} / {item.selectedColor} x {item.quantity}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-900">₹{item.product.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 border border-dashed border-neutral-200 text-center rounded bg-white">
                <Compass className="w-10 h-10 text-neutral-300 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-heading mb-2 uppercase tracking-widest">No dynamic order logs</h3>
                <p className="text-neutral-400 text-xs tracking-wider mb-8">Begin shopping to secure elite couture order tracking indices.</p>
                <Link href="/products" className="btn-primary inline-block">Begin Exploration</Link>
              </div>
            )}
          </div>

          {/* Patron Perks / Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-neutral-100 p-8 rounded shadow-sm space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cta fill-cta" /> Elite Patron Perks
              </h3>
              <p className="text-xs text-neutral-500 tracking-widest leading-relaxed">
                As a prioritized client at the Volahi Atelier, you automatically enjoy:
              </p>
              <ul className="space-y-4 text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-500 pt-2">
                <li><span className="text-cta mr-2">•</span> Insured Global Courier delivery</li>
                <li><span className="text-cta mr-2">•</span> 14-day hassle-free couture exchanges</li>
                <li><span className="text-cta mr-2">•</span> Direct custom size tailored allocations</li>
                <li><span className="text-cta mr-2">•</span> 24/7 dedicated stylist advisory</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
