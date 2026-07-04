/* ═══════════════════════════════════════════════════════════════
   OOD HRMS — Shared Front-End Utilities
   ═══════════════════════════════════════════════════════════════ */

const API = '/api';

/* ── Token helpers ───────────────────────────────────────────── */
const getToken = ()  => localStorage.getItem('hrms_token');
const getUser  = ()  => JSON.parse(localStorage.getItem('hrms_user') || 'null');
const saveAuth = (token, user) => {
  localStorage.setItem('hrms_token', token);
  localStorage.setItem('hrms_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('hrms_token');
  localStorage.removeItem('hrms_user');
};

/* ── Fetch wrapper (auto-attaches JWT) ───────────────────────── */
async function api(endpoint, opts = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res  = await fetch(`${API}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) { clearAuth(); window.location.href = '/'; }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

/* ── Toast Notification System ───────────────────────────────── */
function showToast(message, type = 'info', duration = 4500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[9999] flex flex-col items-end gap-3';
    document.body.appendChild(container);
  }

  const palette = {
    success: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    error:   'bg-red-500/15 border-red-500/40 text-red-300',
    info:    'bg-violet-500/15 border-violet-500/40 text-violet-300',
    warning: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  const el = document.createElement('div');
  el.className =
    `flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl toast-enter ${palette[type]}`;
  el.innerHTML = `
    <span class="text-base font-bold">${icons[type]}</span>
    <span class="text-sm font-medium leading-snug">${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.replace('toast-enter', 'toast-exit');
    setTimeout(() => el.remove(), 350);
  }, duration);
}

/* ── Auth Guard ──────────────────────────────────────────────── */
function requireAuth(requiredRole = null) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) { window.location.href = '/'; return false; }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = user.role === 'HR' ? '/admin.html' : '/employee.html';
    return false;
  }
  return true;
}

/* ── Formatters ──────────────────────────────────────────────── */
const fmt = {
  currency(n) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2,
    }).format(n);
  },
  date(s) {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  },
  time(s) {
    return new Date(s).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  },
  initials(first, last) {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  },
};

/* ── Logout ──────────────────────────────────────────────────── */
function logout() {
  clearAuth();
  window.location.href = '/';
}
