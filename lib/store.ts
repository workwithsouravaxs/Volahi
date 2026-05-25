import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  images: string[];
  image: string; // primary image
  stock: number;
  sku: string;
  brand: string;
  material: string;
  colors: string[];
  sizes: string[]; // standard and custom size options
  allSizesAvailable: boolean;
  tags: string[];
  features: string[];
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
  status: 'Active' | 'Inactive';
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  reviews?: {
    reviewerName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface User {
  email: string;
  name: string;
  wishlist: string[]; // product IDs
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  shippingDetails: {
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  date: string;
}

interface VolahiStore {
  // States
  products: Product[];
  banners: Banner[];
  middleBanner: Banner | null;
  cart: CartItem[];
  wishlist: string[]; // array of product IDs
  orders: Order[];
  currentUser: User | null;
  isAdminAuthenticated: boolean;

  // Product Actions
  addProduct: (product: Omit<Product, 'reviews'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: { reviewerName: string; rating: number; comment: string }) => void;

  // Banner Actions
  addBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;
  setMiddleBanner: (banner: Banner | null) => void;

  // Cart Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist Actions
  toggleWishlist: (productId: string) => void;

  // Order Actions
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'date'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Auth Actions
  loginUser: (user: User) => void;
  logoutUser: () => void;
  loginAdmin: () => boolean;
  logoutAdmin: () => void;
}

export const useVolahiStore = create<VolahiStore>()(
  persist(
    (set, get) => ({
      // Initial States - Starts empty as required!
      products: [],
      banners: [],
      middleBanner: null,
      cart: [],
      wishlist: [],
      orders: [],
      currentUser: null,
      isAdminAuthenticated: false,

      // Product Reducers
      addProduct: (newProduct) =>
        set((state) => ({
          products: [...state.products, { ...newProduct, reviews: [] }],
        })),

      editProduct: (updatedProduct) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addReview: (productId, review) =>
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              const currentReviews = p.reviews || [];
              const newReview = {
                ...review,
                date: new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              };
              return { ...p, reviews: [...currentReviews, newReview] };
            }
            return p;
          }),
        })),

      // Banner Reducers
      addBanner: (banner) =>
        set((state) => ({
          banners: [...state.banners, banner],
        })),

      deleteBanner: (id) =>
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id),
        })),

      toggleBannerStatus: (id) =>
        set((state) => ({
          banners: state.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
        })),

      setMiddleBanner: (banner) =>
        set({
          middleBanner: banner,
        }),

      // Cart Reducers
      addToCart: (newItem) =>
        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (item) =>
              item.product.id === newItem.product.id &&
              item.selectedSize === newItem.selectedSize &&
              item.selectedColor === newItem.selectedColor
          );

          if (existingItemIndex > -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex].quantity += newItem.quantity;
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, newItem] };
        }),

      removeFromCart: (productId, size, color) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          ),
        })),

      updateCartQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedColor === color
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
            ),
        })),

      clearCart: () => set({ cart: [] }),

      // Wishlist Reducers
      toggleWishlist: (productId) =>
        set((state) => {
          const isWishlisted = state.wishlist.includes(productId);
          const updatedWishlist = isWishlisted
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId];
          return { wishlist: updatedWishlist };
        }),

      // Order Reducers
      placeOrder: (orderData) => {
        const orderId = 'VLH' + Math.floor(100000 + Math.random() * 900000);
        const newOrder: Order = {
          ...orderData,
          id: orderId,
          status: 'Processing',
          date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return orderId;
      },

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),

      // Auth Reducers
      loginUser: (user) => set({ currentUser: user }),
      logoutUser: () => set({ currentUser: null }),
      loginAdmin: () => {
        set({ isAdminAuthenticated: true });
        return true;
      },
      logoutAdmin: () => set({ isAdminAuthenticated: false }),
    }),
    {
      name: 'volahi-couture-storage', // key in localStorage
    }
  )
);
