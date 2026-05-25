import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getDbProducts, 
  addDbProduct, 
  editDbProduct, 
  deleteDbProduct, 
  getDbBanners, 
  addDbBanner, 
  deleteDbBanner, 
  toggleDbBanner, 
  setDbMiddleBanner 
} from './supabase';

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

  // Asynchronous Global DB Sync Action
  fetchStoreData: () => Promise<void>;

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

      // Asynchronous Global DB Synchronization
      fetchStoreData: async () => {
        try {
          const dbProducts = await getDbProducts();
          const { banners: dbBanners, middleBanner: dbMiddleBanner } = await getDbBanners();

          set((state) => ({
            products: dbProducts.length > 0 ? dbProducts : state.products,
            banners: dbBanners.length > 0 ? dbBanners : state.banners,
            middleBanner: dbMiddleBanner || state.middleBanner,
          }));
        } catch (err) {
          console.warn('[Zustand Store] Failed to sync with Supabase global database:', err);
        }
      },

      // Product Reducers
      addProduct: (newProduct) => {
        const item = { ...newProduct, reviews: [] };
        set((state) => ({
          products: [...state.products, item],
        }));
        addDbProduct(newProduct).catch((err) => 
          console.error('[Supabase DB Sync] addProduct failed:', err)
        );
      },

      editProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
        }));
        editDbProduct(updatedProduct).catch((err) => 
          console.error('[Supabase DB Sync] editProduct failed:', err)
        );
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        deleteDbProduct(id).catch((err) => 
          console.error('[Supabase DB Sync] deleteProduct failed:', err)
        );
      },

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
      addBanner: (banner) => {
        set((state) => ({
          banners: [...state.banners, banner],
        }));
        addDbBanner(banner).catch((err) => 
          console.error('[Supabase DB Sync] addBanner failed:', err)
        );
      },

      deleteBanner: (id) => {
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id),
        }));
        deleteDbBanner(id).catch((err) => 
          console.error('[Supabase DB Sync] deleteBanner failed:', err)
        );
      },

      toggleBannerStatus: (id) => {
        let nextActive = false;
        set((state) => {
          const nextBanners = state.banners.map((b) => {
            if (b.id === id) {
              nextActive = !b.active;
              return { ...b, active: nextActive };
            }
            return b;
          });
          return { banners: nextBanners };
        });
        toggleDbBanner(id, nextActive).catch((err) => 
          console.error('[Supabase DB Sync] toggleBannerStatus failed:', err)
        );
      },

      setMiddleBanner: (banner) => {
        set({
          middleBanner: banner,
        });
        setDbMiddleBanner(banner).catch((err) => 
          console.error('[Supabase DB Sync] setMiddleBanner failed:', err)
        );
      },

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
