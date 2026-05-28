"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVolahiStore, Product, Banner, Order } from '@/lib/store';
import { uploadProductImage, uploadBannerImage, verifyAdmin } from '@/lib/supabase';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Settings,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sliders,
  CheckCircle,
  Image,
  Eye,
  EyeOff,
  Star,
  Activity,
  Link2,
  X as XIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const {
    products,
    banners,
    middleBanner,
    orders,
    isAdminAuthenticated,
    logoutAdmin,
    addProduct,
    editProduct,
    deleteProduct,
    addBanner,
    deleteBanner,
    toggleBannerStatus,
    setMiddleBanner,
    updateOrderStatus,
    deleteOrder,
    categories,
    addCategory,
    deleteCategory,
    socialLinks,
    setSocialLink,
  } = useVolahiStore();

  // Route security gate: authorized only
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, router]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'banners' | 'orders' | 'customers' | 'categories' | 'social'>('dashboard');

  // Search & Filter state
  const [productQuery, setProductQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Customer Detail State
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

  // Product Form overlays/state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState('Designer Sarees');
  const [pSubcategory, setPSubcategory] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pDiscountPrice, setPDiscountPrice] = useState(0);
  const [pStock, setPStock] = useState(1);
  const [pSku, setPSku] = useState('');
  const [pBrand, setPBrand] = useState('Volahi');
  const [pMaterial, setPMaterial] = useState('');
  const [uploadedProductImages, setUploadedProductImages] = useState<string[]>([]);
  const [imagePositions, setImagePositions] = useState<string[]>([]);
  // Refs & state for free crop tool
  const cropImgRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [cropModal, setCropModal] = useState<{ index: number; url: string } | null>(null);
  const [previewAdjustIndex, setPreviewAdjustIndex] = useState<number | null>(null);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [cropDragState, setCropDragState] = useState<{
    mode: 'create' | 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';
    startX: number; startY: number;
    origBox: { x: number; y: number; w: number; h: number } | null;
  } | null>(null);
  const [cropAspect, setCropAspect] = useState<number | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [pColors, setPColors] = useState(''); // Comma separated
  const [pSizes, setPSizes] = useState<string[]>([]);
  const [pCustomSize, setPCustomSize] = useState('');
  const [pAllSizesAvailable, setPAllSizesAvailable] = useState(false);
  const [pTags, setPTags] = useState('');
  const [pFeatures, setPFeatures] = useState('');
  const [pCare, setPCare] = useState('');
  const [pShipping, setPShipping] = useState('Standard complimentary delivery (3-5 business days)');
  const [pReturn, setPReturn] = useState('Enjoy our 14-day hassle-free couture return and exchange policy.');
  const [pStatus, setPStatus] = useState<'Active' | 'Inactive'>('Active');
  const [pFeatured, setPFeatured] = useState(false);
  const [pBestSeller, setPBestSeller] = useState(false);
  const [pNewArrival, setPNewArrival] = useState(false);

  // Banner Form State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bImage, setBImage] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bCtaText, setBCtaText] = useState('Discover Couture');
  const [bCtaLink, setBCtaLink] = useState('/products');

  // Middle Banner Form State
  const [isUploadingMiddleBanner, setIsUploadingMiddleBanner] = useState(false);
  const [middleCtaLink, setMiddleCtaLink] = useState('/products');

  // Media Device Upload Handlers
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // File validation & size safeguard
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValidType) alert(`File ${file.name} is not a valid image type (JPEG, PNG, WEBP).`);
      if (!isValidSize) alert(`File ${file.name} exceeds the 5MB size limit.`);
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setIsUploadingImages(true);
    const uploadPromises = validFiles.map(async (file) => {
      try {
        return await uploadProductImage(file);
      } catch (err) {
        console.error("Upload error:", err);
        return '';
      }
    });

    const urls = await Promise.all(uploadPromises);
    const successfulUrls = urls.filter(Boolean);

    setUploadedProductImages(prev => [...prev, ...successfulUrls]);
    setIsUploadingImages(false);
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...uploadedProductImages];
    const newPositions = [...imagePositions];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Swap elements
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    const tempPos = newPositions[index] ?? 'center';
    newPositions[index] = newPositions[targetIndex] ?? 'center';
    newPositions[targetIndex] = tempPos;

    setUploadedProductImages(newImages);
    setImagePositions(newPositions);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedProductImages(uploadedProductImages.filter((_, i) => i !== index));
    setImagePositions(imagePositions.filter((_, i) => i !== index));
    if (cropModal?.index === index) { setCropModal(null); setCropBox(null); }
  };

  // ── Crop tool helpers ──────────────────────────────────────────────
  const CROP_HANDLE = 12;

  const getCropRelPos = (e: React.MouseEvent) => {
    const el = cropContainerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height)),
    };
  };

  const getCropHitMode = (pos: { x: number; y: number }, box: NonNullable<typeof cropBox>) => {
    const { x, y, w, h } = box;
    if (Math.abs(pos.x - x) <= CROP_HANDLE && Math.abs(pos.y - y) <= CROP_HANDLE) return 'resize-tl' as const;
    if (Math.abs(pos.x - (x + w)) <= CROP_HANDLE && Math.abs(pos.y - y) <= CROP_HANDLE) return 'resize-tr' as const;
    if (Math.abs(pos.x - x) <= CROP_HANDLE && Math.abs(pos.y - (y + h)) <= CROP_HANDLE) return 'resize-bl' as const;
    if (Math.abs(pos.x - (x + w)) <= CROP_HANDLE && Math.abs(pos.y - (y + h)) <= CROP_HANDLE) return 'resize-br' as const;
    if (pos.x > x + CROP_HANDLE && pos.x < x + w - CROP_HANDLE && pos.y > y + CROP_HANDLE && pos.y < y + h - CROP_HANDLE) return 'move' as const;
    return 'create' as const;
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getCropRelPos(e);
    const mode = cropBox && cropBox.w > 10 ? getCropHitMode(pos, cropBox) : 'create';
    setCropDragState({ mode, startX: pos.x, startY: pos.y, origBox: cropBox ? { ...cropBox } : null });
    if (mode === 'create') setCropBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!cropDragState) return;
    e.preventDefault();
    const pos = getCropRelPos(e);
    const el = cropContainerRef.current;
    if (!el) return;
    const maxW = el.offsetWidth;
    const maxH = el.offsetHeight;
    const dx = pos.x - cropDragState.startX;
    const dy = pos.y - cropDragState.startY;

    if (cropDragState.mode === 'create') {
      let x = Math.min(cropDragState.startX, pos.x);
      let y = Math.min(cropDragState.startY, pos.y);
      let w = Math.abs(dx);
      let h = Math.abs(dy);
      if (cropAspect && w > 0) {
        h = w / cropAspect;
        if (pos.y < cropDragState.startY) y = cropDragState.startY - h;
        if (pos.x < cropDragState.startX) x = cropDragState.startX - w;
      }
      setCropBox({ x: Math.max(0, x), y: Math.max(0, y), w: Math.min(w, maxW - Math.max(0, x)), h: Math.min(h, maxH - Math.max(0, y)) });

    } else if (cropDragState.mode === 'move' && cropDragState.origBox) {
      const ob = cropDragState.origBox;
      setCropBox({ ...ob, x: Math.max(0, Math.min(ob.x + dx, maxW - ob.w)), y: Math.max(0, Math.min(ob.y + dy, maxH - ob.h)) });

    } else if (cropDragState.origBox) {
      const ob = cropDragState.origBox;
      let { x, y, w, h } = ob;
      if (cropDragState.mode === 'resize-br') {
        w = Math.max(20, ob.w + dx);
        h = cropAspect ? w / cropAspect : Math.max(20, ob.h + dy);
      } else if (cropDragState.mode === 'resize-tl') {
        const nx = Math.max(0, Math.min(ob.x + dx, ob.x + ob.w - 20));
        const ny = Math.max(0, Math.min(ob.y + dy, ob.y + ob.h - 20));
        w = ob.w + (ob.x - nx); h = cropAspect ? w / cropAspect : ob.h + (ob.y - ny);
        x = nx; y = cropAspect ? ob.y + ob.h - h : ny;
      } else if (cropDragState.mode === 'resize-tr') {
        w = Math.max(20, ob.w + dx);
        const ny = Math.max(0, Math.min(ob.y + dy, ob.y + ob.h - 20));
        h = cropAspect ? w / cropAspect : ob.h + (ob.y - ny);
        y = cropAspect ? ob.y + ob.h - h : ny;
      } else if (cropDragState.mode === 'resize-bl') {
        const nx = Math.max(0, Math.min(ob.x + dx, ob.x + ob.w - 20));
        w = ob.w + (ob.x - nx); h = cropAspect ? w / cropAspect : Math.max(20, ob.h + dy);
        x = nx;
      }
      if (w > 0 && h > 0) setCropBox({ x: Math.max(0, x), y: Math.max(0, y), w: Math.min(w, maxW - Math.max(0, x)), h: Math.min(h, maxH - Math.max(0, y)) });
    }
  };

  const handleCropMouseUp = () => setCropDragState(null);

  const handleApplyCrop = async () => {
    if (!cropBox || !cropModal || !cropImgRef.current || cropBox.w < 10 || cropBox.h < 10) return;
    setIsApplyingCrop(true);
    const img = cropImgRef.current;
    const displayW = cropContainerRef.current?.offsetWidth || img.offsetWidth;
    const displayH = cropContainerRef.current?.offsetHeight || img.offsetHeight;
    const scaleX = img.naturalWidth / displayW;
    const scaleY = img.naturalHeight / displayH;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropBox.w * scaleX);
    canvas.height = Math.round(cropBox.h * scaleY);
    const ctx = canvas.getContext('2d');
    if (!ctx) { setIsApplyingCrop(false); return; }
    ctx.drawImage(img, cropBox.x * scaleX, cropBox.y * scaleY, cropBox.w * scaleX, cropBox.h * scaleY, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) { setIsApplyingCrop(false); return; }
      try {
        const file = new File([blob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const newUrl = await uploadProductImage(file);
        const imgs = [...uploadedProductImages];
        imgs[cropModal.index] = newUrl;
        setUploadedProductImages(imgs);
        const pos = [...imagePositions];
        while (pos.length <= cropModal.index) pos.push('center 50%');
        pos[cropModal.index] = 'center 50%';
        setImagePositions(pos);
        setCropModal(null); setCropBox(null); setCropDragState(null);
      } catch { alert('Crop upload failed. Please try again.'); }
      setIsApplyingCrop(false);
    }, 'image/jpeg', 0.95);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Validate size (< 8MB) and type
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const isValidSize = file.size <= 8 * 1024 * 1024; // 8MB limit
    if (!isValidType) {
      alert('Banner is not a valid image type (JPEG, PNG, WEBP).');
      return;
    }
    if (!isValidSize) {
      alert('Banner exceeds the 8MB size limit.');
      return;
    }

    setIsUploadingBanner(true);
    try {
      const url = await uploadBannerImage(file);
      setBImage(url);
    } catch (err) {
      console.error("Banner upload error:", err);
    }
    setIsUploadingBanner(false);
  };

  const handleMiddleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const isValidSize = file.size <= 8 * 1024 * 1024;
    if (!isValidType) {
      alert('Banner is not a valid image type (JPEG, PNG, WEBP).');
      return;
    }
    if (!isValidSize) {
      alert('Banner exceeds the 8MB size limit.');
      return;
    }

    setIsUploadingMiddleBanner(true);
    try {
      const url = await uploadBannerImage(file);
      const newMidBanner: Banner = {
        id: 'MID' + Math.floor(100000 + Math.random() * 900000),
        image: url,
        title: 'Atelier Spotlight',
        subtitle: 'EXCLUSIVE COUTURE',
        ctaText: 'Shop Spotlight',
        ctaLink: middleCtaLink,
        active: true,
      };
      setMiddleBanner(newMidBanner);
    } catch (err) {
      console.error("Middle banner upload error:", err);
    }
    setIsUploadingMiddleBanner(false);
  };

  const handleUpdateMiddleBannerLink = (link: string) => {
    setMiddleCtaLink(link);
    if (middleBanner) {
      setMiddleBanner({
        ...middleBanner,
        ctaLink: link,
      });
    }
  };

  // Handle Edit product setup
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setPTitle(p.name);
    setPDesc(p.description);
    setPCategory(p.category);
    setPSubcategory(p.subcategory || '');
    setPPrice(p.price);
    setPDiscountPrice(p.discountPrice || 0);
    setPStock(p.stock);
    setPSku(p.sku);
    setPBrand(p.brand);
    setPMaterial(p.material);
    setUploadedProductImages(p.images);
    setImagePositions(p.imagePosition || p.images.map(() => 'center'));
    setCropModal(null); setCropBox(null);
    setPColors(p.colors.join(', '));
    setPSizes(p.sizes);
    setPAllSizesAvailable(p.allSizesAvailable);
    setPTags(p.tags.join(', '));
    setPFeatures(p.features.join(', '));
    setPCare(p.careInstructions);
    setPShipping(p.shippingInfo);
    setPReturn(p.returnPolicy);
    setPStatus(p.status);
    setPFeatured(p.featured);
    setPBestSeller(p.bestSeller);
    setPNewArrival(p.newArrival);
    setIsProductModalOpen(true);
  };

  // Reset form
  const resetProductForm = () => {
    setEditingProduct(null);
    setPTitle('');
    setPDesc('');
    setPCategory('Designer Sarees');
    setPSubcategory('');
    setPPrice(0);
    setPDiscountPrice(0);
    setPStock(1);
    setPSku('');
    setPBrand('Volahi');
    setPMaterial('');
    setUploadedProductImages([]);
    setImagePositions([]);
    setCropModal(null); setCropBox(null);
    setPColors('');
    setPSizes([]);
    setPCustomSize('');
    setPAllSizesAvailable(false);
    setPTags('');
    setPFeatures('');
    setPCare('');
    setPShipping('Standard complimentary delivery (3-5 business days)');
    setPReturn('Enjoy our 14-day hassle-free couture return and exchange policy.');
    setPStatus('Active');
    setPFeatured(false);
    setPBestSeller(false);
    setPNewArrival(false);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const colorArray = pColors.split(',').map((c) => c.trim()).filter(Boolean);
    const tagArray = pTags.split(',').map((t) => t.trim()).filter(Boolean);
    const featureArray = pFeatures.split(',').map((f) => f.trim()).filter(Boolean);

    // Default primary image is the first one, or fallback
    const primaryImg = uploadedProductImages[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000';

    const parsedProduct: Omit<Product, 'reviews'> = {
      id: editingProduct ? editingProduct.id : 'PRD' + Math.floor(100000 + Math.random() * 900000),
      name: pTitle,
      description: pDesc,
      category: pCategory,
      subcategory: pSubcategory,
      price: Number(pPrice),
      discountPrice: pDiscountPrice ? Number(pDiscountPrice) : undefined,
      images: uploadedProductImages.length > 0 ? uploadedProductImages : [primaryImg],
      imagePosition: imagePositions.length > 0 ? imagePositions : undefined,
      image: primaryImg,
      stock: Number(pStock),
      sku: pSku || 'SKU' + Math.floor(10000 + Math.random() * 90000),
      brand: pBrand,
      material: pMaterial,
      colors: colorArray.length > 0 ? colorArray : ['Natural'],
      sizes: pSizes.length > 0 ? pSizes : ['OS'],
      allSizesAvailable: pAllSizesAvailable,
      tags: tagArray,
      features: featureArray,
      careInstructions: pCare,
      shippingInfo: pShipping,
      returnPolicy: pReturn,
      status: pStatus,
      featured: pFeatured,
      bestSeller: pBestSeller,
      newArrival: pNewArrival,
    };

    if (editingProduct) {
      editProduct({ ...parsedProduct, reviews: editingProduct.reviews || [] });
    } else {
      addProduct(parsedProduct);
    }

    setIsProductModalOpen(false);
    resetProductForm();
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bImage) return;

    const newBanner: Banner = {
      id: 'BND' + Math.floor(100000 + Math.random() * 900000),
      image: bImage,
      title: bTitle,
      subtitle: bSubtitle,
      ctaText: bCtaText,
      ctaLink: bCtaLink,
      active: true,
    };

    addBanner(newBanner);
    setIsBannerModalOpen(false);
    setBImage('');
    setBTitle('');
    setBSubtitle('');
    setBCtaText('Discover Couture');
    setBCtaLink('/products');
  };

  const handleToggleSize = (size: string) => {
    if (pSizes.includes(size)) {
      setPSizes(pSizes.filter((s) => s !== size));
    } else {
      setPSizes([...pSizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    if (pCustomSize.trim() && !pSizes.includes(pCustomSize.trim())) {
      setPSizes([...pSizes, pCustomSize.trim().toUpperCase()]);
      setPCustomSize('');
    }
  };

  // Calculations for dynamic dashboard metrics
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const activeProducts = products.filter((p) => p.status === 'Active').length;
  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="font-heading text-lg tracking-widest animate-pulse">Securing Atelier Authority...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed inset-y-0 z-40">
        <div className="px-8 mb-12 py-6 border-b border-slate-50 flex items-center gap-2.5">
          <div className="w-3 h-3 bg-cta rounded-full" />
          <div>
            <h1 className="text-xl font-heading font-bold text-primary tracking-tight">Volahi</h1>
            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Atelier Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'banners' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <Image className="w-4 h-4" />
            <span>Hero Banners</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders {pendingOrders > 0 && <span className="ml-auto bg-cta text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingOrders}</span>}</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'customers' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'categories' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Categories <span className="ml-1 text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">{categories.length}</span></span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'social' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:bg-slate-50'}`}
          >
            <Link2 className="w-4 h-4" />
            <span>Social Media</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Authenticated</p>
            <p className="font-heading font-semibold text-sm">Director Session</p>
            <button
              onClick={() => {
                logoutAdmin();
                router.push('/admin/login');
              }}
              className="text-[9px] text-cta font-bold uppercase tracking-widest mt-4 block hover:underline"
            >
              Sign Out Securely
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 lg:ml-64 p-6 sm:p-10 min-h-screen flex flex-col">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em]">Atelier Panel</span>
            <h1 className="text-3xl font-heading font-bold text-gray-900 uppercase tracking-tight mt-1">
              {activeTab === 'dashboard' ? 'Overview Analytics' : `${activeTab} Management`}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all">
              <ExternalLink className="w-4 h-4" /> Live Storefront
            </Link>
            {activeTab === 'products' && (
              <button
                onClick={() => {
                  resetProductForm();
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Add Couture Piece
              </button>
            )}
            {activeTab === 'banners' && (
              <button
                onClick={() => setIsBannerModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Create Hero Banner
              </button>
            )}
          </div>
        </header>

        {/* ==================== TAB: DASHBOARD OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 flex-1">
            {/* Dynamic Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Sales Revenue</p>
                    <div className="p-2 bg-green-50 text-green-600 rounded"><DollarSign className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-3xl font-heading font-medium tracking-tight">₹{totalSales.toLocaleString('en-IN')}</h3>
                </div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-4">100% Dynamic volume</p>
              </div>

              <div className="bg-white p-6 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Orders Executed</p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded"><ShoppingBag className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-3xl font-heading font-medium tracking-tight">{orders.length}</h3>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-4">{pendingOrders} pending dispatch</p>
              </div>

              <div className="bg-white p-6 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Live Products</p>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded"><Package className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-3xl font-heading font-medium tracking-tight">{activeProducts}</h3>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-4">Out of {products.length} cataloged pieces</p>
              </div>

              <div className="bg-white p-6 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Promotional Banners</p>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded"><Image className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-3xl font-heading font-medium tracking-tight">{banners.length}</h3>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-4">{banners.filter(b => b.active).length} currently active on homepage</p>
              </div>
            </div>

            {/* Sub-Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sales Chart Mockup */}
              <div className="lg:col-span-8 bg-white p-6 border border-slate-100 shadow-sm rounded space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Sales Report Analysis</h3>
                  <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
                </div>

                <div className="space-y-4 pt-4">
                  {orders.length === 0 ? (
                    <div className="py-20 text-center text-xs text-neutral-400 uppercase tracking-widest">
                      <Activity className="w-8 h-8 text-neutral-200 mx-auto mb-3 animate-pulse" />
                      Awaiting order transactions to formulate graphs
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order, idx) => (
                      <div key={order.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-600">
                          <span>{order.customerName} - {order.id}</span>
                          <span>₹{order.total.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (order.total / 150000) * 100)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Status Summary */}
              <div className="lg:col-span-4 bg-white p-6 border border-slate-100 shadow-sm rounded space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Fulfillment States</h3>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Processing (New)</span>
                    <span className="text-sm font-bold text-amber-600">{orders.filter(o => o.status === 'Processing').length}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Shipped in Transit</span>
                    <span className="text-sm font-bold text-blue-600">{orders.filter(o => o.status === 'Shipped').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Delivered</span>
                    <span className="text-sm font-bold text-green-600">{orders.filter(o => o.status === 'Delivered').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: PRODUCTS CRUDS ==================== */}
        {activeTab === 'products' && (
          <div className="bg-white border border-slate-100 shadow-sm rounded flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Atelier Catalog ({products.length} total)</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search title, category or SKU..."
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:border-primary w-full sm:w-64 tracking-wider uppercase placeholder:text-neutral-300"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Piece details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">SKU / Code</th>
                    <th className="px-6 py-4">Price (Discount)</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Attributes</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products
                    .filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase()) || p.category.toLowerCase().includes(productQuery.toLowerCase()) || p.sku.toLowerCase().includes(productQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={p.image} className="w-12 h-16 object-cover rounded-sm border border-neutral-100 flex-shrink-0" alt="" />
                            <div>
                              <p className="text-sm font-bold text-slate-800 tracking-tight">{p.name}</p>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">{p.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 bg-slate-100 px-2.5 py-1 rounded-sm">{p.category}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">{p.sku}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-800">₹{p.price.toLocaleString()}</p>
                          {p.discountPrice ? (
                            <p className="text-[9px] font-bold text-cta uppercase tracking-widest mt-1">Disc: ₹{p.discountPrice.toLocaleString()}</p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-800">{p.stock} units</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {p.featured && <span className="text-[7px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-1 rounded-sm">Featured</span>}
                            {p.bestSeller && <span className="text-[7px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 px-1 rounded-sm">Best</span>}
                            {p.newArrival && <span className="text-[7px] font-bold uppercase tracking-widest bg-green-100 text-green-800 px-1 rounded-sm">New</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${p.status === 'Active' ? 'text-green-600' : 'text-neutral-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-green-600' : 'bg-neutral-400'}`} />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 text-slate-400 hover:text-primary transition-colors border border-slate-100 rounded hover:bg-slate-50"
                              title="Edit piece"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors border border-slate-100 rounded hover:bg-slate-50"
                              title="Delete piece"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-20 text-center text-xs text-neutral-400 uppercase tracking-[0.3em]">
                        Your Atelier catalog is empty. Click 'Add Couture Piece' to introduce catalog items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: HERO BANNERS ==================== */}
        {activeTab === 'banners' && (
          <div className="space-y-12 flex-1">
            <div className="bg-white p-6 border border-slate-100 rounded shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">Active Homepage Hero Banners</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {banners.map((b) => (
                  <div key={b.id} className="border border-slate-100 shadow-sm rounded overflow-hidden bg-white flex flex-col justify-between">
                    <div className="aspect-[16/9] w-full relative bg-neutral-900">
                      <img src={b.image} className="w-full h-full object-cover brightness-[0.7]" alt="" />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-cta mb-2">{b.subtitle}</span>
                        <h4 className="text-2xl font-heading uppercase tracking-tighter mb-4">{b.title}</h4>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] border border-white/30 px-3 py-1.5 max-w-max bg-white/10 backdrop-blur-sm">{b.ctaText}</span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between bg-slate-50 border-t border-slate-100">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ID: {b.id}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBannerStatus(b.id)}
                          className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border rounded transition-all ${b.active ? 'border-green-200 bg-green-50 text-green-700' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                        >
                          {b.active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => deleteBanner(b.id)}
                          className="p-1.5 text-neutral-400 border border-neutral-200 hover:text-red-500 hover:bg-red-50/50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && (
                  <div className="md:col-span-2 py-20 border border-dashed border-slate-200 rounded text-center text-xs text-neutral-400 uppercase tracking-widest">
                    No banners configured. Click 'Create Hero Banner' above to set up dynamic banners.
                  </div>
                )}
              </div>
            </div>

            {/* Category Middle Main Banner Configuration */}
            <div className="bg-white p-6 border border-slate-100 rounded shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Homepage Category Main Banner</h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">This banner renders exactly below the 'Shop by Category' section on the homepage.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  {middleBanner ? (
                    <div className="border border-slate-100 shadow-sm rounded overflow-hidden bg-white">
                      <div className="aspect-[21/9] w-full relative bg-neutral-900">
                        <img src={middleBanner.image} className="w-full h-full object-cover" alt="Middle Banner Preview" />
                      </div>
                      <div className="p-4 flex items-center justify-between bg-slate-50 border-t border-slate-100">
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Live Middle Banner (ID: {middleBanner.id})</span>
                        <button
                          onClick={() => setMiddleBanner(null)}
                          className="px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 text-[9px] font-bold uppercase tracking-widest rounded hover:bg-red-100 transition-colors"
                        >
                          Remove/Delete Banner
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 border border-dashed border-slate-200 rounded text-center text-xs text-neutral-400 uppercase tracking-widest bg-slate-50/50">
                      No Category Banner Configured
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="border border-neutral-100 p-6 bg-slate-50/50 rounded space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700">Upload Banner Image File</label>
                      <span className="block text-[8px] text-neutral-400 uppercase tracking-wider mt-0.5">JPEG, PNG, WEBP (Max 8MB)</span>
                    </div>

                    <label className="block w-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 hover:bg-neutral-800 transition-colors cursor-pointer text-center rounded">
                      {isUploadingMiddleBanner ? 'Uploading and Syncing...' : 'Select Category Banner File'}
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleMiddleBannerImageUpload}
                        disabled={isUploadingMiddleBanner}
                        className="hidden"
                      />
                    </label>

                    {isUploadingMiddleBanner && (
                      <p className="text-center text-[9px] font-bold text-cta uppercase tracking-widest animate-pulse">
                        Syncing banner with Supabase Storage...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">CTA Redirect URL Link</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-widest"
                      placeholder="e.g. /products?category=Western Dresses"
                      value={middleCtaLink}
                      onChange={(e) => handleUpdateMiddleBannerLink(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: ORDERS FULFILLMENTS ==================== */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-100 shadow-sm rounded flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Order Logs ({orders.length} total)</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search Order ID, Client Email or Name..."
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:border-primary w-full sm:w-64 tracking-wider uppercase placeholder:text-neutral-300"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer Info</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Items count</th>
                    <th className="px-6 py-4">Total Revenue</th>
                    <th className="px-6 py-4">Fulfillment Status</th>
                    <th className="px-6 py-4 text-right">Dispatch Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold">
                  {orders
                    .filter(o => o.id.toLowerCase().includes(orderQuery.toLowerCase()) || o.customerEmail.toLowerCase().includes(orderQuery.toLowerCase()) || o.customerName.toLowerCase().includes(orderQuery.toLowerCase()))
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 tracking-widest">{o.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-slate-800 font-bold uppercase tracking-wider">{o.customerName}</p>
                          <p className="text-[10px] text-neutral-400 font-medium tracking-normal mt-0.5">{o.customerEmail}</p>
                          {o.shippingDetails?.phone && (
                            <p className="text-[9px] text-slate-700 font-semibold tracking-wider uppercase mt-1">Phone: {o.shippingDetails.phone}</p>
                          )}
                          {o.shippingDetails?.address && (
                            <p className="text-[8px] text-neutral-400 font-medium tracking-normal mt-0.5 truncate max-w-xs" title={`${o.shippingDetails.address}, ${o.shippingDetails.city} - ${o.shippingDetails.zipCode}`}>
                              Dest: {o.shippingDetails.address}, {o.shippingDetails.city} - {o.shippingDetails.zipCode}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-neutral-400 font-bold uppercase tracking-widest">{o.date}</td>
                        <td className="px-6 py-4 text-slate-800">
                          <div className="space-y-1">
                            {o.items.map((item, idx) => (
                              <div key={idx}>
                                {item.product.name} ({item.selectedSize}/{item.selectedColor}) x {item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-bold">₹{o.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-sm text-[9px] uppercase tracking-widest font-bold ${o.status === 'Pending Approval' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                              o.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                o.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  o.status === 'Cancelled' ? 'bg-orange-100 text-orange-800' :
                                    o.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                                      o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                            }`}>
                            {o.status}
                          </span>
                          {o.trackingUrl && (
                            <a
                              href={o.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[8px] text-cta hover:underline font-bold uppercase tracking-widest mt-1"
                            >
                              Track Order ↗
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* Cancelled orders — locked, no further actions */}
                          {o.status === 'Cancelled' ? (
                            <div className="flex justify-end">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded text-[9px] font-bold uppercase tracking-widest">
                                🔒 Cancelled by Customer
                              </span>
                            </div>
                          ) : o.status === 'Rejected' ? (
                            <div className="flex justify-end">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded text-[9px] font-bold uppercase tracking-widest">
                                Rejected
                              </span>
                            </div>
                          ) : o.status === 'Pending Approval' ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => updateOrderStatus(o.id, 'Processing')}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to reject this order? The customer will see it as Rejected in their order history.")) {
                                    updateOrderStatus(o.id, 'Rejected');
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-red-600 text-white rounded text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 items-end">
                              <select
                                value={o.status}
                                onChange={(e) => {
                                  const nextStatus = e.target.value as any;
                                  if (nextStatus === 'Shipped') {
                                    const url = prompt("Enter the Dispatch Tracking URL Link for this order:", o.trackingUrl || "");
                                    updateOrderStatus(o.id, nextStatus, url || undefined);
                                  } else {
                                    updateOrderStatus(o.id, nextStatus);
                                  }
                                }}
                                className="bg-transparent border border-slate-200 text-[10px] uppercase font-bold tracking-wider rounded p-1.5 focus:outline-none"
                              >
                                <option value="Approved">Approved</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              {o.status === 'Shipped' && (
                                <button
                                  onClick={() => {
                                    const url = prompt("Update the Tracking URL Link for this order:", o.trackingUrl || "");
                                    updateOrderStatus(o.id, o.status, url || undefined);
                                  }}
                                  className="text-[8px] font-bold text-primary hover:underline border border-slate-200 rounded px-1.5 py-0.5 bg-white uppercase tracking-wider"
                                >
                                  Edit Tracking URL
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-xs text-neutral-400 uppercase tracking-widest">
                        Awaiting transactional order records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: CUSTOMER DIRECTORY ==================== */}
        {activeTab === 'customers' && (
          <div className="bg-white border border-slate-100 shadow-sm rounded flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Registered Customer Database</h3>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{Array.from(new Set(orders.map(o => o.customerEmail))).length} clients</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Registered Email</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4 text-right">Orders → View Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold">
                  {Array.from(new Set(orders.map(o => o.customerEmail))).map(email => {
                    const customerOrders = orders.filter(o => o.customerEmail === email);
                    const name = customerOrders[0]?.customerName || 'COUTURE CLIENT';
                    const totalSpent = customerOrders.reduce((acc, o) => acc + o.total, 0);
                    return (
                      <tr
                        key={email}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedCustomerEmail(email)}
                      >
                        <td className="px-6 py-4 text-slate-800 uppercase tracking-wider font-bold">{name}</td>
                        <td className="px-6 py-4 text-neutral-400 tracking-normal">{email}</td>
                        <td className="px-6 py-4 text-slate-800 font-bold">₹{totalSpent.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-2 text-[10px] font-bold text-primary group-hover:text-cta transition-colors uppercase tracking-widest">
                            {customerOrders.length} Orders
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-xs text-neutral-400 uppercase tracking-widest">
                        No client profiles cataloged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: CATEGORIES MANAGEMENT ==================== */}
        {activeTab === 'categories' && (
          <div className="space-y-8 flex-1">
            {/* Add New Category */}
            <div className="bg-white border border-slate-100 shadow-sm rounded p-6">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Create New Category</h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">New categories will appear in the product form and filter sidebar automatically.</p>
              </div>
              <div className="flex gap-4 max-w-lg">
                <input
                  type="text"
                  placeholder="e.g. Bridal Couture"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = newCategoryName.trim();
                      if (trimmed) {
                        addCategory(trimmed);
                        setNewCategoryName('');
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const trimmed = newCategoryName.trim();
                    if (trimmed) {
                      addCategory(trimmed);
                      setNewCategoryName('');
                    }
                  }}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
            </div>

            {/* Existing Categories List */}
            <div className="bg-white border border-slate-100 shadow-sm rounded">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">All Categories ({categories.length})</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {categories.map((cat) => {
                  const productCount = products.filter(p => p.category === cat).length;
                  return (
                    <div key={cat} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-cta" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">{cat}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{productCount} product{productCount !== 1 ? 's' : ''} assigned</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (productCount > 0) {
                            if (!confirm(`"${cat}" has ${productCount} product(s) assigned. Delete category anyway?`)) return;
                          }
                          deleteCategory(cat);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors border border-slate-100 rounded hover:bg-red-50"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <div className="py-20 text-center text-xs text-neutral-400 uppercase tracking-widest">
                    No categories configured. Add one above.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SOCIAL MEDIA LINKS ==================== */}
        {activeTab === 'social' && (
          <div className="space-y-8 flex-1">
            <div className="bg-white border border-slate-100 shadow-sm rounded p-6">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Social Media Links</h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">These links will appear as clickable icons in the website footer.</p>
              </div>
              <div className="space-y-6 max-w-2xl">
                {([
                  { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/yourpage', icon: '📸' },
                  { key: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: '📘' },
                  { key: 'twitter' as const, label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle', icon: '🐦' },
                  { key: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', icon: '▶️' },
                  { key: 'whatsapp' as const, label: 'WhatsApp', placeholder: 'https://wa.me/91XXXXXXXXXX', icon: '💬' },
                  { key: 'pinterest' as const, label: 'Pinterest', placeholder: 'https://pinterest.com/yourprofile', icon: '📌' },
                ] as const).map(({ key, label, placeholder, icon }) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">{label}</label>
                      <div className="flex gap-3">
                        <input
                          type="url"
                          placeholder={placeholder}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary tracking-wide"
                          value={socialLinks[key]}
                          onChange={(e) => setSocialLink(key, e.target.value)}
                        />
                        {socialLinks[key] && (
                          <a
                            href={socialLinks[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-primary hover:border-primary transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Test
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">✅ Changes save instantly and appear in the footer on all pages.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================== PRODUCT FORM MODAL OVERLAY ==================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start py-10 px-4">
          <div className="bg-white w-full max-w-4xl p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setIsProductModalOpen(false);
                resetProductForm();
              }}
              className="absolute top-6 right-6 font-bold text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              ✕ Close
            </button>

            <h3 className="text-2xl font-heading uppercase tracking-tighter mb-8 border-b pb-4">
              {editingProduct ? 'Update Couture Piece' : 'Add Couture Piece to Collection'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Product Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="e.g. Midnight Silk Banarasi"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Subcategory (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="e.g. Banarasi, Silk"
                    value={pSubcategory}
                    onChange={(e) => setPSubcategory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">SKU / Product Code</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="e.g. VLH-SR101"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Brand Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="18500"
                    value={pPrice || ''}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Discount Price (₹, Optional)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="15000"
                    value={pDiscountPrice || ''}
                    onChange={(e) => setPDiscountPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value as any)}
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Device Multi-Visual Selection & Reordering */}
              <div className="border border-neutral-100 p-6 bg-slate-50/50 rounded space-y-6 md:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700">Couture Visual Gallery (Select Multiple)</label>
                    <span className="block text-[8px] text-neutral-400 uppercase tracking-wider mt-0.5">JPEG, PNG, WEBP (Max 5MB each)</span>
                  </div>
                  <label className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-neutral-800 transition-colors cursor-pointer text-center rounded">
                    Browse Device Images
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {isUploadingImages && (
                  <div className="text-center py-4 text-xs font-semibold text-cta uppercase tracking-widest animate-pulse">
                    Synchronizing visuals with Supabase Storage...
                  </div>
                )}

                {uploadedProductImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {uploadedProductImages.map((url, index) => {
                      const pos = imagePositions[index] ?? 'center';

                      // Parse vertical % for preview display
                      const parseVertical = (p: string): number => {
                        if (p === 'top') return 0;
                        if (p === 'center') return 50;
                        if (p === 'bottom') return 100;
                        const parts = p.split(' ');
                        const v = parts.length >= 2 ? parts[1] : parts[0];
                        return parseInt(v) || 50;
                      };
                      const vertPct = parseVertical(pos);

                      return (
                        <div key={url + index} className="group relative border border-neutral-200/60 overflow-hidden bg-white rounded shadow-sm flex flex-col">
                          {/* Image thumbnail */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
                            <img
                              src={url}
                              className="w-full h-full object-cover transition-all duration-300"
                              style={{ objectPosition: `center ${vertPct}%` }}
                              alt=""
                            />

                            {/* Primary badge */}
                            {index === 0 && (
                              <span className="absolute top-2 left-2 bg-primary text-white text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm shadow">
                                Primary
                              </span>
                            )}

                            {/* Actions overlay top-right */}
                            <div className="absolute top-2 right-2 flex gap-1 z-10">
                              {/* ✂ Crop button */}
                              <button
                                type="button"
                                onClick={() => setCropModal({ index, url })}
                                className="text-[7px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow transition-all bg-white/90 text-slate-700 hover:bg-amber-500 hover:text-white border border-neutral-200"
                                title="Free crop"
                              >
                                ✂ Crop
                              </button>
                              {/* 👁 Position button */}
                              <button
                                type="button"
                                onClick={() => setPreviewAdjustIndex(index)}
                                className="text-[7px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow transition-all bg-white/90 text-slate-700 hover:bg-amber-500 hover:text-white border border-neutral-200"
                                title="Position / focal point"
                              >
                                👁 Position
                              </button>
                            </div>

                            {/* Hover action row */}
                            <div className="absolute inset-x-0 bottom-0 bg-neutral-900/80 backdrop-blur-sm p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveImage(index, 'left')}
                                  className="text-[9px] font-bold text-white bg-white/10 hover:bg-white/20 w-5 h-5 flex items-center justify-center rounded disabled:opacity-30"
                                  title="Move Left"
                                >
                                  ←
                                </button>
                                <button
                                  type="button"
                                  disabled={index === uploadedProductImages.length - 1}
                                  onClick={() => handleMoveImage(index, 'right')}
                                  className="text-[9px] font-bold text-white bg-white/10 hover:bg-white/20 w-5 h-5 flex items-center justify-center rounded disabled:opacity-30"
                                  title="Move Right"
                                >
                                  →
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="text-[9px] font-bold text-red-400 hover:text-red-500 bg-white/10 hover:bg-white/20 w-5 h-5 flex items-center justify-center rounded"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-400 text-[10px] font-semibold uppercase tracking-widest border border-dashed border-neutral-200 rounded bg-white">
                    No visual files allocated to this couture creation yet.
                  </div>
                )}
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:col-span-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Colors Options (Comma-separated)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="Navy Blue, Deep Crimson, Emerald Green"
                    value={pColors}
                    onChange={(e) => setPColors(e.target.value)}
                  />
                </div>
              </div>

              {/* Size Select Options */}
              <div className="border p-4 bg-slate-50 rounded">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Atelier Size Allocations</span>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pAllSizesAvailable}
                      onChange={(e) => setPAllSizesAvailable(e.target.checked)}
                      className="rounded text-primary border-slate-200"
                    />
                    "All Sizes Available" Allocation
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 border font-bold text-xs uppercase rounded transition-all ${pSizes.includes(size) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 hover:border-slate-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 max-w-xs">
                  <input
                    type="text"
                    placeholder="Enter custom size (e.g. 38, Custom)"
                    className="bg-white border border-slate-200 rounded p-2 text-xs font-semibold focus:outline-none w-full"
                    value={pCustomSize}
                    onChange={(e) => setPCustomSize(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="bg-primary text-white px-3 font-bold text-xs rounded hover:bg-neutral-800"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Allocated: {pSizes.length > 0 ? pSizes.join(', ') : 'None'}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <label className="flex items-center gap-3 border p-3 rounded bg-white hover:bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="rounded text-primary border-slate-200 focus:ring-0"
                  />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-800">Featured Placement</span>
                    <span className="block text-[8px] text-neutral-400 uppercase tracking-widest mt-0.5">Showcase on Home Featured</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 border p-3 rounded bg-white hover:bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pBestSeller}
                    onChange={(e) => setPBestSeller(e.target.checked)}
                    className="rounded text-primary border-slate-200 focus:ring-0"
                  />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-800">Best Seller status</span>
                    <span className="block text-[8px] text-neutral-400 uppercase tracking-widest mt-0.5">Hot List highlight placement</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 border p-3 rounded bg-white hover:bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pNewArrival}
                    onChange={(e) => setPNewArrival(e.target.checked)}
                    className="rounded text-primary border-slate-200 focus:ring-0"
                  />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-800">New Arrival placement</span>
                    <span className="block text-[8px] text-neutral-400 uppercase tracking-widest mt-0.5">New Season collections badge</span>
                  </div>
                </label>
              </div>

              {/* Description & Narrative */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Couture Narrative (Description)</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  placeholder="Describe the silhouette, cut, artistic craftsmanship..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                />
              </div>

              {/* Specs & Care */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Fabric / Material Composition Details</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="e.g. 100% Pure Mulberry Silk, Georgette crepe"
                    value={pMaterial}
                    onChange={(e) => setPMaterial(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Couture Care Instructions</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="e.g. Dry clean only, store in cloth hanger"
                    value={pCare}
                    onChange={(e) => setPCare(e.target.value)}
                  />
                </div>
              </div>

              {/* Promos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Product Tags (Comma-separated)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="Silk, Wedding, Banarasi, Exclusive"
                    value={pTags}
                    onChange={(e) => setPTags(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Artisanal Features (Comma-separated)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="Handwoven borders, Antique Gold Zari embroidery"
                    value={pFeatures}
                    onChange={(e) => setPFeatures(e.target.value)}
                  />
                </div>
              </div>

              {/* Shipping & Return Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Shipping Information</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    value={pShipping}
                    onChange={(e) => setPShipping(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Return & Exchange Policy</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    value={pReturn}
                    onChange={(e) => setPReturn(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="px-6 py-3 border rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  {editingProduct ? 'Commit Updates' : 'Add piece to Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}







      {/* ==================== IMAGE PREVIEW & FOCAL POINT ADJUSTER MODAL ==================== */}
      {previewAdjustIndex !== null && (() => {
        const idx = previewAdjustIndex;
        const url = uploadedProductImages[idx] || '';
        const pos = imagePositions[idx] ?? 'center';

        const parseVertical = (p: string): number => {
          if (p === 'top') return 0;
          if (p === 'center') return 50;
          if (p === 'bottom') return 100;
          const parts = p.split(' ');
          const v = parts.length >= 2 ? parts[1] : parts[0];
          return parseInt(v) || 50;
        };

        const vertPct = parseVertical(pos);

        const setVertPct = (pct: number) => {
          const newPositions = [...imagePositions];
          while (newPositions.length <= idx) {
            newPositions.push('center');
          }
          newPositions[idx] = `center ${pct}%`;
          setImagePositions(newPositions);
        };

        const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const pct = Math.round((clickY / rect.height) * 100);
          setVertPct(Math.max(0, Math.min(100, pct)));
        };

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex-shrink-0">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-0.5">Image Preview & Focal Point Adjuster</p>
                  <h3 className="text-lg font-heading uppercase tracking-tighter">
                    Image {idx + 1} of {uploadedProductImages.length}{idx === 0 ? ' — Primary' : ''}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewAdjustIndex(null)}
                  className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  ✕ Close
                </button>
              </div>

              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* LEFT — Large clickable preview (Detail Page view 2:3) */}
                <div className="flex-1 bg-neutral-950 flex flex-col items-center justify-center p-6 gap-3 overflow-auto">
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-1">Detail Page View — Click to set focal point</p>

                  <div
                    className="relative overflow-hidden rounded bg-neutral-900 cursor-crosshair shadow-lg"
                    style={{ width: '100%', maxWidth: '340px', aspectRatio: '2/3' }}
                    onClick={handleImageClick}
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover select-none"
                      style={{ objectPosition: `center ${vertPct}%` }}
                      alt=""
                      draggable={false}
                    />

                    {/* Focal point crosshair indicator */}
                    <div
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{ top: `${vertPct}%`, transform: 'translateY(-50%)' }}
                    >
                      {/* Horizontal line */}
                      <div className="w-full border-t-2 border-dashed border-amber-400/70" />
                      {/* Center dot */}
                      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-400/30 shadow-lg" />
                    </div>

                    {/* Instruction overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-center">
                      <span className="text-[7px] font-bold uppercase tracking-widest text-white/60 bg-black/40 px-2 py-1 rounded">
                        Click anywhere to set focal point
                      </span>
                    </div>
                  </div>

                  <p className="text-[7px] text-neutral-600 uppercase tracking-widest">Focal point: {vertPct}% from top</p>
                </div>

                {/* RIGHT — Controls + Card preview */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-100 overflow-auto">

                  {/* Card Preview (4:5) */}
                  <div className="p-5 border-b border-slate-100">
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-3">Product Card Preview (4:5)</p>
                    <div
                      className="relative overflow-hidden rounded bg-neutral-100 mx-auto"
                      style={{ width: '140px', aspectRatio: '4/5' }}
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `center ${vertPct}%` }}
                        alt=""
                      />
                    </div>
                  </div>

                  {/* Slider Controls */}
                  <div className="p-5 space-y-5 flex-1">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">Vertical Focal Point</label>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{vertPct}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={vertPct}
                        onChange={(e) => setVertPct(Number(e.target.value))}
                        className="w-full h-2 rounded-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[7px] text-neutral-300 font-bold uppercase tracking-widest mt-1">
                        <span>Top (0%)</span>
                        <span>Bottom (100%)</span>
                      </div>
                    </div>

                    {/* Preset buttons */}
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Quick Presets</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {([['Top', 0], ['Upper', 25], ['Center', 50], ['Lower', 75], ['Bottom', 100]] as [string, number][]).map(([label, val]) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setVertPct(val)}
                            className={`text-[7px] font-bold uppercase tracking-wide py-2 rounded transition-all ${
                              vertPct === val
                                ? 'bg-amber-500 text-white shadow'
                                : 'bg-slate-100 text-neutral-500 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nav between images */}
                    {uploadedProductImages.length > 1 && (
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Navigate Images</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => setPreviewAdjustIndex(idx - 1)}
                            className="flex-1 py-2 text-[8px] font-bold uppercase tracking-widest border rounded hover:bg-slate-50 disabled:opacity-30 transition-all"
                          >
                            ← Prev
                          </button>
                          <button
                            type="button"
                            disabled={idx === uploadedProductImages.length - 1}
                            onClick={() => setPreviewAdjustIndex(idx + 1)}
                            className="flex-1 py-2 text-[8px] font-bold uppercase tracking-widest border rounded hover:bg-slate-50 disabled:opacity-30 transition-all"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Done button */}
                  <div className="p-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPreviewAdjustIndex(null)}
                      className="w-full py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-neutral-800 transition-colors"
                    >
                      ✓ Save & Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ==================== FREE CROP TOOL MODAL ==================== */}
      {cropModal && (() => {
        const ASPECTS: [string, number | null][] = [['Free', null], ['3:4', 3/4], ['4:5', 4/5], ['1:1', 1], ['16:9', 16/9]];
        const hasCrop = cropBox !== null && cropBox.w > 4 && cropBox.h > 4;
        return (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3">
            <div
              className="bg-slate-900 w-full max-w-5xl rounded-xl shadow-2xl flex flex-col border border-slate-700"
              style={{ maxHeight: '94vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700 flex-shrink-0 gap-4 flex-wrap">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-amber-400 mb-0.5">Free Crop Tool</p>
                  <p className="text-white text-xs font-bold uppercase tracking-tight">Drag to select · Drag corners to resize · Drag inside to move</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Aspect ratio lock */}
                  {ASPECTS.map(([lbl, ratio]) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => { setCropAspect(ratio); setCropBox(null); }}
                      className={`text-[7px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded border transition-all ${
                        cropAspect === ratio
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-slate-600 text-slate-400 hover:border-amber-400 hover:text-amber-400'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setCropModal(null); setCropBox(null); setCropDragState(null); setCropAspect(null); }}
                    className="ml-2 text-slate-400 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>

              {/* Canvas crop area */}
              <div className="flex-1 overflow-hidden flex items-center justify-center bg-neutral-950 p-4 min-h-0">
                <div
                  ref={cropContainerRef}
                  className="relative inline-block select-none cursor-crosshair"
                  style={{ maxHeight: 'calc(94vh - 152px)', maxWidth: '100%' }}
                  onMouseDown={handleCropMouseDown}
                  onMouseMove={handleCropMouseMove}
                  onMouseUp={handleCropMouseUp}
                  onMouseLeave={handleCropMouseUp}
                >
                  <img
                    ref={cropImgRef}
                    src={cropModal.url}
                    alt=""
                    draggable={false}
                    className="pointer-events-none block max-w-full"
                    style={{ maxHeight: 'calc(94vh - 152px)', userSelect: 'none', display: 'block' }}
                  />

                  {/* SVG overlay - dark mask + crop rect + handles */}
                  {hasCrop && cropBox && (
                    <svg
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
                    >
                      {/* Dark overlay everywhere except crop rect (even-odd rule) */}
                      <path
                        fillRule="evenodd"
                        fill="rgba(0,0,0,0.62)"
                        d={`M-1 -1 H99999 V99999 H-1 Z M${cropBox.x} ${cropBox.y} H${cropBox.x + cropBox.w} V${cropBox.y + cropBox.h} H${cropBox.x} Z`}
                      />

                      {/* Crop border */}
                      <rect
                        x={cropBox.x} y={cropBox.y}
                        width={cropBox.w} height={cropBox.h}
                        fill="none" stroke="#F59E0B" strokeWidth="1.5"
                      />

                      {/* Rule-of-thirds grid */}
                      {[1/3, 2/3].map((t) => (
                        <g key={t}>
                          <line x1={cropBox.x + cropBox.w * t} y1={cropBox.y} x2={cropBox.x + cropBox.w * t} y2={cropBox.y + cropBox.h} stroke="rgba(245,158,11,0.28)" strokeWidth="0.75"/>
                          <line x1={cropBox.x} y1={cropBox.y + cropBox.h * t} x2={cropBox.x + cropBox.w} y2={cropBox.y + cropBox.h * t} stroke="rgba(245,158,11,0.28)" strokeWidth="0.75"/>
                        </g>
                      ))}

                      {/* Corner L-bracket handles */}
                      {([
                        [cropBox.x, cropBox.y, 1, 1],
                        [cropBox.x + cropBox.w, cropBox.y, -1, 1],
                        [cropBox.x, cropBox.y + cropBox.h, 1, -1],
                        [cropBox.x + cropBox.w, cropBox.y + cropBox.h, -1, -1],
                      ] as [number, number, number, number][]).map(([cx, cy, sx, sy], i) => {
                        const L = 14;
                        return (
                          <g key={i}>
                            <line x1={cx} y1={cy} x2={cx + sx * L} y2={cy} stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
                            <line x1={cx} y1={cy} x2={cx} y2={cy + sy * L} stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-700 flex-shrink-0 gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setCropBox(null); setCropDragState(null); }}
                    className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 rounded transition-all"
                  >
                    Reset
                  </button>
                  {hasCrop && cropBox && (
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                      {Math.round(cropBox.w)} × {Math.round(cropBox.h)} px
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={!hasCrop || isApplyingCrop}
                  className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isApplyingCrop ? '⏳ Uploading cropped image...' : '✓ Apply Crop'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start py-20 px-4">
          <div className="bg-white w-full max-w-lg p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-6 right-6 font-bold text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              ✕ Close
            </button>

            <h3 className="text-xl font-heading uppercase tracking-tighter mb-6 border-b pb-3">Create Dynamic Hero Banner</h3>

            <form onSubmit={handleBannerSubmit} className="space-y-6">
              {/* Dynamic Device Banner Selection & Previews */}
              <div className="border border-neutral-100 p-6 bg-slate-50/50 rounded space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-700">Hero Banner File</label>
                    <span className="block text-[8px] text-neutral-400 uppercase tracking-wider mt-0.5">JPEG, PNG, WEBP (Max 8MB)</span>
                  </div>
                  <label className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-neutral-800 transition-colors cursor-pointer text-center rounded">
                    Select Device File
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {isUploadingBanner && (
                  <div className="text-center py-2 text-xs font-semibold text-cta uppercase tracking-widest animate-pulse">
                    Synchronizing banner with Supabase Storage...
                  </div>
                )}

                {bImage && (
                  <div className="relative aspect-[16/9] w-full border border-neutral-200/60 overflow-hidden bg-white rounded shadow-sm">
                    <img src={bImage} className="w-full h-full object-cover" alt="Banner Preview" />
                    <button
                      type="button"
                      onClick={() => setBImage('')}
                      className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-bold uppercase px-3 py-1.5 shadow hover:bg-red-700 transition-colors rounded"
                    >
                      Delete Banner
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Banner Title</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  placeholder="e.g. Discover Volahi Couture"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Banner Subtitle (Promotional Tag)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  placeholder="e.g. NEW SEASON ARRIVAL"
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="Discover Collection"
                    value={bCtaText}
                    onChange={(e) => setBCtaText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">CTA Redirect URL Link</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    placeholder="/products"
                    value={bCtaLink}
                    onChange={(e) => setBCtaLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-5 py-2.5 border rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CUSTOMER DETAIL MODAL ==================== */}
      {selectedCustomerEmail && (() => {
        const customerOrders = orders.filter(o => o.customerEmail === selectedCustomerEmail);
        const customer = customerOrders[0];
        const totalSpent = customerOrders.reduce((acc, o) => acc + o.total, 0);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start py-10 px-4">
            <div className="bg-white w-full max-w-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-8 border-b border-slate-100 bg-slate-900 text-white">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-1">Client Profile</p>
                  <h3 className="text-2xl font-heading uppercase tracking-tighter">{customer?.customerName || 'Client'}</h3>
                  <p className="text-neutral-400 text-xs mt-1 tracking-wider">{selectedCustomerEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomerEmail(null)}
                  className="text-neutral-400 hover:text-white transition-colors mt-1"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-slate-100">
                <div className="p-5 border-r border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Total Orders</p>
                  <p className="text-2xl font-heading font-bold text-slate-800">{customerOrders.length}</p>
                </div>
                <div className="p-5 border-r border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Total Spent</p>
                  <p className="text-2xl font-heading font-bold text-slate-800">₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-5 border-r border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Phone</p>
                  <p className="text-sm font-bold text-slate-800">{customer?.shippingDetails?.phone || '—'}</p>
                </div>
                <div className="p-5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">City</p>
                  <p className="text-sm font-bold text-slate-800">{customer?.shippingDetails?.city || '—'}</p>
                </div>
              </div>

              {/* Address */}
              {customer?.shippingDetails?.address && (
                <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Delivery Address</p>
                  <p className="text-xs font-semibold text-slate-700">{customer.shippingDetails.address}, {customer.shippingDetails.city} — {customer.shippingDetails.zipCode}</p>
                </div>
              )}

              {/* Order History */}
              <div className="p-8">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">Order History</h4>
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="border border-slate-100 rounded overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{order.id}</span>
                          <span className="text-[9px] text-neutral-400 font-semibold">{order.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'Processing' || order.status === 'Approved' ? 'bg-amber-100 text-amber-700' :
                                  order.status === 'Cancelled' || order.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-600'
                            }`}>{order.status}</span>
                          <span className="text-xs font-bold text-slate-800">₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="px-4 py-3 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-neutral-600">
                            <span className="font-semibold">{item.product.name}</span>
                            <span className="text-neutral-400">{item.selectedSize} / {item.selectedColor} × {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-8 py-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedCustomerEmail(null)}
                  className="px-6 py-2.5 border border-slate-200 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
