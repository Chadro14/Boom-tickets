

```js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'boomticketssecret',
  resave: false,
  saveUninitialized: true,
}));

// Données en mémoire (à remplacer par DB dans un vrai projet)
let events = [];
let orders = [];

const ADMIN_CODE = '252006';
const ADMIN_WHATSAPP = '+243826491579';

// Middleware pour vérifier admin
function isAdmin(req, res, next) {

if (req.session.admin === ADMIN_CODE) next();
  else res.redirect('/admin/login');
}

// Routes

// Page d'accueil affichage événements
app.get('/', (req, res) => {
  res.render('index', { events, admin: req.session.admin, adminWhatsapp: ADMIN_WHATSAPP });
});

// Page connexion admin
app.get('/admin/login', (req, res) => {
  res.render('admin_login', { error: null });
});

app.post('/admin/login', (req, res) => {
  if (req.body.code === ADMIN_CODE) {
    req.session.admin = ADMIN_CODE;
    res.redirect('/admin');
  } else {
    res.render('admin_login', { error: 'Code admin incorrect' });
  }
});

// Page admin - ajout événements
app.get('/admin', isAdmin, (req, res) => {
  res.render('admin', { events });
});

app.post('/admin/event/add', isAdmin, (req, res) => {
  const { name, date, time, location, price } = req.body;
  if (!name || !date || !time || !location || !price) {
    return res.send('Tous les champs sont requis');
  }
  events.push({ id: Date.now(), name, date, time, location, price });
  res.redirect('/admin');
});

// Passer commande billet
app.post('/order', (req, res) => {
  const { eventId, quantity, buyerName } = req.body;
  const qty = parseInt(quantity);
  if (!eventId || !buyerName || !qty || qty < 1 || qty > 50) {
  return res.send('Informations invalides ou quantité hors limites (1-50)');
  }
  const event = events.find(e => e.id == eventId);
  if (!event) return res.send('Événement non trouvé');

  // Enregistrer commande
  const orderId = Date.now();
  orders.push({ orderId, event, quantity: qty, buyerName });

  res.redirect(`/order/ticket/orderId`);
);

// Générer ticket PDF
app.get('/order/ticket/:orderId', (req, res) => 
  const orderId = req.params.orderId;
  const order = orders.find(o => o.orderId == orderId);
  if (!order) return res.send('Commande non trouvée');

  const doc = new PDFDocument();
  res.setHeader('Content-disposition', `attachment; filename=ticket-{orderId}.pdf`);
  res.setHeader('Content-type', 'application/pdf');

  doc.fontSize(20).text('Ticket Boom-tickets', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Nom : order.buyerName`);
  doc.text(`Événement :{order.event.name}`);
  doc.text(`Date : order.event.date à{order.event.time}`);
  doc.text(`Lieu : order.event.location`);
  doc.text(`Quantité :{order.quantity}`);
  doc.text(`Prix unitaire : order.event.price FC`);
  doc.text(`Total :{order.quantity * order.event.price} FC`);
  doc.moveDown();
  doc.text('Merci pour votre achat !', { align: 'center' });

  doc.end();
  doc.pipe(res);
});
// Page d’évaluation
app.get('/evaluation', (req, res) => {
  res.render('evaluation');
});

app.post('/evaluation', (req, res) => {
  const { rating, comment } = req.body;
  // Pour simplifier, on ne stocke pas en base mais tu peux l'ajouter
  res.send(`Merci pour votre évaluation: Note rating, Commentaire:{comment}`);
});

// Logout admin
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---
  
