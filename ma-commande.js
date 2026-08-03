/* ma-commande.js */

const productImgsOrder = {
  'YŪGA Mira':  'https://cdn.converty.shop/images/0174ec9a3f047214f8dd77beafe339117ebfd12a40777a5662136176855aa909_lg.webp',
  'YŪGA Sahra': 'https://cdn.converty.shop/images/b9d2a38a07e9d9c880fcb152dcf154a3df0094820544f443d1bacba5bae0aa7c_lg.webp',
};

const statusMap = {
  'En attente': { cls: 'pending',   icon: '⏳', label: 'En attente de confirmation', msg: 'Votre commande est en cours de traitement.' },
  'Confirmée':  { cls: 'confirmed', icon: '✅', label: 'Commande confirmée',         msg: 'Votre commande a été confirmée. Nous préparons votre livraison.' },
  'Livrée':     { cls: 'delivered', icon: '📦', label: 'Commande livrée',            msg: 'Votre commande a été livrée. Merci pour votre confiance !' },
  'Annulée':    { cls: 'cancelled', icon: '❌', label: 'Commande annulée',           msg: 'Cette commande a été annulée.' },
  'Déclinée':   { cls: 'cancelled', icon: '🚫', label: 'Commande déclinée',          msg: 'Vous avez décliné cette commande.' },
};

const params  = new URLSearchParams(window.location.search);
const orderId = params.get('id');
const orders  = JSON.parse(localStorage.getItem('yuga_orders') || '[]');
const order   = orders.find(o => o.id === orderId);
const content = document.getElementById('orderContent');

if (!order) {
  content.innerHTML = `
    <div class="not-found">
      <h2>Commande introuvable</h2>
      <p>Cette commande n'existe pas ou a été supprimée.</p>
      <a href="index.html" class="btn btn--primary" style="margin-top:28px;display:inline-flex">Retour à l'accueil</a>
    </div>`;
} else {
  const s = statusMap[order.status] || statusMap['En attente'];
  const canDecline = order.status === 'Confirmée' || order.status === 'En attente';

  content.innerHTML = `
    <a href="index.html" class="order-page__back">← Retour à l'accueil</a>

    <div class="order-status-banner order-status-banner--${s.cls}">
      <div class="order-status-banner__icon">${s.icon}</div>
      <div class="order-status-banner__text">
        <h3>${s.label}</h3>
        <p>${s.msg}</p>
      </div>
    </div>

    <div class="order-box">
      <p class="order-box__title">Détails de la commande</p>
      <div class="order-detail-row"><span>Référence</span><span><strong>${order.id}</strong></span></div>
      <div class="order-detail-row"><span>Date</span><span>${order.date}</span></div>
      <div class="order-detail-row"><span>Statut</span><span>${s.label}</span></div>
    </div>

    <div class="order-box">
      <p class="order-box__title">Produits commandés</p>
      ${(order.products || []).map(p => `
        <div class="order-product-item">
          <img src="${productImgsOrder[p.name] || ''}" alt="${p.name}" />
          <div>
            <p class="order-product-item__name">${p.name}</p>
            <p class="order-product-item__price">${p.price}.00 DT</p>
          </div>
        </div>`).join('')}
    </div>

    <div class="order-box">
      <p class="order-box__title">Récapitulatif</p>
      <div class="order-detail-row"><span>Sous-total</span><span>${order.subtotal.toFixed(2)} DT</span></div>
      <div class="order-detail-row"><span>Livraison</span><span>${order.shipping === 0 ? 'Gratuite' : order.shipping + '.00 DT'}</span></div>
      <div class="order-detail-row order-detail-row--total"><span>Total</span><span>${order.total.toFixed(2)} DT</span></div>
    </div>

    <div class="order-box">
      <p class="order-box__title">Adresse de livraison</p>
      <div class="order-detail-row"><span>Nom</span><span>${order.customer.prenom} ${order.customer.nom}</span></div>
      <div class="order-detail-row"><span>Téléphone</span><span>${order.customer.telephone}</span></div>
      <div class="order-detail-row"><span>Adresse</span><span>${order.customer.adresse}</span></div>
      <div class="order-detail-row"><span>Ville</span><span>${order.customer.ville}, ${order.customer.gouvernorat}</span></div>
      ${order.customer.notes ? `<div class="order-detail-row"><span>Notes</span><span>${order.customer.notes}</span></div>` : ''}
    </div>

    ${canDecline ? `
    <div class="order-decline-section">
      <p>Vous souhaitez annuler cette commande ? Cliquez pour nous en informer.</p>
      <button class="btn--decline" id="declineBtn">Décliner la commande</button>
    </div>` : ''}
  `;

  document.getElementById('declineBtn')?.addEventListener('click', () => {
    document.getElementById('declineOverlay').classList.add('open');
  });
}

/* Decline dialog */
document.getElementById('declineOk').addEventListener('click', () => {
  const all = JSON.parse(localStorage.getItem('yuga_orders') || '[]');
  const o = all.find(o => o.id === orderId);
  if (o) { o.status = 'Déclinée'; localStorage.setItem('yuga_orders', JSON.stringify(all)); }
  document.getElementById('declineOverlay').classList.remove('open');
  showToast('Commande déclinée. Notre équipe a été informée.');
  setTimeout(() => location.reload(), 1500);
});

document.getElementById('declineCancel').addEventListener('click', () => {
  document.getElementById('declineOverlay').classList.remove('open');
});
document.getElementById('declineOverlay').addEventListener('click', e => {
  if (e.target.id === 'declineOverlay') document.getElementById('declineOverlay').classList.remove('open');
});
