import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxtfqlrnqdvrhsnifzmr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-ebsy3MRH2vb8ZHIuH6vfw_iHAN4quS';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: class FakeWS {} }
});

async function checkRepairRow() {
  const { data, error } = await supabase.from('repairs').select('*').limit(1);
  console.log('Repair row:', data, error);
}

checkRepairRow();
