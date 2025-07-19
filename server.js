

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
