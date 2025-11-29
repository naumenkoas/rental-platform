const supabaseUrl = "https://YOUR_PROJECT.supabase.co"; // TODO: replace with your Supabase URL
const supabaseKey = "YOUR-ANON-PUBLIC-KEY";             // TODO: replace with your public anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Helper: redirect if not logged in
async function requireAuth(redirectTo = "login.html") {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    window.location.href = redirectTo;
    return null;
  }
  return data.user;
}

async function getCurrentProfile() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData || !userData.user) return null;
  const user = userData.user;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return profile;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}
