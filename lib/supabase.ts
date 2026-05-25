import { createClient } from '@supabase/supabase-js';

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
