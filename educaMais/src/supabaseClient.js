// SRC/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://glrodzmmcefqpppavlaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdscm9kem1tY2VmcXBwcGF2bGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTU4MzQsImV4cCI6MjA3NzgzMTgzNH0.H4dbPDS2lFOS_hpuBAt9atrhw7OeEBlqEzCTdQz3WBM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
