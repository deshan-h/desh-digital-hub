import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://cxtfqlrnqdvrhsnifzmr.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_-ebsy3MRH2vb8ZHIuH6vfw_iHAN4quS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
