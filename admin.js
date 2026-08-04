/* ===========================
   YŪGA Admin — admin.js
=========================== */

document.addEventListener('DOMContentLoaded', () => {

  const ADMIN_PASSWORD = (typeof YUGA_CONFIG !== 'undefined') ? YUGA_CONFIG.admin.password : 'yuga2026';
  const AUTH_KEY = 'yuga_admin';
  const ACTIVE_TAB_KEY = 'yuga_admin_active_tab';
  const tabTitles = { dashboard: 'Dashboard', orders: 'Commandes', products: 'Produits', users: 'Utilisateurs' };
  let currentSearch = '';
  let currentFilter = 'all';
  let userSearch = '';

  function isAdminLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === '1' || sessionStorage.getItem(AUTH_KEY) === '1';
  }

  function persistAdminSession(value) {
    localStorage.setItem(AUTH_KEY, value);
    sessionStorage.setItem(AUTH_KEY, value);
  }

  function clearAdminSession() {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
    sessionStorage.removeItem(ACTIVE_TAB_KEY);
  }

  /* --- Login --- */
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const pwd = document.getElementById('passwordInput').value;
    if (pwd === ADMIN_PASSWORD) {
      persistAdminSession('1');
      showDashboard();
    } else {
      document.getElementById('loginError').textContent = 'Mot de passe incorrect.';
    }
  });

  function setActiveTab(tabName, updateHistory = true) {
    const safeTab = tabName && document.getElementById('tab-' + tabName) ? tabName : 'dashboard';
    document.querySelectorAll('.sidebar__link').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    const btn = document.querySelector('.sidebar__link[data-tab="' + safeTab + '"]');
    const tabEl = document.getElementById('tab-' + safeTab);
    if (btn) btn.classList.add('active');
    if (tabEl) tabEl.classList.add('active');

    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = tabTitles[safeTab] || '';

    localStorage.setItem(ACTIVE_TAB_KEY, safeTab);
    sessionStorage.setItem(ACTIVE_TAB_KEY, safeTab);

    if (updateHistory) {
      const targetHash = '#' + safeTab;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash);
      }
    }
  }

  function getInitialTab() {
    const storedTab = localStorage.getItem(ACTIVE_TAB_KEY) || sessionStorage.getItem(ACTIVE_TAB_KEY);
    if (storedTab && document.getElementById('tab-' + storedTab)) return storedTab;

    const hashTab = window.location.hash.replace('#', '').trim();
    if (hashTab && document.getElementById('tab-' + hashTab)) return hashTab;

    return 'dashboard';
  }

  function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDash').style.display = 'flex';
    setActiveTab(getInitialTab(), false);
    loadAll();
  }

  if (isAdminLoggedIn()) showDashboard();
  window.addEventListener('pageshow', () => {
    if (isAdminLoggedIn()) showDashboard();
  });

  /* --- Logout --- */
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAdminSession();
    location.reload();
  });

  /* --- Tabs --- */
  document.querySelectorAll('.sidebar__link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveTab(btn.dataset.tab);
    });
  });

  /* --- Date --- */
  document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  /* --- Orders CRUD --- */
  function getOrders() {
    return JSON.parse(localStorage.getItem('yuga_orders') || '[]');
  }
  function saveOrders(orders) {
    localStorage.setItem('yuga_orders', JSON.stringify(orders));
  }

  /* --- Load All --- */
  function loadAll() {
    loadStats();
    loadProductsSold();
    loadRecentOrders();
    loadOrdersTable();
    loadUsersTable();
  }

  /* --- Users --- */
  function loadUsersTable() {
    const el = document.getElementById('usersTable');
    if (!el) return;
    let users = JSON.parse(localStorage.getItem('yuga_users') || '[]');
    if (userSearch) {
      const q = userSearch.toLowerCase();
      users = users.filter(u =>
        (u.prenom + ' ' + u.nom).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (!users.length) {
      el.innerHTML = '<div class="orders-table-wrap" style="padding:24px;background:#fff;border-radius:10px;"><p class="empty-msg">Aucun utilisateur inscrit.</p></div>';
      return;
    }
    el.innerHTML = `<div class="orders-table-wrap"><table class="full-table">
      <thead><tr><th>ID</th><th>Nom complet</th><th>Email</th><th>Téléphone</th><th>Inscrit le</th><th>Actions</th></tr></thead>
      <tbody>${users.map(u => `<tr>
        <td><code style="font-size:.73rem;color:#6b5744">${u.id}</code></td>
        <td><strong>${u.prenom} ${u.nom}</strong></td>
        <td>${u.email}</td>
        <td>${u.telephone || '—'}</td>
        <td>${u.createdAt || '—'}</td>
        <td><button class="action-btn action-btn--cancel" onclick="deleteUser('${u.id}')">Supprimer</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }

  document.getElementById('userSearch')?.addEventListener('input', e => {
    userSearch = e.target.value;
    loadUsersTable();
  });

  window.deleteUser = function(id) {
    showConfirm(() => {
      const users = JSON.parse(localStorage.getItem('yuga_users') || '[]').filter(u => u.id !== id);
      localStorage.setItem('yuga_users', JSON.stringify(users));
      loadUsersTable();
    });
  };

  /* --- Stats --- */
  function loadStats() {
    const orders = getOrders();
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    document.getElementById('statOrders').textContent = orders.length;
    document.getElementById('statRevenue').textContent = revenue.toFixed(2) + ' DT';
    document.getElementById('statPending').textContent = orders.filter(o => o.status === 'En attente').length;
    document.getElementById('statDone').textContent = orders.filter(o => o.status === 'Livrée').length;
  }

  /* --- Products Sold --- */
  function loadProductsSold() {
    const orders = getOrders();
    const counts = {};
    orders.forEach(o => (o.products || []).forEach(p => { counts[p.name] = (counts[p.name] || 0) + 1; }));
    const el = document.getElementById('productsSold');
    if (!Object.keys(counts).length) { el.innerHTML = '<p class="empty-msg">Aucune vente enregistrée.</p>'; return; }
    const max = Math.max(...Object.values(counts));
    el.innerHTML = Object.entries(counts).sort((a,b) => b[1]-a[1]).map(([name, count]) => `
      <div class="sold-item">
        <span class="sold-item__name">${name}</span>
        <div class="sold-item__bar-wrap"><div class="sold-item__bar" style="width:${count/max*100}%"></div></div>
        <span class="sold-item__count">${count} vendu${count>1?'s':''}</span>
      </div>`).join('');
  }

  /* --- Recent Orders --- */
  function loadRecentOrders() {
    const orders = getOrders().slice(-5).reverse();
    const el = document.getElementById('recentOrders');
    if (!orders.length) { el.innerHTML = '<p class="empty-msg">Aucune commande pour le moment.</p>'; return; }
    el.innerHTML = `<table class="mini-table"><thead><tr><th>ID</th><th>Client</th><th>Produits</th><th>Total</th><th>Statut</th></tr></thead><tbody>
      ${orders.map(o => `<tr onclick="openModal('${o.id}')" style="cursor:pointer">
        <td><code style="font-size:.73rem;color:#6b5744">${o.id}</code></td>
        <td>${o.customer.prenom} ${o.customer.nom}</td>
        <td>${(o.products||[]).map(p=>p.name).join(', ')}</td>
        <td><strong>${(o.total||0).toFixed(2)} DT</strong></td>
        <td>${statusBadge(o.status)}</td>
      </tr>`).join('')}
    </tbody></table>`;
  }

  /* --- Full Orders Table --- */
  function loadOrdersTable() {
    let orders = getOrders().reverse();
    if (currentFilter !== 'all') orders = orders.filter(o => o.status === currentFilter);
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      orders = orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customer.prenom + ' ' + o.customer.nom).toLowerCase().includes(q) ||
        o.customer.telephone.toLowerCase().includes(q)
      );
    }
    const el = document.getElementById('ordersTable');
    if (!orders.length) { el.innerHTML = '<div class="orders-table-wrap" style="padding:24px;background:#fff;border-radius:10px;"><p class="empty-msg">Aucune commande trouvée.</p></div>'; return; }
    el.innerHTML = `<div class="orders-table-wrap"><table class="full-table">
      <thead><tr><th>ID</th><th>Date</th><th>Client</th><th>Téléphone</th><th>Ville</th><th>Produits</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody>${orders.map(o => `<tr>
        <td onclick="openModal('${o.id}')" style="cursor:pointer"><code style="font-size:.73rem;color:#6b5744">${o.id}</code></td>
        <td>${o.date}</td>
        <td onclick="openModal('${o.id}')" style="cursor:pointer"><strong>${o.customer.prenom} ${o.customer.nom}</strong></td>
        <td>${o.customer.telephone}</td>
        <td>${o.customer.ville}</td>
        <td>${(o.products||[]).map(p=>p.name).join('<br>')}</td>
        <td><strong>${(o.total||0).toFixed(2)} DT</strong></td>
        <td>${statusBadge(o.status)}</td>
        <td>
          ${o.status==='En attente'?`<button class="action-btn action-btn--confirm" onclick="updateStatus('${o.id}','Confirmée')">Confirmer</button>`:''}
          ${o.status==='Confirmée'?`<button class="action-btn action-btn--deliver" onclick="updateStatus('${o.id}','Livrée')">Livrée</button>`:''}
          ${o.status!=='Annulée'&&o.status!=='Livrée'?`<button class="action-btn action-btn--cancel" onclick="updateStatus('${o.id}','Annulée')">Annuler</button>`:''}
          <button class="action-btn" style="border-color:#e74c3c;color:#e74c3c" onclick="deleteOrder('${o.id}')">Supprimer</button>
        </td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }

  document.getElementById('orderSearch').addEventListener('input', e => { currentSearch = e.target.value; loadOrdersTable(); });
  document.getElementById('orderFilter').addEventListener('change', e => { currentFilter = e.target.value; loadOrdersTable(); });

  /* --- Custom Confirm Dialog --- */
  let confirmCallback = null;

  function showConfirm(cb) {
    confirmCallback = cb;
    document.getElementById('confirmOverlay').classList.add('open');
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'confirmOk') {
      document.getElementById('confirmOverlay').classList.remove('open');
      if (confirmCallback) { confirmCallback(); confirmCallback = null; }
      return;
    }
    if (e.target.id === 'confirmCancel' || e.target.id === 'confirmOverlay') {
      document.getElementById('confirmOverlay').classList.remove('open');
      confirmCallback = null;
      return;
    }
    if (e.target.closest('#modalClose')) { closeModal(); return; }
    if (e.target.id === 'modalOverlay') { closeModal(); return; }
  });

  /* --- Delete Order --- */
  function deleteOrder(id) {
    showConfirm(() => {
      const orders = getOrders().filter(o => o.id !== id);
      saveOrders(orders);
      loadAll();
    });
  }
  function updateStatus(id, status) {
    const orders = getOrders();
    const o = orders.find(o => o.id === id);
    if (o) { o.status = status; saveOrders(orders); loadAll(); }
  }

  /* --- Status Badge --- */
  function statusBadge(status) {
    const map = { 'En attente':'pending','Confirmée':'confirmed','Livrée':'delivered','Annulée':'cancelled' };
    return `<span class="status status--${map[status]||'pending'}">${status}</span>`;
  }

  /* --- Modal --- */
  function openModal(id) {
    const order = getOrders().find(o => o.id === id);
    if (!order) return;
    document.getElementById('modalTitle').textContent = 'Commande ' + order.id;
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-section">
        <h4>Informations client</h4>
        <div class="modal-row"><span>Nom</span><span>${order.customer.prenom} ${order.customer.nom}</span></div>
        <div class="modal-row"><span>Téléphone</span><span>${order.customer.telephone}</span></div>
        ${order.customer.email?`<div class="modal-row"><span>Email</span><span>${order.customer.email}</span></div>`:''}
        <div class="modal-row"><span>Adresse</span><span>${order.customer.adresse}</span></div>
        <div class="modal-row"><span>Ville</span><span>${order.customer.ville}, ${order.customer.gouvernorat}</span></div>
        ${order.customer.notes?`<div class="modal-row"><span>Notes</span><span>${order.customer.notes}</span></div>`:''}
      </div>
      <div class="modal-section">
        <h4>Produits commandés</h4>
        ${(order.products||[]).map(p=>`<div class="modal-row"><span>${p.name}</span><span>${p.price}.00 DT</span></div>`).join('')}
      </div>
      <div class="modal-section">
        <h4>Récapitulatif</h4>
        <div class="modal-row"><span>Sous-total</span><span>${order.subtotal.toFixed(2)} DT</span></div>
        <div class="modal-row"><span>Livraison</span><span>${order.shipping===0?'Gratuite':order.shipping+'.00 DT'}</span></div>
        <div class="modal-row modal-row--total"><span>Total</span><span>${order.total.toFixed(2)} DT</span></div>
      </div>
      <div class="modal-section">
        <h4>Changer le statut</h4>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${order.status==='En attente'?`<button class="action-btn action-btn--confirm" onclick="updateStatus('${order.id}','Confirmée');closeModal()">Confirmer</button>`:''}
          ${order.status==='Confirmée'?`<button class="action-btn action-btn--deliver" onclick="updateStatus('${order.id}','Livrée');closeModal()">Marquer livrée</button>`:''}
          ${order.status!=='Annulée'&&order.status!=='Livrée'?`<button class="action-btn action-btn--cancel" onclick="updateStatus('${order.id}','Annulée');closeModal()">Annuler</button>`:''}
          <button class="action-btn" style="border-color:#e74c3c;color:#e74c3c" onclick="deleteOrder('${order.id}');closeModal()">Supprimer</button>
          ${statusBadge(order.status)}
        </div>
      </div>`;
    document.getElementById('modalOverlay').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  }

  // Expose functions used via inline onclick="" in the HTML
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.deleteOrder = deleteOrder;
  window.updateStatus = updateStatus;
  window.updateStock = window.updateStock;

  window.toggleActive = function(id) {
    const stock = JSON.parse(localStorage.getItem('yuga_stock') || '{"mira":10,"sahra":10}');
    const btn = document.getElementById('toggle-' + id);
    const badge = document.getElementById('badge-' + id);
    const input = document.getElementById('stock-' + id);
    const isActive = stock[id] > 0;
    if (isActive) {
      stock[id] = 0;
      if (input) input.value = 0;
    } else {
      stock[id] = 10;
      if (input) input.value = 10;
    }
    localStorage.setItem('yuga_stock', JSON.stringify(stock));
    if (badge) {
      badge.textContent = stock[id] > 0 ? 'Actif' : 'Rupture de stock';
      badge.className = 'stock-badge ' + (stock[id] > 0 ? 'stock-badge--active' : 'stock-badge--inactive');
    }
    if (btn) {
      btn.textContent = stock[id] > 0 ? 'Actif' : 'Inactif';
      btn.className = 'toggle-btn ' + (stock[id] > 0 ? 'toggle-btn--active' : 'toggle-btn--inactive');
    }
  };

  /* --- Stock Management --- */
  function loadStock() {
    const stock = JSON.parse(localStorage.getItem('yuga_stock') || '{"mira":10,"sahra":10}');
    ['mira', 'sahra'].forEach(id => {
      const input = document.getElementById('stock-' + id);
      const badge = document.getElementById('badge-' + id);
      if (!input || !badge) return;
      const val = stock[id] ?? 10;
      input.value = val;
      badge.textContent = val > 0 ? 'Actif' : 'Rupture de stock';
      badge.className = 'stock-badge ' + (val > 0 ? 'stock-badge--active' : 'stock-badge--inactive');
    });
  }

  window.updateStock = function(id, val) {
    const stock = JSON.parse(localStorage.getItem('yuga_stock') || '{"mira":10,"sahra":10}');
    stock[id] = parseInt(val) || 0;
    localStorage.setItem('yuga_stock', JSON.stringify(stock));
    const badge = document.getElementById('badge-' + id);
    if (badge) {
      badge.textContent = stock[id] > 0 ? 'Actif' : 'Rupture de stock';
      badge.className = 'stock-badge ' + (stock[id] > 0 ? 'stock-badge--active' : 'stock-badge--inactive');
    }
  };

  // Only load stock when the products tab is visible
  document.querySelector('.sidebar__link[data-tab="products"]')?.addEventListener('click', () => {
    setTimeout(loadStock, 50);
  });

  loadStock();

});