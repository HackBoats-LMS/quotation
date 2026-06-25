import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error(error);
  } else {
    for (const t of data) {
      console.log(`Template ID: ${t.id}`);
      console.log(`Name: ${t.name}`);
      console.log(`Elements Count: ${t.canvas_data?.elements?.length || 0}`);
      console.log('---');
    }
  }
}

main();
