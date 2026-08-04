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
  document.getElementById('forgotBox').style.display = 'none';
  document.getElementById('resetBox').style.display = 'none';
}
function showRegister() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = '';
  document.getElementById('forgotBox').style.display = 'none';
  document.getElementById('resetBox').style.display = 'none';
}
function showForgotPassword() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = 'none';
  document.getElementById('forgotBox').style.display = '';
  document.getElementById('resetBox').style.display = 'none';
}

let resetUserEmail = ''; // Store email for password reset

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

/* --- Forgot Password --- */
document.getElementById('forgotForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const err   = document.getElementById('forgotError');

  err.textContent = '';

  if (!emailRegex.test(email)) { err.textContent = 'Adresse e-mail invalide.'; return; }

  const users = getUsers();
  const user  = users.find(u => u.email === email);
  if (!user) { err.textContent = 'Aucun compte associé à cet email.'; return; }

  // Store email and show reset form
  resetUserEmail = email;
  document.getElementById('forgotBox').style.display = 'none';
  document.getElementById('resetBox').style.display = '';
  document.getElementById('resetPassword').value = '';
  document.getElementById('resetPasswordConfirm').value = '';
  document.getElementById('resetError').textContent = '';
});

/* --- Reset Password --- */
document.getElementById('resetForm').addEventListener('submit', e => {
  e.preventDefault();
  const newPassword = document.getElementById('resetPassword').value;
  const confirmPassword = document.getElementById('resetPasswordConfirm').value;
  const err = document.getElementById('resetError');

  err.textContent = '';

  if (newPassword.length < 6) { err.textContent = 'Le mot de passe doit contenir au moins 6 caractères.'; return; }
  if (newPassword !== confirmPassword) { err.textContent = 'Les mots de passe ne correspondent pas.'; return; }

  const users = getUsers();
  const user = users.find(u => u.email === resetUserEmail);
  if (!user) { err.textContent = 'Erreur : utilisateur non trouvé.'; return; }

  // Update password
  user.password = newPassword;
  saveUsers(users);

  // Show success and redirect
  err.textContent = '';
  document.getElementById('resetForm').style.display = 'none';
  const successMsg = document.createElement('p');
  successMsg.style.cssText = 'text-align:center; color:#27ae60; font-size:0.9rem; line-height:1.5;';
  successMsg.innerHTML = '✓ Votre mot de passe a été réinitialisé avec succès.<br><br>Redirection...';
  document.getElementById('resetForm').parentElement.appendChild(successMsg);

  setTimeout(() => {
    resetUserEmail = '';
    showLogin();
    document.getElementById('forgotForm').reset();
    document.getElementById('resetForm').reset();
    document.getElementById('resetForm').style.display = '';
    successMsg.remove();
  }, 2000);
});
