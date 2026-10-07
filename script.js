// ============ Ссылки на элементы ============
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const geoBtn = document.getElementById('geo-btn');
const hint = document.getElementById('hint');
const unitsEl = document.getElementById('units');
const langEl = document.getElementById('lang');

const cityEl = document.getElementById('city');
const iconEl = document.getElementById('icon');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const feelsEl = document.getElementById('feels');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

const favBtn = document.getElementById('fav-btn');
const favoritesListEl = document.getElementById('favorites-list');

const hourlyListEl = document.getElementById('hourly-list');
const forecastListEl = document.getElementById('forecast-list');

// ============ Ключи localStorage ============
const STORAGE_KEYS = {
  city: 'weather.lastCity',
  unit: 'weather.unit',
  lang: 'weather.lang',
  favorites: 'weather.favorites',
};

// ============ Словари переводов ============
const translations = {
  ru: {
    'app.title': '🌤️ Погода',
    'search.placeholder': 'Введите город...',
    'search.button': 'Найти',
    'geo.button': '📍 Моё местоположение',
    'card.empty': 'Введите город',
    'detail.feels': 'Ощущается',
    'detail.humidity': 'Влажность',
    'detail.wind': 'Ветер',
    'fav.title': 'Избранные города',
    'fav.empty': 'Пока нет избранных городов',
    'fav.addTitle': 'Добавить в избранное',
    'hourly.title': 'Почасовой прогноз',
    'forecast.title': 'Прогноз на 5 дней',
    'hint.start': 'Введите город или нажмите «Моё местоположение»',
    'hint.loading': '⏳ Загружаем...',
    'hint.restore': '⏳ Загружаем последний город...',
    'hint.restored': '✅ Загружена последняя погода',
    'hint.updated': '✅ Данные обновлены',
    'hint.geoLoading': '📡 Определяем местоположение...',
    'hint.geoDone': '✅ Показана погода для вашего местоположения',
    'hint.emptyQuery': '⚠️ Введите название города',
    'hint.noNetwork': '🌐 Нет связи с API. Проверьте интернет или VPN.',
    'hint.cityNotFound': '🤷 Город не найден. Попробуйте другое название.',
    'hint.errorPrefix': '❌ Ошибка: ',
    'hint.geoDenied': '🚫 Вы запретили доступ к геолокации',
    'hint.geoUnavailable': '📡 Не удалось определить местоположение',
    'hint.geoTimeout': '⏱️ Превышено время ожидания',
    'hint.geoUnsupported': '❌ Геолокация не поддерживается браузером',
    'hint.geoError': '❌ Ошибка геолокации',
    'desc.clear': 'Ясно',
    'desc.mostlyClear': 'Преимущественно ясно',
    'desc.partlyCloudy': 'Переменная облачность',
    'desc.overcast': 'Пасмурно',
    'desc.fog': 'Туман',
    'desc.rime': 'Изморозь',
    'desc.lightDrizzle': 'Слабая морось',
    'desc.drizzle': 'Морось',
    'desc.heavyDrizzle': 'Сильная морось',
    'desc.lightRain': 'Небольшой дождь',
    'desc.rain': 'Дождь',
    'desc.heavyRain': 'Сильный дождь',
    'desc.lightSnow': 'Небольшой снег',
    'desc.snow': 'Снег',
    'desc.heavySnow': 'Сильный снег',
    'desc.showers': 'Ливень',
    'desc.heavyShowers': 'Сильный ливень',
    'desc.violentShowers': 'Очень сильный ливень',
    'desc.thunderstorm': 'Гроза',
    'desc.thunderstormHail': 'Гроза с градом',
    'desc.heavyThunderstormHail': 'Сильная гроза с градом',
    'desc.unknown': 'Неизвестно',
    'day.today': 'Сегодня',
    'day.now': 'Сейчас',
    'day.weekdays': ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  },
  en: {
    'app.title': '🌤️ Weather',
    'search.placeholder': 'Enter a city...',
    'search.button': 'Search',
    'geo.button': '📍 My location',
    'card.empty': 'Enter a city',
    'detail.feels': 'Feels like',
    'detail.humidity': 'Humidity',
    'detail.wind': 'Wind',
    'fav.title': 'Favorite cities',
    'fav.empty': 'No favorite cities yet',
    'fav.addTitle': 'Add to favorites',
    'hourly.title': 'Hourly forecast',
    'forecast.title': '5-day forecast',
    'hint.start': 'Enter a city or click "My location"',
    'hint.loading': '⏳ Loading...',
    'hint.restore': '⏳ Loading last city...',
    'hint.restored': '✅ Last weather loaded',
    'hint.updated': '✅ Data updated',
    'hint.geoLoading': '📡 Detecting location...',
    'hint.geoDone': '✅ Weather shown for your location',
    'hint.emptyQuery': '⚠️ Enter a city name',
    'hint.noNetwork': '🌐 Cannot reach API. Check internet or VPN.',
    'hint.cityNotFound': '🤷 City not found. Try another name.',
    'hint.errorPrefix': '❌ Error: ',
    'hint.geoDenied': '🚫 You denied geolocation access',
    'hint.geoUnavailable': '📡 Could not determine location',
    'hint.geoTimeout': '⏱️ Request timed out',
    'hint.geoUnsupported': '❌ Geolocation is not supported',
    'hint.geoError': '❌ Geolocation error',
    'desc.clear': 'Clear',
    'desc.mostlyClear': 'Mostly clear',
    'desc.partlyCloudy': 'Partly cloudy',
    'desc.overcast': 'Overcast',
    'desc.fog': 'Fog',
    'desc.rime': 'Rime',
    'desc.lightDrizzle': 'Light drizzle',
    'desc.drizzle': 'Drizzle',
    'desc.heavyDrizzle': 'Heavy drizzle',
    'desc.lightRain': 'Light rain',
    'desc.rain': 'Rain',
    'desc.heavyRain': 'Heavy rain',
    'desc.lightSnow': 'Light snow',
    'desc.snow': 'Snow',
    'desc.heavySnow': 'Heavy snow',
    'desc.showers': 'Showers',
    'desc.heavyShowers': 'Heavy showers',
    'desc.violentShowers': 'Violent showers',
    'desc.thunderstorm': 'Thunderstorm',
    'desc.thunderstormHail': 'Thunderstorm with hail',
    'desc.heavyThunderstormHail': 'Heavy thunderstorm with hail',
    'desc.unknown': 'Unknown',
    'day.today': 'Today',
    'day.now': 'Now',
    'day.weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
};

// ============ Состояние ============
let currentUnit = localStorage.getItem(STORAGE_KEYS.unit) || 'C';
let currentLang = localStorage.getItem(STORAGE_KEYS.lang) || detectLang();
let lastData = null;

function detectLang() {
  const nav = (navigator.language || 'ru').slice(0, 2).toLowerCase();
  return nav === 'en' ? 'en' : 'ru';
}

function t(key) {
  return translations[currentLang][key] ?? translations.ru[key] ?? key;
}

// ============ Применение переводов ============
function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  langEl.querySelectorAll('.lang__btn').forEach((b) => {
    b.classList.toggle('lang__btn--active', b.dataset.lang === currentLang);
  });

  document.title = t('app.title').replace(/^[^\p{L}]+/u, '').trim();
}

// ============ Словарь WMO-кодов ============
const weatherCodes = {
  0:  { key: 'desc.clear',                 icon: '☀️', group: 'clear' },
  1:  { key: 'desc.mostlyClear',           icon: '🌤️', group: 'clear' },
  2:  { key: 'desc.partlyCloudy',          icon: '⛅',  group: 'cloudy' },
  3:  { key: 'desc.overcast',              icon: '☁️', group: 'cloudy' },
  45: { key: 'desc.fog',                   icon: '🌫️', group: 'fog' },
  48: { key: 'desc.rime',                  icon: '🌫️', group: 'fog' },
  51: { key: 'desc.lightDrizzle',          icon: '🌦️', group: 'rain' },
  53: { key: 'desc.drizzle',               icon: '🌦️', group: 'rain' },
  55: { key: 'desc.heavyDrizzle',          icon: '🌧️', group: 'rain' },
  61: { key: 'desc.lightRain',             icon: '🌧️', group: 'rain' },
  63: { key: 'desc.rain',                  icon: '🌧️', group: 'rain' },
  65: { key: 'desc.heavyRain',             icon: '🌧️', group: 'rain' },
  71: { key: 'desc.lightSnow',             icon: '🌨️', group: 'snow' },
  73: { key: 'desc.snow',                  icon: '❄️', group: 'snow' },
  75: { key: 'desc.heavySnow',             icon: '❄️', group: 'snow' },
  80: { key: 'desc.showers',               icon: '🌦️', group: 'rain' },
  81: { key: 'desc.heavyShowers',          icon: '🌧️', group: 'rain' },
  82: { key: 'desc.violentShowers',        icon: '⛈️', group: 'rain' },
  95: { key: 'desc.thunderstorm',          icon: '⛈️', group: 'thunder' },
  96: { key: 'desc.thunderstormHail',      icon: '⛈️', group: 'thunder' },
  99: { key: 'desc.heavyThunderstormHail', icon: '⛈️', group: 'thunder' },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { key: 'desc.unknown', icon: '❓', group: 'cloudy' };
}

// ============================================================
// ==================== CANVAS-АНИМАЦИЯ ======================
// ============================================================
const canvas = document.getElementById('weather-scene');
const ctx = canvas.getContext('2d');

let animationId = null;      // id requestAnimationFrame
let currentScene = null;     // текущая группа сцены ('rain', 'snow'...)
let particles = [];          // массив частиц
let lightningTimer = 0;      // таймер до следующей вспышки
let lightningFlash = 0;      // текущая яркость вспышки (0..1)

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Фабрики частиц ---
function makeRaindrop() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    len: 10 + Math.random() * 12,
    speed: 6 + Math.random() * 6,
    opacity: 0.2 + Math.random() * 0.3,
    drift: 0.4 + Math.random() * 0.6, // лёгкий наклон
  };
}

function makeSnowflake() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1 + Math.random() * 2.5,
    speed: 0.6 + Math.random() * 1.4,
    sway: Math.random() * Math.PI * 2,   // начальная фаза
    swaySpeed: 0.005 + Math.random() * 0.01,
    opacity: 0.5 + Math.random() * 0.4,
  };
}

function makeCloud() {
  const W = window.innerWidth;
  return {
    x: Math.random() * W,
    y: 40 + Math.random() * (window.innerHeight * 0.4),
    r: 40 + Math.random() * 60,
    speed: 0.15 + Math.random() * 0.25,
    opacity: 0.05 + Math.random() * 0.08,
  };
}

function makeFogBlob() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: 80 + Math.random() * 120,
    speed: 0.1 + Math.random() * 0.2,
    opacity: 0.04 + Math.random() * 0.05,
  };
}

function makeStar() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return {
    x: Math.random() * W,
    y: Math.random() * H * 0.7,
    r: 0.4 + Math.random() * 1,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.01 + Math.random() * 0.03,
    opacity: 0.3 + Math.random() * 0.5,
  };
}

// --- Инициализация сцены по группе ---
function initScene(group, isDay) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  particles = [];
  lightningFlash = 0;

  if (group === 'clear') {
    if (!isDay) {
      // Ночью — звёзды
      for (let i = 0; i < 90; i++) particles.push(makeStar());
    }
    // Днём — пусто
  } else if (group === 'cloudy') {
    for (let i = 0; i < 6; i++) particles.push(makeCloud());
  } else if (group === 'fog') {
    for (let i = 0; i < 14; i++) particles.push(makeFogBlob());
  } else if (group === 'rain') {
    const count = Math.floor((W * H) / 12000);
    for (let i = 0; i < count; i++) particles.push(makeRaindrop());
    for (let i = 0; i < 3; i++) particles.push(makeCloud());
  } else if (group === 'snow') {
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) particles.push(makeSnowflake());
  } else if (group === 'thunder') {
    const count = Math.floor((W * H) / 10000);
    for (let i = 0; i < count; i++) particles.push(makeRaindrop());
    for (let i = 0; i < 4; i++) particles.push(makeCloud());
    lightningTimer = 120 + Math.random() * 240; // 2–6 секунд при 60 fps
  }

  currentScene = group;
}

// --- Отрисовка ---
function drawScene() {
  const W = window.innerWidth;
  const H = window.innerHeight;

  ctx.clearRect(0, 0, W, H);

  for (const p of particles) {
    // === Звёзды ===
    if (p.twinkle !== undefined && p.r < 2) {
      p.twinkle += p.twinkleSpeed;
      const tw = 0.6 + Math.sin(p.twinkle) * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * tw})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // === Снежинки ===
    if (p.sway !== undefined) {
      p.sway += p.swaySpeed;
      p.y += p.speed;
      p.x += Math.sin(p.sway) * 0.6;

      if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
      if (p.x > W + 5) p.x = -5;
      if (p.x < -5) p.x = W + 5;

      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // === Дождь ===
    if (p.len !== undefined) {
      p.y += p.speed;
      p.x += p.drift;

      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      if (p.x > W + 20) p.x = -20;

      ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.drift * 3, p.y - p.len);
      ctx.stroke();
      continue;
    }

    // === Облака ===
    if (p.r >= 40 && p.speed < 0.5 && p.swaySpeed === undefined && p.len === undefined && p.twinkle === undefined && p.sway === undefined) {
      p.x += p.speed;
      if (p.x - p.r > W) p.x = -p.r;

      // Радиальный градиент для мягкого облака
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // === Туман ===
    if (p.r >= 80) {
      p.x += p.speed;
      if (p.x - p.r > W) p.x = -p.r;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(220, 230, 240, ${p.opacity})`);
      grad.addColorStop(1, 'rgba(220, 230, 240, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
  }

  // === Молния ===
  if (currentScene === 'thunder') {
    if (lightningTimer > 0) {
      lightningTimer--;
    } else {
      // Запускаем вспышку
      lightningFlash = 1;
      lightningTimer = 180 + Math.random() * 420; // 3–10 секунд
    }

    if (lightningFlash > 0) {
      // Двойной удар: ярко → затухание
      if (Math.random() < 0.35) {
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlash * 0.35})`;
        ctx.fillRect(0, 0, W, H);
      }
      lightningFlash *= 0.85;
      if (lightningFlash < 0.02) lightningFlash = 0;
    }
  }
}

// --- Цикл ---
function animationLoop() {
  drawScene();
  animationId = requestAnimationFrame(animationLoop);
}

function setScene(group, isDay) {
  // Если та же группа и день/ночь — не перезапускаем (сохраняем частицы)
  const sceneKey = `${group}-${isDay ? 'day' : 'night'}`;
  if (currentScene === sceneKey) return;

  currentScene = sceneKey;
  initScene(group, isDay);
}

function startAnimation(group, isDay) {
  if (animationId) cancelAnimationFrame(animationId);
  particles = [];
  currentScene = null;
  setScene(group, isDay);
  animationLoop();
}

// Пауза анимации, если вкладка неактивна — экономим батарею
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  } else {
    if (!animationId && currentScene) {
      animationLoop();
    }
  }
});
// ============================================================
// ================== КОНЕЦ CANVAS-АНИМАЦИИ ===================
// ============================================================

// ============ Тема фона ============
function applyTheme(weatherCode, isDay) {
  const info = getWeatherInfo(weatherCode);
  const timeOfDay = isDay ? 'day' : 'night';
  document.body.dataset.theme = `${info.group}-${timeOfDay}`;

  // Запускаем/меняем анимацию
  startAnimation(info.group, isDay);
}

// ============ Конвертация температур ============
function convertTemp(celsius) {
  return currentUnit === 'F' ? celsius * 9 / 5 + 32 : celsius;
}

function formatTemp(celsius, withDegree = true) {
  const value = Math.round(convertTemp(celsius));
  const sign = value > 0 ? '+' : '';
  const unit = withDegree ? `°${currentUnit}` : '°';
  return `${sign}${value}${unit}`;
}

// ============ localStorage — город и единица ============
function saveCity(cityName) {
  try { localStorage.setItem(STORAGE_KEYS.city, cityName); }
  catch (err) { console.warn('Не удалось сохранить город:', err); }
}
function getSavedCity() {
  try { return localStorage.getItem(STORAGE_KEYS.city); }
  catch { return null; }
}
function saveUnit(unit) {
  try { localStorage.setItem(STORAGE_KEYS.unit, unit); }
  catch (err) { console.warn(err); }
}
function saveLang(lang) {
  try { localStorage.setItem(STORAGE_KEYS.lang, lang); }
  catch (err) { console.warn(err); }
}

// ============ Избранные ============
function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFavorites(list) {
  try { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(list)); }
  catch (err) { console.warn(err); }
}

function isFavorite(name) {
  return loadFavorites().some((c) => c.name === name);
}

function toggleFavorite(city) {
  let list = loadFavorites();
  const idx = list.findIndex((c) => c.name === city.name);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(city);
  saveFavorites(list);
  renderFavorites();
  updateFavButton();
}

function updateFavButton() {
  if (!lastData) {
    favBtn.disabled = true;
    favBtn.textContent = '☆';
    favBtn.classList.remove('card__fav--active');
    return;
  }
  favBtn.disabled = false;
  const active = isFavorite(lastData.cityName);
  favBtn.textContent = active ? '★' : '☆';
  favBtn.classList.toggle('card__fav--active', active);
  favBtn.title = t('fav.addTitle');
}

function renderFavorites() {
  const list = loadFavorites();
  favoritesListEl.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'favorites__empty';
    empty.textContent = t('fav.empty');
    favoritesListEl.appendChild(empty);
    return;
  }

  list.forEach((city) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'fav-chip';
    chip.innerHTML = `
      <span>${city.name}</span>
      <span class="fav-chip__remove" data-remove="${city.name}">✕</span>
    `;
    chip.addEventListener('click', (e) => {
      if (e.target.dataset.remove === city.name) {
        toggleFavorite(city);
        return;
      }
      loadByCoords(city.lat, city.lon, city.name);
      hint.textContent = t('hint.updated');
    });
    favoritesListEl.appendChild(chip);
  });
}

// ============ Геокодинг ============
async function geocode(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=${currentLang}&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('geocode');

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    const err = new Error('cityNotFound');
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { lat: latitude, lon: longitude, name, country };
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${currentLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('reverse');

    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision;
    const country = data.countryName;

    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    return currentLang === 'en' ? 'My location' : 'Моё местоположение';
  } catch (err) {
    console.warn('Обратный геокодинг недоступен:', err);
    return currentLang === 'en' ? 'My location' : 'Моё местоположение';
  }
}

// ============ Запрос погоды ============
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
              `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day` +
              `&hourly=temperature_2m,weather_code` +
              `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
              `&forecast_days=5` +
              `&wind_speed_unit=ms&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('fetchWeather');

  const data = await res.json();
  return { current: data.current, hourly: data.hourly, daily: data.daily };
}

// ============ Рендер текущей погоды ============
function renderWeather() {
  const { cityName, current } = lastData;
  const info = getWeatherInfo(current.weather_code);

  cityEl.textContent = cityName;
  iconEl.textContent = info.icon;
  tempEl.textContent = formatTemp(current.temperature_2m);
  descEl.textContent = t(info.key);

  feelsEl.textContent = formatTemp(current.apparent_temperature);
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  windEl.textContent = `${current.wind_speed_10m.toFixed(1)} ${currentLang === 'en' ? 'm/s' : 'м/с'}`;

  applyTheme(current.weather_code, current.is_day === 1);
  updateFavButton();
}

// ============ Рендер почасового прогноза ============
function renderHourly() {
  const { hourly } = lastData;
  hourlyListEl.innerHTML = '';

  const now = new Date();
  const currentHour = now.getHours();
  const todayPart = now.toISOString().slice(0, 10);

  let shown = 0;

  for (let i = 0; i < hourly.time.length && shown < 24; i++) {
    const dateStr = hourly.time[i];
    const hour = parseInt(dateStr.slice(11, 13), 10);
    const datePart = dateStr.slice(0, 10);

    if (datePart === todayPart && hour < currentHour) continue;
    if (datePart < todayPart) continue;

    const info = getWeatherInfo(hourly.weather_code[i]);
    const isNow = datePart === todayPart && hour === currentHour;

    const item = document.createElement('div');
    item.className = 'hourly__item' + (isNow ? ' hourly__item--now' : '');
    item.innerHTML = `
      <div class="hourly__time">${isNow ? t('day.now') : `${String(hour).padStart(2, '0')}:00`}</div>
      <div class="hourly__icon">${info.icon}</div>
      <div class="hourly__temp">${formatTemp(hourly.temperature_2m[i], false)}</div>
    `;

    hourlyListEl.appendChild(item);
    shown++;
  }
}

// ============ Рендер прогноза на 5 дней ============
function formatDay(dateStr, index) {
  if (index === 0) return t('day.today');
  const date = new Date(dateStr);
  return t('day.weekdays')[date.getDay()];
}

function renderForecast() {
  const { daily } = lastData;
  forecastListEl.innerHTML = '';

  daily.time.forEach((dateStr, i) => {
    const info = getWeatherInfo(daily.weather_code[i]);

    const dayEl = document.createElement('div');
    dayEl.className = 'forecast__day';
    dayEl.innerHTML = `
      <div class="forecast__name">${formatDay(dateStr, i)}</div>
      <div class="forecast__icon">${info.icon}</div>
      <div class="forecast__temp">
        <div class="forecast__temp-max">${formatTemp(daily.temperature_2m_max[i], false)}</div>
        <div class="forecast__temp-min">${formatTemp(daily.temperature_2m_min[i], false)}</div>
      </div>
    `;
    forecastListEl.appendChild(dayEl);
  });
}

// ============ Общая перерисовка ============
function renderAll() {
  if (!lastData) return;
  renderWeather();
  renderHourly();
  renderForecast();
}

async function loadByCoords(lat, lon, cityName) {
  const { current, hourly, daily } = await fetchWeather(lat, lon);
  lastData = { cityName, lat, lon, current, hourly, daily };
  renderAll();
}

async function loadByCityName(query, { save = true } = {}) {
  const { lat, lon, name, country } = await geocode(query);
  const cityName = country ? `${name}, ${country}` : name;

  await loadByCoords(lat, lon, cityName);
  if (save) saveCity(query);
}

// ============ Переключатель единиц ============
unitsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.units__btn');
  if (!btn) return;

  const unit = btn.dataset.unit;
  if (unit === currentUnit) return;

  currentUnit = unit;
  saveUnit(unit);

  unitsEl.querySelectorAll('.units__btn').forEach((b) => {
    b.classList.toggle('units__btn--active', b.dataset.unit === unit);
  });

  renderAll();
});

// ============ Переключатель языка ============
langEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('.lang__btn');
  if (!btn) return;

  const lang = btn.dataset.lang;
  if (lang === currentLang) return;

  currentLang = lang;
  saveLang(lang);
  applyTranslations();
  renderFavorites();
  updateFavButton();

  const saved = getSavedCity();
  if (saved) {
    try {
      if (saved.startsWith('geo:')) {
        const [lat, lon] = saved.slice(4).split(',').map(Number);
        const cityName = await reverseGeocode(lat, lon);
        await loadByCoords(lat, lon, cityName);
      } else {
        await loadByCityName(saved, { save: false });
      }
    } catch (err) {
      console.warn('Не удалось перезагрузить погоду после смены языка:', err);
    }
  } else if (lastData) {
    renderAll();
  }
});

// ============ Кнопка «В избранное» ============
favBtn.addEventListener('click', () => {
  if (!lastData) return;
  toggleFavorite({
    name: lastData.cityName,
    lat: lastData.lat,
    lon: lastData.lon,
  });
});

// ============ Форма поиска ============
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) {
    hint.textContent = t('hint.emptyQuery');
    return;
  }

  hint.textContent = t('hint.loading');

  try {
    await loadByCityName(query);
    hint.textContent = t('hint.updated');
  } catch (err) {
    handleError(err);
  }
});

// ============ Геолокация ============
geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    hint.textContent = t('hint.geoUnsupported');
    return;
  }

  hint.textContent = t('hint.geoLoading');
  geoBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const cityName = await reverseGeocode(latitude, longitude);
        await loadByCoords(latitude, longitude, cityName);
        saveCity(`geo:${latitude},${longitude}`);
        hint.textContent = t('hint.geoDone');
      } catch (err) {
        handleError(err);
      } finally {
        geoBtn.disabled = false;
      }
    },
    (error) => {
      geoBtn.disabled = false;
      const messages = {
        1: t('hint.geoDenied'),
        2: t('hint.geoUnavailable'),
        3: t('hint.geoTimeout'),
      };
      hint.textContent = messages[error.code] || t('hint.geoError');
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
});

// ============ Обработка ошибок ============
function handleError(err) {
  console.error('Подробности:', err);

  if (err.code === 'CITY_NOT_FOUND' || err.message === 'cityNotFound') {
    hint.textContent = t('hint.cityNotFound');
  } else if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
    hint.textContent = t('hint.noNetwork');
  } else {
    hint.textContent = t('hint.errorPrefix') + err.message;
  }
}

// ============ Инициализация ============
function applyUnitButton() {
  unitsEl.querySelectorAll('.units__btn').forEach((b) => {
    b.classList.toggle('units__btn--active', b.dataset.unit === currentUnit);
  });
}

async function restoreLastCity() {
  const saved = getSavedCity();
  if (!saved) return;

  hint.textContent = t('hint.restore');

  try {
    if (saved.startsWith('geo:')) {
      const [lat, lon] = saved.slice(4).split(',').map(Number);
      const cityName = await reverseGeocode(lat, lon);
      await loadByCoords(lat, lon, cityName);
    } else {
      await loadByCityName(saved, { save: false });
    }
    hint.textContent = t('hint.restored');
  } catch (err) {
    console.warn('Не удалось восстановить город:', err);
    try { localStorage.removeItem(STORAGE_KEYS.city); } catch {}
    hint.textContent = t('hint.start');
  }
}

applyTranslations();
applyUnitButton();
renderFavorites();
restoreLastCity();