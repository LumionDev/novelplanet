const express = require('express');
const app = express();
const port = 3000;
app.use(express.static('public'));

const nunjucks = require('nunjucks');
const fs = require('fs');

nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

const data = JSON.parse(fs.readFileSync('./data/content.json', 'utf-8'));

const html = nunjucks.render('index.njk', { items: data });

fs.writeFileSync('./public/index.html', html);

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
