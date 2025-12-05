// supabase.js
// Общая инициализация клиента Supabase v2 + базовые хелперы

const SUPABASE_URL = "https://zzkriumjamchjrxdxhzf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a3JpdW1qYW1jaGpyeGR4aHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDkyNDcsImV4cCI6MjA3OTgyNTI0N30.mK7jN6En9SWhr2Avt545CIGm58Kd7ACgs8hGOe4UKMU";

// ВАЖНО: берём глобальный window.supabase, а не самих себя
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Хелпер: редирект, если не залогинен
async function requireAuth(redirectTo = "index.html") {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data || !data.user) {
    window.location.href = redirectTo;
    return null;
  }
  return data.user;
}

// Хелпер: получить профиль текущего пользователя (profiles.id = auth.users.id)
async function getCurrentProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data || !data.user) return null;
  const user = data.user;

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id) // id → auth.users.id
    .maybeSingle();

  if (pErr) {
    console.error("getCurrentProfile error:", pErr);
    return null;
  }
  return profile;
}

// Хелпер: логаут с опциональным редиректом
async function logout(redirectTo = "index.html") {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("logout error", e);
  } finally {
    window.location.href = redirectTo;
  }
}
