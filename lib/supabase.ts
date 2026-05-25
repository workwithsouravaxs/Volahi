import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ukjbaufeubjmzycpdtde.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVramJhdWZldWJqbXp5Y3BkdGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTQ3NTgsImV4cCI6MjA5NTI3MDc1OH0.QD_t9RXpnTIAd-hL18HwdLujh1vr4CWSDTwqLKLEW8U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to convert file to Base64 for zero-config fallback
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Uploads an image to a Supabase storage bucket.
 * Falls back to local Base64 string if the upload fails or bucket is unconfigured.
 */
async function uploadToStorage(bucket: string, file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload failed. Falling back to local Base64. Error:`, error.message);
      return await convertToBase64(file);
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn(`[Supabase Storage] Unexpected error. Falling back to local Base64:`, err);
    return await convertToBase64(file);
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  return uploadToStorage('product-images', file);
}

export async function uploadBannerImage(file: File): Promise<string> {
  return uploadToStorage('hero-banners', file);
}

/**
 * Captures customer signup lead info in the Supabase 'leads' table.
 */
export async function saveLead(name: string, phone: string, email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          name, 
          phone, 
          email, 
          created_at: new Date().toISOString() 
        }
      ]);

    if (error) {
      console.warn(`[Supabase DB] Failed to save lead. Error:`, error.message);
      return false;
    }
    
    console.log(`[Supabase DB] Lead captured successfully for: ${email}`);
    return true;
  } catch (err) {
    console.warn(`[Supabase DB] Unexpected error saving lead:`, err);
    return false;
  }
}

/**
 * Verifies admin credentials against the Supabase 'admins' table.
 * Returns true if matching credentials are found, false otherwise.
 */
export async function verifyAdmin(email: string, pass: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', pass);

    if (error) {
      console.warn(`[Supabase DB] Failed to query admins table. Fallback active. Error:`, error.message);
      throw new Error(error.message); // Trigger fallback in UI
    }

    return data && data.length > 0;
  } catch (err) {
    console.warn(`[Supabase DB] Admin query failed. Local fallback active.`);
    throw err; // Trigger local fallback in admin login
  }
}

// ==================== DB SYNC OPERATIONS & MODEL MAPPINGS ====================

import { Product, Banner, Order } from './store';

// Product Serialization Helpers
const mapToProduct = (dbRow: any): Product => ({
  id: dbRow.id,
  name: dbRow.name,
  description: dbRow.description,
  category: dbRow.category,
  subcategory: dbRow.subcategory || '',
  price: Number(dbRow.price),
  discountPrice: dbRow.discount_price ? Number(dbRow.discount_price) : undefined,
  images: Array.isArray(dbRow.images) ? dbRow.images : JSON.parse(dbRow.images || '[]'),
  image: dbRow.image,
  stock: Number(dbRow.stock),
  sku: dbRow.sku || '',
  brand: dbRow.brand,
  material: dbRow.material,
  colors: Array.isArray(dbRow.colors) ? dbRow.colors : JSON.parse(dbRow.colors || '[]'),
  sizes: Array.isArray(dbRow.sizes) ? dbRow.sizes : JSON.parse(dbRow.sizes || '[]'),
  allSizesAvailable: !!dbRow.all_sizes_available,
  tags: Array.isArray(dbRow.tags) ? dbRow.tags : JSON.parse(dbRow.tags || '[]'),
  features: Array.isArray(dbRow.features) ? dbRow.features : JSON.parse(dbRow.features || '[]'),
  careInstructions: dbRow.care_instructions,
  shippingInfo: dbRow.shipping_info,
  returnPolicy: dbRow.return_policy,
  status: dbRow.status,
  featured: !!dbRow.featured,
  bestSeller: !!dbRow.best_seller,
  newArrival: !!dbRow.new_arrival,
});

const mapToDbProduct = (p: Omit<Product, 'reviews'>) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  subcategory: p.subcategory || null,
  price: p.price,
  discount_price: p.discountPrice || null,
  images: Array.isArray(p.images) ? p.images : [],
  image: p.image,
  stock: p.stock,
  sku: p.sku || null,
  brand: p.brand || 'Volahi',
  material: p.material,
  colors: Array.isArray(p.colors) ? p.colors : [],
  sizes: Array.isArray(p.sizes) ? p.sizes : [],
  all_sizes_available: !!p.allSizesAvailable,
  tags: Array.isArray(p.tags) ? p.tags : [],
  features: Array.isArray(p.features) ? p.features : [],
  care_instructions: p.careInstructions,
  shipping_info: p.shippingInfo,
  return_policy: p.returnPolicy,
  status: p.status,
  featured: !!p.featured,
  best_seller: !!p.bestSeller,
  new_arrival: !!p.newArrival,
});

// Banner Serialization Helpers
const mapToBanner = (dbRow: any): Banner => ({
  id: dbRow.id,
  image: dbRow.image,
  title: dbRow.title || '',
  subtitle: dbRow.subtitle || '',
  ctaText: dbRow.cta_text || '',
  ctaLink: dbRow.cta_link || '',
  active: !!dbRow.active,
});

const mapToDbBanner = (b: Banner, isMiddle = false) => ({
  id: b.id,
  image: b.image,
  title: b.title || '',
  subtitle: b.subtitle || '',
  cta_text: b.ctaText || '',
  cta_link: b.ctaLink || '',
  active: !!b.active,
  is_middle: isMiddle,
});

// Products DB Operations
export async function getDbProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase DB] Error fetching products, fallback active:', error.message);
      return [];
    }

    return (data || []).map(mapToProduct);
  } catch (err) {
    console.warn('[Supabase DB] Exception fetching products, fallback active:', err);
    return [];
  }
}

export async function addDbProduct(p: Omit<Product, 'reviews'>): Promise<boolean> {
  try {
    const dbRow = mapToDbProduct(p);
    const { error } = await supabase
      .from('products')
      .insert([dbRow]);

    if (error) {
      console.error('[Supabase DB] Failed to insert product:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception inserting product:', err);
    return false;
  }
}

export async function editDbProduct(p: Product): Promise<boolean> {
  try {
    const dbRow = mapToDbProduct(p);
    const { error } = await supabase
      .from('products')
      .update(dbRow)
      .eq('id', p.id);

    if (error) {
      console.error('[Supabase DB] Failed to update product:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception updating product:', err);
    return false;
  }
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB] Failed to delete product:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception deleting product:', err);
    return false;
  }
}

// Banners DB Operations
export async function getDbBanners(): Promise<{ banners: Banner[]; middleBanner: Banner | null }> {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*');

    if (error) {
      console.warn('[Supabase DB] Error fetching banners, fallback active:', error.message);
      return { banners: [], middleBanner: null };
    }

    const rows = data || [];
    const banners = rows.filter((r: any) => !r.is_middle).map(mapToBanner);
    const middleRow = rows.find((r: any) => r.is_middle);
    const middleBanner = middleRow ? mapToBanner(middleRow) : null;

    return { banners, middleBanner };
  } catch (err) {
    console.warn('[Supabase DB] Exception fetching banners, fallback active:', err);
    return { banners: [], middleBanner: null };
  }
}

export async function addDbBanner(b: Banner): Promise<boolean> {
  try {
    const dbRow = mapToDbBanner(b, false);
    const { error } = await supabase
      .from('banners')
      .insert([dbRow]);

    if (error) {
      console.error('[Supabase DB] Failed to insert banner:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception inserting banner:', err);
    return false;
  }
}

export async function deleteDbBanner(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB] Failed to delete banner:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception deleting banner:', err);
    return false;
  }
}

export async function toggleDbBanner(id: string, active: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('banners')
      .update({ active })
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB] Failed to toggle banner status:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception toggling banner status:', err);
    return false;
  }
}

export async function setDbMiddleBanner(b: Banner | null): Promise<boolean> {
  try {
    // Delete existing middle banner first
    const { error: delError } = await supabase
      .from('banners')
      .delete()
      .eq('is_middle', true);

    if (delError) {
      console.error('[Supabase DB] Failed to delete old middle banner:', delError.message);
    }

    if (!b) return true; // clean deletion complete

    const dbRow = mapToDbBanner(b, true);
    const { error } = await supabase
      .from('banners')
      .insert([dbRow]);

    if (error) {
      console.error('[Supabase DB] Failed to insert middle banner:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception setting middle banner:', err);
    return false;
  }
}

// ==================== DB ORDER SYNC OPERATIONS & MODEL MAPPINGS ====================

// Order Serialization Helpers
const mapToOrder = (dbRow: any): Order => ({
  id: dbRow.id,
  customerEmail: dbRow.customer_email,
  customerName: dbRow.customer_name,
  shippingDetails: {
    address: dbRow.shipping_address,
    city: dbRow.shipping_city,
    zipCode: dbRow.shipping_zip,
    phone: dbRow.shipping_phone,
  },
  items: Array.isArray(dbRow.items) ? dbRow.items : JSON.parse(dbRow.items || '[]'),
  subtotal: Number(dbRow.subtotal),
  tax: Number(dbRow.tax),
  shipping: Number(dbRow.shipping),
  total: Number(dbRow.total),
  status: dbRow.status,
  trackingUrl: dbRow.tracking_url || undefined,
  date: dbRow.order_date,
});

const mapToDbOrder = (o: Order) => ({
  id: o.id,
  customer_email: o.customerEmail,
  customer_name: o.customerName,
  shipping_address: o.shippingDetails.address,
  shipping_city: o.shippingDetails.city,
  shipping_zip: o.shippingDetails.zipCode,
  shipping_phone: o.shippingDetails.phone,
  items: Array.isArray(o.items) ? o.items : [],
  subtotal: o.subtotal,
  tax: o.tax,
  shipping: o.shipping,
  total: o.total,
  status: o.status,
  tracking_url: o.trackingUrl || null,
  order_date: o.date,
});

// Orders DB Operations
export async function fetchDbOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase DB] Error fetching orders, fallback active:', error.message);
      return [];
    }

    return (data || []).map(mapToOrder);
  } catch (err) {
    console.warn('[Supabase DB] Exception fetching orders, fallback active:', err);
    return [];
  }
}

export async function addDbOrder(o: Order): Promise<boolean> {
  try {
    const dbRow = mapToDbOrder(o);
    const { error } = await supabase
      .from('orders')
      .insert([dbRow]);

    if (error) {
      console.error('[Supabase DB] Failed to insert order:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception inserting order:', err);
    return false;
  }
}

export async function updateDbOrderStatus(id: string, status: string, trackingUrl?: string): Promise<boolean> {
  try {
    const updateData: any = { status };
    if (trackingUrl !== undefined) {
      updateData.tracking_url = trackingUrl || null;
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB] Failed to update order status:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception updating order status:', err);
    return false;
  }
}

export async function deleteDbOrder(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB] Failed to delete order:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase DB] Exception deleting order:', err);
    return false;
  }
}

// ==================== USER AUTHENTICATION & SESSION SYNC OPERATIONS ====================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  wishlist: string[];
  cart: import('./store').CartItem[];
  createdAt: string;
  lastLogin: string | null;
}

/**
 * Registers a new user account in the Supabase users table.
 * Password is hashed with bcrypt (cost factor 10) before storage.
 * Returns the new UserProfile on success, or a string error code on failure.
 */
export async function signupUser(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<UserProfile | 'already_exists' | 'error'> {
  try {
    // Check if email is already registered
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (checkError) {
      console.error('[Auth] Error checking existing user:', checkError.message);
      return 'error';
    }

    if (existing) {
      return 'already_exists';
    }

    // Hash the password with bcrypt (cost factor 10)
    const passwordHash = await bcrypt.hash(password, 10);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName,
        phone_number: phone || null,
        wishlist: [],
        cart: [],
        created_at: now,
        updated_at: now,
        last_login: now,
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('[Auth] Failed to insert user:', error?.message);
      return 'error';
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone_number || '',
      wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
      cart: Array.isArray(data.cart) ? data.cart : [],
      createdAt: data.created_at,
      lastLogin: data.last_login,
    };
  } catch (err) {
    console.error('[Auth] Exception during signup:', err);
    return 'error';
  }
}

/**
 * Authenticates a user by validating their email and bcrypt-hashed password.
 * Updates last_login on success.
 * Returns the full UserProfile on success, or a string error code on failure.
 */
export async function loginUserWithCredentials(
  email: string,
  password: string
): Promise<UserProfile | 'not_found' | 'wrong_password' | 'error'> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('[Auth] Error fetching user for login:', error.message);
      return 'error';
    }

    if (!data) {
      return 'not_found';
    }

    // Verify password against stored hash
    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) {
      return 'wrong_password';
    }

    // Update last_login timestamp
    const now = new Date().toISOString();
    await supabase
      .from('users')
      .update({ last_login: now, updated_at: now })
      .eq('id', data.id);

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone_number || '',
      wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
      cart: Array.isArray(data.cart) ? data.cart : [],
      createdAt: data.created_at,
      lastLogin: now,
    };
  } catch (err) {
    console.error('[Auth] Exception during login:', err);
    return 'error';
  }
}

/**
 * Fetches the full user profile from the database by email.
 * Used to restore session data (cart, wishlist) on login.
 */
export async function fetchUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) {
      console.warn('[Auth] Could not fetch user profile:', error?.message);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone_number || '',
      wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
      cart: Array.isArray(data.cart) ? data.cart : [],
      createdAt: data.created_at,
      lastLogin: data.last_login,
    };
  } catch (err) {
    console.warn('[Auth] Exception fetching user profile:', err);
    return null;
  }
}

/**
 * Persists the user's current cart state to their database row.
 * Called on every cart mutation when a user is logged in.
 */
export async function updateUserCartInDb(email: string, cart: import('./store').CartItem[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ cart, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim());

    if (error) {
      console.warn('[Auth] Failed to sync cart to DB:', error.message);
    }
  } catch (err) {
    console.warn('[Auth] Exception syncing cart to DB:', err);
  }
}

/**
 * Persists the user's current wishlist state to their database row.
 * Called on every wishlist toggle when a user is logged in.
 */
export async function updateUserWishlistInDb(email: string, wishlist: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ wishlist, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim());

    if (error) {
      console.warn('[Auth] Failed to sync wishlist to DB:', error.message);
    }
  } catch (err) {
    console.warn('[Auth] Exception syncing wishlist to DB:', err);
  }
}
