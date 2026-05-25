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
  setDbMiddleBanner,
  fetchDbOrders,
  addDbOrder,
  updateDbOrderStatus,
  deleteDbOrder,
  signupUser,
  loginUserWithCredentials,
  updateUserCartInDb,
  updateUserWishlistInDb,
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
  phone?: string;
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
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingUrl?: string;
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
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'date' | 'trackingUrl'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingUrl?: string) => void;
  deleteOrder: (id: string) => void;

  // Auth Actions
  loginUser: (user: User) => void;
  logoutUser: () => void;
  loginAdmin: () => boolean;
  logoutAdmin: () => void;

  // Database-Backed Auth Actions
  loginWithDb: (email: string, password: string) => Promise<'success' | 'not_found' | 'wrong_password' | 'error'>;
  signupWithDb: (email: string, password: string, name: string, phone?: string) => Promise<'success' | 'already_exists' | 'error'>;
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
          const dbOrders = await fetchDbOrders();

          set((state) => ({
            products: dbProducts.length > 0 ? dbProducts : state.products,
            banners: dbBanners.length > 0 ? dbBanners : state.banners,
            middleBanner: dbMiddleBanner || state.middleBanner,
            orders: dbOrders.length > 0 ? dbOrders : state.orders,
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

      // Cart Reducers — auto-sync to DB when user is logged in
      addToCart: (newItem) => {
        const { currentUser } = get();
        let updatedCart: CartItem[] = [];

        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (item) =>
              item.product.id === newItem.product.id &&
              item.selectedSize === newItem.selectedSize &&
              item.selectedColor === newItem.selectedColor
          );

          if (existingItemIndex > -1) {
            const newCart = [...state.cart];
            newCart[existingItemIndex] = {
              ...newCart[existingItemIndex],
              quantity: newCart[existingItemIndex].quantity + newItem.quantity,
            };
            updatedCart = newCart;
            return { cart: newCart };
          }

          updatedCart = [...state.cart, newItem];
          return { cart: updatedCart };
        });

        if (currentUser?.email) {
          updateUserCartInDb(currentUser.email, updatedCart).catch((err) =>
            console.error('[Auth Sync] addToCart DB sync failed:', err)
          );
        }
      },

      removeFromCart: (productId, size, color) => {
        const { currentUser } = get();
        let updatedCart: CartItem[] = [];

        set((state) => {
          updatedCart = state.cart.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          );
          return { cart: updatedCart };
        });

        if (currentUser?.email) {
          updateUserCartInDb(currentUser.email, updatedCart).catch((err) =>
            console.error('[Auth Sync] removeFromCart DB sync failed:', err)
          );
        }
      },

      updateCartQuantity: (productId, size, color, quantity) => {
        const { currentUser } = get();
        let updatedCart: CartItem[] = [];

        set((state) => {
          updatedCart = state.cart.map((item) =>
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          );
          return { cart: updatedCart };
        });

        if (currentUser?.email) {
          updateUserCartInDb(currentUser.email, updatedCart).catch((err) =>
            console.error('[Auth Sync] updateCartQuantity DB sync failed:', err)
          );
        }
      },

      clearCart: () => {
        const { currentUser } = get();
        set({ cart: [] });

        if (currentUser?.email) {
          updateUserCartInDb(currentUser.email, []).catch((err) =>
            console.error('[Auth Sync] clearCart DB sync failed:', err)
          );
        }
      },

      // Wishlist Reducers — auto-sync to DB when user is logged in
      toggleWishlist: (productId) => {
        const { currentUser } = get();
        let updatedWishlist: string[] = [];

        set((state) => {
          const isWishlisted = state.wishlist.includes(productId);
          updatedWishlist = isWishlisted
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId];
          return { wishlist: updatedWishlist };
        });

        if (currentUser?.email) {
          updateUserWishlistInDb(currentUser.email, updatedWishlist).catch((err) =>
            console.error('[Auth Sync] toggleWishlist DB sync failed:', err)
          );
        }
      },

      // Order Reducers
      placeOrder: (orderData) => {
        const orderId = 'VLH' + Math.floor(100000 + Math.random() * 900000);
        const newOrder: Order = {
          ...orderData,
          id: orderId,
          status: 'Pending Approval',
          date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        addDbOrder(newOrder).catch((err) => 
          console.error('[Supabase DB Sync] addDbOrder failed:', err)
        );

        return orderId;
      },

      updateOrderStatus: (orderId, status, trackingUrl) => {
        set((state) => ({
          orders: state.orders.map((o) => 
            o.id === orderId 
              ? { ...o, status, trackingUrl: trackingUrl || o.trackingUrl } 
              : o
          ),
        }));

        updateDbOrderStatus(orderId, status, trackingUrl).catch((err) =>
          console.error('[Supabase DB Sync] updateDbOrderStatus failed:', err)
        );
      },

      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));

        deleteDbOrder(id).catch((err) =>
          console.error('[Supabase DB Sync] deleteOrder failed:', err)
        );
      },

      // Auth Reducers
      loginUser: (user) => set({ currentUser: user }),
      
      logoutUser: () => set({ 
        currentUser: null,
        cart: [],       // Clear cart on logout — will be restored from DB on next login
        wishlist: [],   // Clear wishlist on logout — will be restored from DB on next login
      }),

      loginAdmin: () => {
        set({ isAdminAuthenticated: true });
        return true;
      },
      logoutAdmin: () => set({ isAdminAuthenticated: false }),

      // ===== DATABASE-BACKED AUTH ACTIONS =====

      loginWithDb: async (email, password) => {
        const result = await loginUserWithCredentials(email, password);

        if (result === 'not_found' || result === 'wrong_password' || result === 'error') {
          return result;
        }

        // result is UserProfile — restore full session state
        const dbProfile = result;
        const { cart: localCart, wishlist: localWishlist } = get();

        // Union-merge: combine DB data with any local guest items, no duplicates
        const mergedWishlist = Array.from(new Set([...dbProfile.wishlist, ...localWishlist]));

        // Merge carts: combine DB cart with local cart, aggregating quantities for same items
        const mergedCart: CartItem[] = [...dbProfile.cart];
        for (const localItem of localCart) {
          const existingIdx = mergedCart.findIndex(
            (item) =>
              item.product.id === localItem.product.id &&
              item.selectedSize === localItem.selectedSize &&
              item.selectedColor === localItem.selectedColor
          );
          if (existingIdx > -1) {
            mergedCart[existingIdx] = {
              ...mergedCart[existingIdx],
              quantity: mergedCart[existingIdx].quantity + localItem.quantity,
            };
          } else {
            mergedCart.push(localItem);
          }
        }

        // Set user state and restore merged data
        set({
          currentUser: {
            email: dbProfile.email,
            name: dbProfile.fullName,
            phone: dbProfile.phone,
            wishlist: mergedWishlist,
          },
          cart: mergedCart,
          wishlist: mergedWishlist,
        });

        // Persist merged data back to DB if there were local guest items
        if (localCart.length > 0 || localWishlist.length > 0) {
          updateUserCartInDb(dbProfile.email, mergedCart).catch(() => null);
          updateUserWishlistInDb(dbProfile.email, mergedWishlist).catch(() => null);
        }

        return 'success';
      },

      signupWithDb: async (email, password, name, phone) => {
        const result = await signupUser(email, password, name, phone);

        if (result === 'already_exists' || result === 'error') {
          return result;
        }

        // result is UserProfile — log the user in immediately
        const dbProfile = result;

        set({
          currentUser: {
            email: dbProfile.email,
            name: dbProfile.fullName,
            phone: dbProfile.phone,
            wishlist: [],
          },
          cart: [],
          wishlist: [],
        });

        return 'success';
      },
    }),
    {
      name: 'volahi-couture-storage', // key in localStorage
    }
  )
);
