require('dotenv').config();
const express = require('express');
const fs = require('fs');
const sass = require('sass');
const nunjucks = require('nunjucks');
const app = express();
const port = process.env.PORT;
const cookieParser = require('cookie-parser');  

app.use(cookieParser());

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

// Маршрут для главной страницы
app.get('/', (req, res, next) => {
  const currentTheme = req.cookies.theme || null;

  const dataPath = `./data/index.json`;
  let items = null;

  if (fs.existsSync(dataPath)) {
    items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  res.render('index.njk', { items, currentTheme });
});

// Маршрут для других страниц
app.get('/:page', (req, res, next) => {
  const page = req.params.page || 'index';

  if (!fs.existsSync(`./templates/${page}.njk`)) {
    const err = new Error('Страница не найдена');
    err.status = 404;
    return next(err);
  }

  const dataPath = `./data/${page}.json`;
  let items = null;

  if (fs.existsSync(dataPath)) {
    items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  const currentTheme = req.cookies.theme || null;
  res.render(`${page}.njk`, { items, currentTheme });
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
  let picture = '/media/errors/error.png';

  if (status === 404) {
    message = 'Страница не найдена';
    picture = '/media/errors/404.png';
  }

  if (status === 401) {
    message = 'Требуется авторизация';
    picture = '/media/errors/401.png';
  }

  if (status === 402) {
    message = 'Платёж необходим';
    picture = '/media/errors/402.png';
  }

  const currentTheme = req.cookies.theme || null;

  res.status(status).render('error.njk', {
    status,
    message,
    picture,
    currentTheme
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
