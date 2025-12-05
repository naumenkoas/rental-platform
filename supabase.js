// supabase.js
// Единая точка входа. Инициализирует window.sb

const SUPABASE_URL = "https://zzkriumjamchjrxdxhzf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a3JpdW1qYW1jaGpyeGR4aHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDkyNDcsImV4cCI6MjA3OTgyNTI0N30.mK7jN6En9SWhr2Avt545CIGm58Kd7ACgs8hGOe4UKMU";

// Проверяем, загрузилась ли библиотека
if (typeof window.supabase === 'undefined') {
  console.error("Supabase library not loaded! Check your <head> tags.");
} else {
  // Создаем глобальный клиент 'sb' (коротко и ясно, чтобы не путать с библиотекой)
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Supabase Client initialized as window.sb");
}

// --- ОБЩИЕ ФУНКЦИИ ---

async function requireAuth(redirectTo = "index.html") {
  const { data, error } = await window.sb.auth.getUser();
  if (error || !data || !data.user) {
    window.location.href = redirectTo;
    return null;
  }
  return data.user;
}

async function getCurrentProfile() {
  const { data: { user } } = await window.sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await window.sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  
  return profile;
}

async function logout(redirectTo = "index.html") {
  await window.sb.auth.signOut();
  window.location.href = redirectTo;
}
