/* ===========================
   YŪGA Chatbot
=========================== */

const YUGA_KB = [
  // Products
  { keys: ['mira','miroir','mirror'], answer: 'YŪGA Mira est un miroir organique façonné à la main en corde de jute naturelle. Diamètre : 80 cm environ. Prix : 149 DT (au lieu de 179 DT, -17%). Vous pouvez le commander sur notre page produits.' },
  { keys: ['sahra','suspension','lampe','lustre'], answer: 'YŪGA Sahra est une suspension artisanale en jute naturel aux longues franges aériennes. Diamètre : 50 cm, hauteur : 45 cm. Prix : 139 DT. Parfaite pour un salon, une salle à manger ou une terrasse couverte.' },
  { keys: ['prix','coût','combien','tarif'], answer: 'Nos prix : YŪGA Mira à 149 DT (promo -17%) et YŪGA Sahra à 139 DT. La livraison est de 9 DT, gratuite dès 199 DT d\'achat.' },
  { keys: ['produit','collection','catalogue'], answer: 'Nous proposons actuellement deux pièces signature : le miroir YŪGA Mira (149 DT) et la suspension YŪGA Sahra (139 DT). Découvrez-les sur notre page produits.' },

  // Delivery
  { keys: ['livraison','délai','expédition','quand'], answer: 'Nous livrons partout en Tunisie en 2 à 5 jours ouvrables. Les frais de livraison sont de 9 DT. La livraison est offerte dès 199 DT d\'achat. Chaque colis est soigneusement emballé pour protéger votre création.' },
  { keys: ['paiement','payer','cash','espèce'], answer: 'Le paiement se fait à la livraison, en espèces. Aucun paiement en ligne n\'est requis — vous payez uniquement à la réception de votre colis.' },
  { keys: ['retour','remboursement','échange'], answer: 'Si vous n\'êtes pas satisfait, contactez-nous dans les 48h suivant la réception. Les retours sont acceptés uniquement pour les produits défectueux ou endommagés lors du transport.' },
  { keys: ['tunisie','wilaya','gouvernorat','région'], answer: 'Oui, nous livrons sur l\'ensemble du territoire tunisien, dans tous les gouvernorats, de Tunis à Tataouine.' },

  // Brand
  { keys: ['yuga','marque','brand','qui'], answer: 'YŪGA est une marque tunisienne spécialisée dans la création de pièces décoratives artisanales. Chaque création naît de la rencontre entre matières naturelles, gestes artisanaux et design intemporel.' },
  { keys: ['artisan','main','fabrication','comment'], answer: 'Chaque pièce YŪGA est réalisée entièrement à la main par des artisans sélectionnés. De légères variations peuvent apparaître d\'une pièce à l\'autre — c\'est la marque d\'une vraie création artisanale.' },
  { keys: ['matière','matériau','jute','bois','naturel'], answer: 'Nous utilisons des matières naturelles sélectionnées : corde de jute naturelle, structures en bois ou en métal. Ces matériaux sont choisis pour leur beauté et leur durabilité.' },
  { keys: ['entretien','nettoyer','nettoyage','laver'], answer: 'Pour entretenir vos créations YŪGA : dépoussiérez régulièrement avec un chiffon doux ou une brosse souple. Évitez l\'humidité excessive. Aucun lavage nécessaire.' },
  { keys: ['unique','variation','identique'], answer: 'Non, chaque pièce est unique. Les légères variations de texture, de forme ou de finition font partie du caractère artisanal et témoignent du travail manuel. C\'est ce qui rend chaque création YŪGA spéciale.' },

  // Social
  { keys: ['instagram','insta','facebook','réseaux'], answer: 'Retrouvez-nous sur Instagram et Facebook : @yuga.universe — Suivez-nous pour découvrir nos nouvelles créations, conseils déco et offres exclusives.' },
  { keys: ['contact','joindre','appeler','numéro'], answer: 'Pour nous contacter, retrouvez-nous sur Instagram ou Facebook : @yuga.universe. Vous pouvez aussi nous écrire via la section contact de notre site.' },

  // Order
  { keys: ['commander','commande','acheter','achat'], answer: 'Pour passer une commande, ajoutez le produit souhaité à votre panier via le bouton panier sur chaque produit, puis cliquez sur "Passer la commande" pour remplir vos coordonnées. C\'est simple et rapide !' },
  { keys: ['panier','cart'], answer: 'Votre panier est accessible via l\'icône en haut à droite. Vous pouvez y ajouter vos produits et passer commande quand vous le souhaitez.' },
  { keys: ['annuler','annulation'], answer: 'Vous pouvez annuler votre commande depuis la section "Ma commande" accessible via la notification dans votre barre de navigation, tant que la commande n\'a pas été livrée.' },

  // Greetings
  { keys: ['bonjour','salut','hello','bonsoir','salam'], answer: 'Bonjour ! Bienvenue chez YŪGA. Comment puis-je vous aider ? Vous pouvez me poser des questions sur nos produits, la livraison, la marque ou les commandes.' },
  { keys: ['merci','thanks'], answer: 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions. Bonne visite sur YŪGA ✦' },
  { keys: ['aide','help','question'], answer: 'Je suis là pour vous aider ! Voici ce que je peux vous renseigner : nos produits et prix, la livraison, les matériaux, l\'entretien, comment commander, ou encore la marque YŪGA.' },
];

function yugaAnswer(input) {
  const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const item of YUGA_KB) {
    if (item.keys.some(k => q.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return item.answer;
    }
  }
  return 'Je n\'ai pas bien compris votre question. Vous pouvez me demander des infos sur nos produits, les prix, la livraison, les matériaux ou comment passer commande. Ou contactez-nous sur Instagram @yuga.universe.';
}

/* Build the chatbot UI */
(function() {
  const html = `
    <div class="yuga-chat" id="yugaChat">
      <button class="yuga-chat__btn" id="yugaChatBtn" aria-label="Chat YŪGA">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <span class="yuga-chat__unread" id="chatUnread"></span>
      </button>
      <div class="yuga-chat__panel" id="yugaChatPanel">
        <div class="yuga-chat__head">
          <div class="yuga-chat__head-info">
            <div class="yuga-chat__avatar">Y</div>
            <div>
              <p class="yuga-chat__name">YŪGA Assistant</p>
              <p class="yuga-chat__status">En ligne</p>
            </div>
          </div>
          <button class="yuga-chat__close" id="yugaChatClose">✕</button>
        </div>
        <div class="yuga-chat__messages" id="yugaChatMessages"></div>
        <div class="yuga-chat__suggestions" id="chatSuggestions">
          <button onclick="chatAsk('Livraison')">Livraison</button>
          <button onclick="chatAsk('Prix')">Prix</button>
          <button onclick="chatAsk('Produits')">Produits</button>
          <button onclick="chatAsk('Commander')">Commander</button>
        </div>
        <form class="yuga-chat__form" id="yugaChatForm">
          <input type="text" id="yugaChatInput" placeholder="Posez votre question..." autocomplete="off" />
          <button type="submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  const panel = document.getElementById('yugaChatPanel');
  const messages = document.getElementById('yugaChatMessages');
  const input = document.getElementById('yugaChatInput');
  const unread = document.getElementById('chatUnread');

  function addMsg(text, sender) {
    const div = document.createElement('div');
    div.className = 'yuga-msg yuga-msg--' + sender;
    div.innerHTML = `<div class="yuga-msg__bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'yuga-msg yuga-msg--bot';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="yuga-msg__bubble yuga-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    input.value = '';
    showTyping();
    setTimeout(() => {
      removeTyping();
      addMsg(yugaAnswer(text), 'bot');
    }, 700);
  }

  window.chatAsk = function(text) { sendMessage(text); };

  document.getElementById('yugaChatForm').addEventListener('submit', e => {
    e.preventDefault();
    sendMessage(input.value);
  });

  document.getElementById('yugaChatBtn').addEventListener('click', () => {
    panel.classList.toggle('open');
    unread.style.display = 'none';
    if (panel.classList.contains('open') && messages.children.length === 0) {
      setTimeout(() => addMsg('Bonjour ! Bienvenue chez YŪGA ✦ Je suis votre assistant. Comment puis-je vous aider ?', 'bot'), 300);
    }
  });

  document.getElementById('yugaChatClose').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  // Show unread dot after 3s if not opened
  setTimeout(() => {
    if (!panel.classList.contains('open')) unread.style.display = 'block';
  }, 3000);
})();
