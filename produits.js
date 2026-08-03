/* produits.js */

/* Cart drawer checkout button — requires at least one item */
document.querySelector('.cart-drawer__checkout').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Ajoutez un produit avant de continuer.');
    setTimeout(() => { closeCart(); }, 500);
    return;
  }
  window.location.href = 'commande.html';
});
