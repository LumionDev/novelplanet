require('dotenv').config();
const express = require('express');
const fs = require('fs');
const sass = require('sass');
const nunjucks = require('nunjucks');
const app = express();
const port = process.env.PORT;

// Даем браузеру доступ к папке
app.use(express.static('public'));

// Компиляция SCSS
const result = sass.compile('./scss/style.scss');
fs.writeFileSync('./public/style.css', result.css);

// Настройка Nunjucks
nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

// Главная страница
app.get('/', (req, res) => {
  const index = JSON.parse(fs.readFileSync('./data/index.json', 'utf-8'));
  res.send(nunjucks.render('index.njk', { items: index }));
});

// Ловим ошибку 404 и передаем ее в обработчик ошибок
app.use((req, res, next) => {
  const err = new Error('Страница не найдена');
  err.status = 404;
  next(err);
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  const status = err.status || 500;
  let message = 'Ошибка сервера';

  if (status === 404) message = 'Страница не найдена';
  if (status === 401) message = 'Требуется авторизация';
  if (status === 402) message = 'Платёж необходим';

  res.status(status).render('error.njk', {
    status,
    message: message || err.message
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
