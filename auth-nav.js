/* ===========================
   YŪGA — auth-nav.js
=========================== */

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('yuga_current_user') || 'null');
}

(function() {
  const user = getCurrentUser();

  /* Bell — only visible when logged in */
  const navNotif = document.getElementById('navNotif');
  if (navNotif) navNotif.style.display = user ? 'flex' : 'none';

  /* User menu */
  const navUser = document.getElementById('navUser');
  if (!navUser) return;

  if (user) {
    navUser.innerHTML = `
      <div class="nav__user-menu">
        <button class="nav__user-btn" id="userMenuBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>${user.prenom}</span>
        </button>
        <div class="nav__user-dropdown" id="userDropdown">
          <p class="nav__user-info">${user.prenom} ${user.nom}</p>
          <p class="nav__user-email">${user.email}</p>
          <button class="nav__user-logout" id="logoutUserBtn">Déconnexion</button>
        </div>
      </div>`;

    document.getElementById('userMenuBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('userDropdown').classList.toggle('open');
    });
    document.addEventListener('click', () => {
      const d = document.getElementById('userDropdown');
      if (d) d.classList.remove('open');
    });
    document.getElementById('logoutUserBtn').addEventListener('click', () => {
      localStorage.removeItem('yuga_current_user');
      window.location.reload();
    });
  } else {
    navUser.innerHTML = `
      <a href="login.html?redirect=${encodeURIComponent(window.location.href)}" class="nav__login-link" aria-label="Connexion">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="nav__login-label">Connexion</span>
      </a>`;
  }
})();
