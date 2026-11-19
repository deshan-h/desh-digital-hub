import { createClient } from '@supabase/supabase-js';

const cleanValue = (val) => {
  if (!val) return '';
  let str = val.trim();
  // Strip surrounding quotes if present
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
};

const rawUrl = cleanValue(import.meta.env.VITE_SUPABASE_URL);
const rawKey = cleanValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

const isPlaceholder = (val) => !val || val.includes('your-project') || val.includes('your_supabase');

export const SUPABASE_URL = !isPlaceholder(rawUrl) 
  ? rawUrl 
  : 'https://cxtfqlrnqdvrhsnifzmr.supabase.co';

export const SUPABASE_ANON_KEY = !isPlaceholder(rawKey) 
  ? rawKey 
  : 'sb_publishable_-ebsy3MRH2vb8ZHIuH6vfw_iHAN4quS';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase Environment Variables! Check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
