// Чтение куки по ключу
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const c of cookies) {
    const [key, value] = c.split('=');
    if (key === name) return value;
  }
  return null;
}

// Установка куки
function setCookie(name, value, days = 365) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// Удаление куки
function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// Применение темы
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Системная тема
function applySystemTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!getCookie('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function updateDeviceView() {
  const device = window.innerWidth <= 1024 ? 'mobile' : 'desktop';

  const navPhone = document.getElementById('nav-phone');
  const navModalPhone = document.getElementById('nav-modal-phone');

  if (device === 'mobile') {
    navPhone?.classList.add('visible');
  } else {
    navPhone?.classList.remove('visible');
    navModalPhone?.classList.remove('active');
  }
};

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
  // Инициализация при загрузке страницы
  updateDeviceView();

  const theme = getCookie('theme');
  theme ? applyTheme(theme) : applySystemTheme();

  // Прелоадер
  const loader = document.getElementById('preloader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.classList.add('hidden'), 200);
    setTimeout(() => loader.remove(), 400);
  }

  // Языковой модал
  const logo = document.getElementById('language-icon');
  const modal = document.getElementById('language-modal');
  if (logo && modal) {
    logo.addEventListener('click', () => {
      modal.classList.toggle('visible');
    });
  }

  // Индикаторы языка
  const links = document.querySelectorAll('.language-link');
  const indicators = document.querySelectorAll('.language-indicator');

  const currentLang =
    window.location.pathname.includes('/set-lang/ru') ? 'ru' :
    window.location.pathname.includes('/set-lang/en') ? 'en' :
    document.documentElement.lang || 'ru';

  links.forEach((link, i) => {
    const lang = link.getAttribute('href').split('/').pop();
    if (indicators[i]) {
      indicators[i].classList.toggle('active', lang === currentLang);
    }
  });

  const menu = document.getElementById('nav-menu');
  const modal_phone = document.getElementById('nav-modal-phone');

  if (menu && modal_phone) {
    menu.addEventListener('click', () => {
        console.log('📲 Клик по меню!');
        document.body.classList.toggle('body-lock');
        modal_phone.classList.toggle('active');
    });
  }
});

// Обработчики темы
[
  { ids: ['theme-light-phone', 'theme-light'], action: () => {
    setCookie('theme', 'light');
    applyTheme('light');
  }},
  { ids: ['theme-dark-phone', 'theme-dark'], action: () => {
    setCookie('theme', 'dark');
    applyTheme('dark');
  }},
  { ids: ['theme-system-phone', 'theme-system'], action: () => {
    deleteCookie('theme');
    applySystemTheme();
  }}
].forEach(({ ids, action }) => {
  ids.forEach(id => {
    const btn = document.getElementById(id);
    btn?.addEventListener('click', () => {
      action();
      location.reload();
    });
  });
});

// Обновление при изменении размера окна
window.addEventListener('resize', updateDeviceView);