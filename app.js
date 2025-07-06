require('dotenv').config();
const express = require('express');
const fs = require('fs');
const sass = require('sass');
const nunjucks = require('nunjucks');
const app = express();
const port = process.env.PORT;

app.use(express.static('public'));

const result = sass.compile('./scss/style.scss');
fs.writeFileSync('./public/style.css', result.css);

nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

app.get('/', (req, res) => {
  const index = JSON.parse(fs.readFileSync('./data/index.json', 'utf-8'));
  res.send(nunjucks.render('index.njk', { items: index }));
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
