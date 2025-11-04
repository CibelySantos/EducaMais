// src/supabaseClient.js

// ESSENCIAL: Polifill de URL para React Native
import 'react-native-url-polyfill/auto'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Suas credenciais
const SUPABASE_URL = 'https://glrodzmmcefqpppavlaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdscm9kem1tY2VmcXBwcGF2bGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTU4MzQsImV4cCI6MjA3NzgzMTgzNH0.H4dbPDS2lFOS_hpuBAt9atrhw7OeEBlqEzCTdQz3WBM';

// Configuração CORRETA para React Native/Expo
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // ESSA LINHA É CRÍTICA: Informa ao Supabase para usar o armazenamento local
    storage: AsyncStorage, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});