// ─── Auth Helpers ───
const getToken = () => localStorage.getItem('ems_token');
const getUser = () => JSON.parse(localStorage.getItem('ems_user') || 'null');

function setAuth(token, user) {
  localStorage.setItem('ems_token', token);
  localStorage.setItem('ems_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('ems_token');
  localStorage.removeItem('ems_user');
}

function logout() {
  clearAuth();
  window.location.href = '/login';
}

// ─── API Fetch Wrapper ───
async function api(method, path, body = null) {
  const token = getToken();
  if (!token) { window.location.href = '/login'; return; }

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch('/api' + path, opts);
  if (res.status === 401) { clearAuth(); window.location.href = '/login'; return; }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Toast Notifications ───
function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ─── Badge Helpers ───
function statusBadge(status) {
  const map = {
    pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected',
    draft: 'badge-draft', finalized: 'badge-finalized', paid: 'badge-paid',
    active: 'badge-active', inactive: 'badge-inactive'
  };
  return `<span class="badge ${map[status] || 'badge-draft'}">${status}</span>`;
}

function roleBadge(role) {
  return `<span class="badge badge-${role}">${role}</span>`;
}

// ─── Date Formatting ───
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function monthName(m) {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1] || '';
}

// ─── Modal Helpers ───
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
  }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  }
});

// ─── Mobile Sidebar Toggle ───
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// ─── apiFetch (alias for fetch with auth) ───
async function apiFetch(url, opts = {}) {
  opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Auth Guard ───
(function() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return;
  }

  // Populate user info in sidebar
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (avatarEl) avatarEl.textContent = (user.name || 'U')[0].toUpperCase();

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Mark active nav link + close sidebar on mobile when link clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && window.location.pathname.startsWith(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === window.location.pathname) {
      link.classList.add('active');
    }
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
})();
