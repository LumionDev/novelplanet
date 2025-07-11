require('dotenv').config();
const express = require('express');
const fs = require('fs');
const sass = require('sass');
const nunjucks = require('nunjucks');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const cookieParser = require('cookie-parser');
const mobileDetect = require('mobile-detect');
const app = express();
const port = process.env.PORT || 3000;

// Cookie parser
app.use(cookieParser());

// i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'ru',
    preload: ['ru', 'en'],
    backend: {
      loadPath: __dirname + '/locales/{{lng}}.json'
    },
    detection: {
      order: ['cookie', 'querystring', 'header'],
      caches: ['cookie']
    }
  });

app.use(i18nextMiddleware.handle(i18next));

// Middleware: безопасный язык и направление текста
app.use((req, res, next) => {
  const rawLang = req.language;
  const isValidLang = typeof rawLang === 'string' && /^[a-z]{2}(-[A-Z]{2})?$/.test(rawLang);
  const safeLang = isValidLang ? rawLang : i18next.options.fallbackLng;

  res.locals.lng = safeLang;

  try {
    res.locals.dir = i18next.dir(safeLang);
  } catch {
    res.locals.dir = 'ltr';
  }

  next();
});

// SCSS компиляция
const result = sass.compile('./scss/style.scss');
fs.writeFileSync('./public/style.css', result.css);

// Nunjucks
nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

// Статика
app.use(express.static('public'));

// Middleware для темы
app.use((req, res, next) => {
  res.locals.currentTheme = req.cookies?.theme || null;
  next();
});

// Главная
app.get('/', (req, res) => {

  res.render('index.njk', {
    t: req.t,
    lng: res.locals.lng,
    dir: res.locals.dir,
    currentTheme: res.locals.currentTheme,
  });
});

// Установка языка
app.get('/set-lang/:lang', (req, res) => {
  const lang = req.params.lang;
  const isValidLang = typeof lang === 'string' && /^[a-z]{2}(-[A-Z]{2})?$/.test(lang);
  if (isValidLang) {
    res.cookie('i18next', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }
  const redirectTo = req.get('Referer') || '/';
  res.redirect(redirectTo);
});

// Переключение темы
app.get('/theme/:mode', (req, res) => {
  const mode = req.params.mode;
  res.cookie('theme', mode, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  const redirectTo = req.get('Referer') || '/';
  res.redirect(redirectTo);
});

// 404
app.use((req, res, next) => {
  const err = new Error(req.t('error_not_found'));
  err.status = 404;
  next(err);
});

// Конфигурация статусов
const errorConfig = {
  401: {
    messageKey: 'error_unauthorized',
    defaultMessage: 'Требуется авторизация',
    image: '/media/errors/401.png'
  },
  402: {
    messageKey: 'error_payment_required',
    defaultMessage: 'Платёж необходим',
    image: '/media/errors/402.png'
  },
  404: {
    messageKey: 'error_not_found',
    defaultMessage: 'Страница не найдена',
    image: '/media/errors/404.png'
  },
  500: {
    messageKey: 'error_server',
    defaultMessage: 'Ошибка сервера',
    image: '/media/errors/error.png'
  }
};

// Обработчик ошибок
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const config = errorConfig[status] || errorConfig[500];
  const t = typeof req.t === 'function' ? req.t : (key) => key;

  const message = t(config.messageKey) || config.defaultMessage;
  const picture = config.image;

  res.status(status).render('error.njk', {
    status,
    message,
    picture,
    currentTheme: res.locals.currentTheme,
    t,
    lng: res.locals.lng,
    dir: res.locals.dir
  });
});


app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Сервер доступен`);
});