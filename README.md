# YŪGA — Artisan Home Decor

A full e-commerce website for YŪGA, a Tunisian handmade artisan home decor brand. Built with pure HTML, CSS and JavaScript 

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Homepage — hero, products, story, FAQ, contact |
| `produits.html` | All products page |
| `commande.html` | Checkout / order form |
| `ma-commande.html` | Order tracking page (client) |
| `admin.html` | Admin dashboard (password protected) |
| `termes.html` | Terms & Conditions |
| `confidentialite.html` | Privacy Policy |

---

## Features

### Client side
- Responsive design with natural artisan aesthetic
- Product cards with image slider on hover
- Cart drawer with localStorage persistence across pages
- Checkout form with full input validation (letters only for names, digits for phone)
- Order confirmation with success overlay
- Cookie consent banner
- Contact form powered by **EmailJS**
- AI chatbot with YŪGA brand knowledge (no API key needed)
- Notification bell — alerts client when order is confirmed

### Admin side
- Password protected dashboard (`admin.html`)
- Stats: total orders, revenue, pending, delivered
- Orders table with search, filter by status, and status management
- Order detail modal with status change buttons
- Delete orders with custom confirmation dialog
- Product catalog with stock management and active/inactive toggle

---

## Configuration

### EmailJS (Contact form)
Replace the placeholders in `index.html` and `app.js`:

```js
// index.html
emailjs.init('YOUR_PUBLIC_KEY');

// app.js
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { ... })
```

Get your keys at [emailjs.com](https://www.emailjs.com) — free up to 200 emails/month.


---

## Data Storage

All data (cart, orders, stock, notifications) is stored in **localStorage** — meaning it's browser-local. To share data across devices, a backend (e.g. Firebase) would be needed.



---

## Social

- Instagram: [@yuga.universe](https://www.instagram.com/yuga.universe)
- Facebook: [yuga.universe](https://www.facebook.com/yuga.universe)

---

## License

© 2026 YŪGA. All rights reserved.
