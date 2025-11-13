// ===================================
// Supabase Configuration
// ===================================

const SUPABASE_URL = 'https://qlvdidwmoowirkrsvyfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdmRpZHdtb293aXJrcnN2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDM1MDEsImV4cCI6MjA3ODQ3OTUwMX0.SjIg0Lf9r3W3qr8rHiv6Y03caL9-PuyAEv_rBrLaLY0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
console.log('Supabase initialized:', SUPABASE_URL);
