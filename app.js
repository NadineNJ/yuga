/* ===========================
   YŪGA — app.js
=========================== */

/* --- Cart (loaded first, before anything else) --- */
let cart = JSON.parse(localStorage.getItem('yuga_cart') || '[]');

function saveCart() {
  localStorage.setItem('yuga_cart', JSON.stringify(cart));
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cart.length > 0 ? cart.length : '0';
  });
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const el = document.getElementById('cartTotal');
  if (el) el.textContent = total.toFixed(2) + ' DT';
}

const productImgs = {
  'YŪGA Mira':  'https://cdn.converty.shop/images/0174ec9a3f047214f8dd77beafe339117ebfd12a40777a5662136176855aa909_lg.webp',
  'YŪGA Sahra': 'https://cdn.converty.shop/images/b9d2a38a07e9d9c880fcb152dcf154a3df0094820544f443d1bacba5bae0aa7c_lg.webp',
};

function renderCart() {
  const body = document.getElementById('cartBody');
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-drawer__empty">Votre panier est vide.</p>';
    return;
  }
  body.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img class="cart-item__img" src="${productImgs[item.name] || ''}" alt="${item.name}" />
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">${item.price}.00 DT</p>
      </div>
      <button class="cart-item__remove" data-index="${i}" aria-label="Supprimer">✕</button>
    </div>
  `).join('');
  body.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(+btn.dataset.index, 1);
      saveCart();
      renderCart();
      updateCartCount();
      updateCartTotal();
    });
  });
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Hide chatbot button so it doesn't overlap the cart footer on mobile
  const chatBtn = document.querySelector('.yuga-chat__btn');
  if (chatBtn) chatBtn.style.visibility = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // Restore chatbot button
  const chatBtn = document.querySelector('.yuga-chat__btn');
  if (chatBtn) chatBtn.style.visibility = '';
}

/* Restore count immediately on every page */
updateCartCount();
updateCartTotal();
renderCart();

/* --- Sticky Header --- */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* --- Reveal on Scroll --- */
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 }).observe(el);
});

/* --- FAQ Accordion --- */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq__item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* --- Cart Drawer Controls --- */
const navCart = document.querySelector('.nav__cart');
if (navCart) navCart.addEventListener('click', openCart);

const cartClose = document.getElementById('cartClose');
if (cartClose) cartClose.addEventListener('click', closeCart);

const cartOverlay = document.getElementById('cartOverlay');
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

/* --- Checkout Button --- */
const checkoutBtn = document.querySelector('.cart-drawer__checkout');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Ajoutez un produit avant de continuer.');
      const onProductsPage = window.location.pathname.includes('produits');
      if (!onProductsPage) {
        setTimeout(() => { window.location.href = 'produits.html'; }, 500);
      }
      return;
    }
    window.location.href = 'commande.html';
  });
}

/* --- Add to Cart Buttons --- */
const cartImgAlt = {
  'YŪGA Mira':  'https://cdn.converty.shop/images/878f57eb6fa7b9c553f9eef1b493ffb7332fde88f9d4797acfe58a1b9cbe8863_sm.webp',
  'YŪGA Sahra': 'https://cdn.converty.shop/images/462fcab3d787516362d97844b8db56fd62449f9e20bc3bbf239efb8167f00e89_sm.webp',
};

document.querySelectorAll('.product-card__cart-btn').forEach(btn => {
  const wrap = btn.closest('.product-card__img-wrap');
  const slider = wrap?.querySelector('.product-card__slider');
  const firstImg = slider ? slider.querySelector('.product-card__img.active') : wrap?.querySelector('.product-card__img');
  const name = btn.dataset.product;

  function swapIn() {
    if (firstImg && cartImgAlt[name]) firstImg.src = cartImgAlt[name];
  }
  function swapOut() {
    const orig = { 'YŪGA Mira': productImgs['YŪGA Mira'], 'YŪGA Sahra': productImgs['YŪGA Sahra'] };
    if (firstImg && orig[name]) firstImg.src = orig[name];
  }

  btn.addEventListener('mouseenter', swapIn);
  btn.addEventListener('mouseleave', swapOut);
  btn.addEventListener('touchstart', swapIn, { passive: true });
  btn.addEventListener('touchend', swapOut);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const price = parseInt(btn.dataset.price);
    if (!name || !price) return;
    cart.push({ name, price });
    saveCart();
    renderCart();
    updateCartCount();
    updateCartTotal();
    showToast(name + ' ajouté au panier ✦');
    openCart();
  });
  btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
});

/* --- Toast --- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* --- Newsletter Form --- */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const note = document.getElementById('newsletterNote');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      e.preventDefault();
      note.textContent = 'Veuillez entrer une adresse e-mail valide.';
      note.style.color = '#e74c3c';
      emailInput.style.borderColor = '#e74c3c';
      setTimeout(() => {
        note.textContent = '';
        emailInput.style.borderColor = '';
      }, 3000);
      return;
    }

    note.textContent = 'Merci ! Vous serez informé(e) de nos nouveautés.';
    note.style.color = 'var(--clay)';
  });
}

/* --- Product Image Sliders --- */
document.querySelectorAll('.product-card__slider').forEach(slider => {
  const imgs = slider.querySelectorAll('.product-card__img');
  const dotsWrap = slider.closest('.product-card__img-wrap').querySelector('.product-card__dots');
  const dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];
  let current = 0;
  let autoTimer = null;

  function goTo(n) {
    imgs[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (n + imgs.length) % imgs.length;
    imgs[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAuto() {
    if (autoTimer) return;
    autoTimer = setInterval(() => goTo(current + 1), 700);
  }

  function resetSlider() {
    clearInterval(autoTimer);
    autoTimer = null;
    goTo(0);
  }

  const wrap = slider.closest('.product-card__img-wrap');
  wrap.addEventListener('mouseenter', () => { startAuto(); });
  wrap.addEventListener('mouseleave', () => { resetSlider(); });
  wrap.addEventListener('touchstart', (e) => { if (!e.target.closest('.product-card__cart-btn')) startAuto(); }, { passive: true });
  wrap.addEventListener('touchend', (e) => { if (!e.target.closest('.product-card__cart-btn')) resetSlider(); });
  wrap.addEventListener('touchcancel', resetSlider);

  dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
    e.stopPropagation(); resetSlider(); goTo(i);
  }));
});

/* --- Smooth scroll --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* --- Notifications --- */
function checkNotifs() {
  const notifDot = document.getElementById('notifDot');
  const notifList = document.getElementById('notifList');
  if (!notifDot) return;

  const orders = JSON.parse(localStorage.getItem('yuga_orders') || '[]');
  const seen = JSON.parse(localStorage.getItem('yuga_notifs_seen') || '[]');
  const notifs = [];

  orders.forEach(o => {
    if ((o.status === 'Confirmée' || o.status === 'Livrée') && !seen.includes(o.id + '_' + o.status)) {
      notifs.push({
        id: o.id,
        status: o.status,
        key: o.id + '_' + o.status,
        text: o.status === 'Confirmée'
          ? `Votre commande ${o.id} a été confirmée !`
          : `Votre commande ${o.id} a été livrée !`,
        date: o.date || ''
      });
    }
  });

  // Show/hide red dot
  const dot = document.getElementById('notifDot');
  if (dot) {
    if (notifs.length > 0) dot.classList.add('visible');
    else dot.classList.remove('visible');
  }

  // Render list
  if (notifList) {
    notifList.innerHTML = notifs.length > 0
      ? notifs.map(n => `
          <div class="notif-item" onclick="window.location.href='ma-commande.html?id=${n.id}'" style="cursor:pointer">
            <div class="notif-item__icon">${n.status === 'Livrée' ? '✓' : '✦'}</div>
            <div class="notif-item__text">
              <p>${n.text}</p>
              <span>${n.date}</span>
            </div>
          </div>`).join('')
      : '';
  }
}

// Toggle popup
const navNotif = document.getElementById('navNotif');
if (navNotif) {
  navNotif.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notifPopup').classList.toggle('open');
  });
}

// Clear notifications
const notifClear = document.getElementById('notifClear');
if (notifClear) {
  notifClear.addEventListener('click', (e) => {
    e.stopPropagation();
    const orders = JSON.parse(localStorage.getItem('yuga_orders') || '[]');
    const seen = orders
      .filter(o => o.status === 'Confirmée' || o.status === 'Livrée')
      .map(o => o.id + '_' + o.status);
    localStorage.setItem('yuga_notifs_seen', JSON.stringify(seen));
    document.getElementById('notifDot').style.display = 'none';
    document.getElementById('notifList').innerHTML = '<p class="notif-empty">Aucune nouvelle notification.</p>';
    document.getElementById('notifPopup').classList.remove('open');
  });
}

// Close popup when clicking outside
document.addEventListener('click', () => {
  const popup = document.getElementById('notifPopup');
  if (popup) popup.classList.remove('open');
});

// Check on load
checkNotifs();
// Poll every 10 seconds in case admin confirms while page is open
setInterval(checkNotifs, 10000);

/* --- Cookie Banner --- */
(function() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (localStorage.getItem('yuga_cookies')) return;
  setTimeout(() => banner.classList.add('show'), 800);

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('yuga_cookies', 'accepted');
    banner.classList.remove('show');
  });
  document.getElementById('cookieDecline')?.addEventListener('click', () => {
    localStorage.setItem('yuga_cookies', 'declined');
    banner.classList.remove('show');
  });
})();

/* --- Contact Form (EmailJS) --- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('contactNote');
    const btn = document.getElementById('contactSubmit');
    const email = document.getElementById('contact_email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.value.trim())) {
      note.textContent = 'Veuillez entrer une adresse e-mail valide.';
      note.style.color = '#e74c3c';
      email.style.borderColor = '#e74c3c';
      setTimeout(() => { note.textContent = ''; email.style.borderColor = ''; }, 3000);
      return;
    }

    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    emailjs.send(YUGA_CONFIG.emailjs.serviceId, YUGA_CONFIG.emailjs.templateId, {
      from_name:  document.getElementById('contact_name').value,
      from_email: email.value,
      message:    document.getElementById('contact_message').value,
      name:       document.getElementById('contact_name').value,
      email:      email.value,
    })
    .then((res) => {
      console.log('EmailJS success:', res);
      note.textContent = 'Message envoyé avec succès. Nous vous répondrons bientôt ✦';
      note.style.color = '#c4a882';
      contactForm.reset();
      btn.textContent = 'Envoyer le message';
      btn.disabled = false;
    })
    .catch((err) => {
      console.error('EmailJS error:', JSON.stringify(err));
      note.textContent = 'Erreur ' + (err.status || '') + ': ' + (err.text || JSON.stringify(err));
      note.style.color = '#e74c3c';
      btn.textContent = 'Envoyer le message';
      btn.disabled = false;
    });
  });
}
