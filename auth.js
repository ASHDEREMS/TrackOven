// Shared Supabase client and page guards.
(function () {
  // Built-in copy of the (public) connection values. Used if config.js is old or missing.
  const DEFAULTS = {
    SUPABASE_URL: 'https://cotarohayjhlaommikfo.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_dk2t91WmqKh4DCLp201AMQ_FW7IDCMw'
  };
  const fromFile = window.TRACKOVEN || {};
  const ok = function (v) { return v && !/PASTE_/.test(v); };
  const cfg = {
    SUPABASE_URL: ok(fromFile.SUPABASE_URL) ? fromFile.SUPABASE_URL : DEFAULTS.SUPABASE_URL,
    SUPABASE_ANON_KEY: ok(fromFile.SUPABASE_ANON_KEY) ? fromFile.SUPABASE_ANON_KEY : DEFAULTS.SUPABASE_ANON_KEY
  };

  // Visible red banner so setup problems are easy to see on a phone.
  function banner(msg) {
    const add = function () {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#D9362F;color:#fff;padding:12px 16px;font:14px/1.4 system-ui,sans-serif;text-align:center;visibility:visible';
      d.textContent = 'TrackOven setup problem: ' + msg;
      document.body.appendChild(d);
    };
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  }

  const bad = function (v) { return !v || /PASTE_/.test(v); };
  if (!window.supabase) {
    banner('the Supabase library did not load. Check your internet connection or ad-blocker.');
  } else if (bad(cfg.SUPABASE_URL) || bad(cfg.SUPABASE_ANON_KEY)) {
    banner('config.js still has the PASTE_ placeholders. Add your Supabase Project URL and anon key.');
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.SUPABASE_URL.trim())) {
    banner('the Project URL in config.js looks wrong. It should look like https://abcdxyz.supabase.co');
  } else {
    try {
      window.sb = window.supabase.createClient(cfg.SUPABASE_URL.trim(), cfg.SUPABASE_ANON_KEY.trim());
    } catch (e) {
      banner('could not start Supabase (' + e.message + ').');
    }
  }

  // Students: must be logged in (email already verified by Supabase).
  window.requireStudent = async function () {
    if (!window.sb) return null;
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
})();
