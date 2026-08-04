/* ===========================
   YŪGA — auth.js
=========================== */

const lettersOnly = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const phoneOnly   = /^[\d\s\+\-\(\)]{8,15}$/;
const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getUsers() {
  return JSON.parse(localStorage.getItem('yuga_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('yuga_users', JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem('yuga_current_user', JSON.stringify(user));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('yuga_current_user') || 'null');
}

/* Redirect if already logged in */
if (getCurrentUser()) {
  const redir = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
  window.location.href = redir;
}

function showLogin() {
  document.getElementById('loginBox').style.display = '';
  document.getElementById('registerBox').style.display = 'none';
}
function showRegister() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = '';
}

/* --- Login --- */
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const err      = document.getElementById('loginError');

  if (!emailRegex.test(email)) { err.textContent = 'Adresse e-mail invalide.'; return; }
  if (!password) { err.textContent = 'Veuillez entrer votre mot de passe.'; return; }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) { err.textContent = 'Email ou mot de passe incorrect.'; return; }

  setCurrentUser({ prenom: user.prenom, nom: user.nom, email: user.email, telephone: user.telephone });
  const redir = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
  window.location.href = redir;
});

/* --- Register --- */
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const prenom   = document.getElementById('regPrenom').value.trim();
  const nom      = document.getElementById('regNom').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const err      = document.getElementById('registerError');

  err.textContent = '';

  if (!lettersOnly.test(prenom)) { err.textContent = 'Le prénom ne doit contenir que des lettres.'; return; }
  if (!lettersOnly.test(nom))    { err.textContent = 'Le nom ne doit contenir que des lettres.'; return; }
  if (!emailRegex.test(email))   { err.textContent = 'Adresse e-mail invalide.'; return; }
  if (!phoneOnly.test(phone))    { err.textContent = 'Numéro de téléphone invalide (8-15 chiffres).'; return; }
  if (password.length < 6)       { err.textContent = 'Le mot de passe doit contenir au moins 6 caractères.'; return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { err.textContent = 'Un compte avec cet email existe déjà.'; return; }

  const newUser = {
    id: 'USR-' + Date.now(),
    prenom, nom, email, telephone: phone, password,
    createdAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser({ prenom, nom, email, telephone: phone });

  const redir = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
  window.location.href = redir;
});
