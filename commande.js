/* commande.js */

const productImgsLocal = {
  'YŪGA Mira':  'https://cdn.converty.shop/images/0174ec9a3f047214f8dd77beafe339117ebfd12a40777a5662136176855aa909_lg.webp',
  'YŪGA Sahra': 'https://cdn.converty.shop/images/b9d2a38a07e9d9c880fcb152dcf154a3df0094820544f443d1bacba5bae0aa7c_lg.webp',
};

function renderSummary() {
  const items = document.getElementById('summaryItems');
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const totalEl = document.getElementById('summaryTotal');
  if (!items) return;

  if (!cart || cart.length === 0) {
    items.innerHTML = '<p class="summary-empty">Votre panier est vide.</p>';
    subtotalEl.textContent = '0.00 DT';
    shippingEl.textContent = '9.00 DT';
    totalEl.textContent = '9.00 DT';
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const shipping = subtotal >= 199 ? 0 : 9;
  const total = subtotal + shipping;

  items.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img class="summary-item__img" src="${productImgsLocal[item.name] || ''}" alt="${item.name}" />
      <div class="summary-item__info">
        <p class="summary-item__name">${item.name}</p>
        <p class="summary-item__price">${item.price}.00 DT</p>
      </div>
    </div>
  `).join('');

  subtotalEl.textContent = subtotal.toFixed(2) + ' DT';
  shippingEl.textContent = shipping === 0 ? 'Gratuite' : shipping.toFixed(2) + ' DT';
  totalEl.textContent = total.toFixed(2) + ' DT';
}

renderSummary();

/* Form submit — save order to localStorage */
document.getElementById('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  const lettersOnly = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  const phoneOnly   = /^[\d\s\+\-\(\)]{8,15}$/;
  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = [
    { field: form.prenom,     test: v => lettersOnly.test(v),  msg: 'Le prénom ne doit contenir que des lettres.' },
    { field: form.nom,        test: v => lettersOnly.test(v),  msg: 'Le nom ne doit contenir que des lettres.' },
    { field: form.telephone,  test: v => phoneOnly.test(v),    msg: 'Le téléphone doit contenir uniquement des chiffres (8 à 15 chiffres).' },
    { field: form.adresse,    test: v => v.length >= 5,        msg: 'Veuillez entrer une adresse complète.' },
    { field: form.ville,      test: v => lettersOnly.test(v),  msg: 'La ville ne doit contenir que des lettres.' },
    { field: form.gouvernorat,test: v => v !== '',              msg: 'Veuillez choisir un gouvernorat.' },
  ];

  // Optional email validation
  if (form.email.value.trim()) {
    rules.push({ field: form.email, test: v => emailRegex.test(v), msg: 'Veuillez entrer un e-mail valide.' });
  }

  // Reset all borders
  rules.forEach(r => r.field.style.borderColor = '');

  let firstError = null;
  for (const rule of rules) {
    const val = rule.field.value.trim();
    if (!rule.test(val)) {
      rule.field.style.borderColor = '#c0392b';
      if (!firstError) firstError = rule.msg;
    }
  }

  if (firstError) {
    showToast(firstError);
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const shipping = subtotal >= 199 ? 0 : 9;

  const order = {
    id: 'CMD-' + Date.now(),
    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'En attente',
    customer: {
      prenom: form.prenom.value.trim(),
      nom: form.nom.value.trim(),
      telephone: form.telephone.value.trim(),
      email: form.email.value.trim(),
      adresse: form.adresse.value.trim(),
      ville: form.ville.value.trim(),
      gouvernorat: form.gouvernorat.value,
      notes: form.notes.value.trim(),
    },
    products: [...cart],
    subtotal,
    shipping,
    total: subtotal + shipping,
  };

  const orders = JSON.parse(localStorage.getItem('yuga_orders') || '[]');
  orders.push(order);
  localStorage.setItem('yuga_orders', JSON.stringify(orders));

  cart = [];
  saveCart();
  updateCartCount();

  document.getElementById('orderSuccess').classList.add('show');
});
