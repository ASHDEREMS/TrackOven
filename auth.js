// Shared Supabase client and page guards.
const cfg = window.TRACKOVEN;
window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

// Students: must be logged in (email already verified by Supabase).
window.requireStudent = async function () {
  const { data } = await sb.auth.getSession();
  if (!data.session) { location.replace('index.html'); return null; }
  return data.session;
};

// Admin: must be logged in AND have passed the 6-digit passcode step.
// admin_stats() only succeeds for a verified admin, so it doubles as the check.
window.requireAdmin = async function () {
  const s = await window.requireStudent();
  if (!s) return null;
  const { error } = await sb.rpc('admin_stats');
  if (error) { location.replace('index.html'); return null; }
  return s;
};
