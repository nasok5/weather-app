// ============ Ссылки на элементы ============
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const geoBtn = document.getElementById('geo-btn');
const hint = document.getElementById('hint');
const unitsEl = document.getElementById('units');

const cityEl = document.getElementById('city');
const iconEl = document.getElementById('icon');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const feelsEl = document.getElementById('feels');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

const hourlyListEl = document.getElementById('hourly-list');
const forecastListEl = document.getElementById('forecast-list');

// ============ Ключи localStorage ============
const STORAGE_KEYS = {
  city: 'weather.lastCity',
  unit: 'weather.unit',
};

// ============ Состояние ============
let currentUnit = localStorage.getItem(STORAGE_KEYS.unit) || 'C';
let lastData = null;

// ============ Словарь погодных кодов WMO ============
const weatherCodes = {
  0:  { desc: 'Ясно',                    icon: '☀️', group: 'clear' },
  1:  { desc: 'Преимущественно ясно',    icon: '🌤️', group: 'clear' },
  2:  { desc: 'Переменная облачность',   icon: '⛅',  group: 'cloudy' },
  3:  { desc: 'Пасмурно',                icon: '☁️', group: 'cloudy' },
  45: { desc: 'Туман',                   icon: '🌫️', group: 'fog' },
  48: { desc: 'Изморозь',                icon: '🌫️', group: 'fog' },
  51: { desc: 'Слабая морось',           icon: '🌦️', group: 'rain' },
  53: { desc: 'Морось',                  icon: '🌦️', group: 'rain' },
  55: { desc: 'Сильная морось',          icon: '🌧️', group: 'rain' },
  61: { desc: 'Небольшой дождь',         icon: '🌧️', group: 'rain' },
  63: { desc: 'Дождь',                   icon: '🌧️', group: 'rain' },
  65: { desc: 'Сильный дождь',           icon: '🌧️', group: 'rain' },
  71: { desc: 'Небольшой снег',          icon: '🌨️', group: 'snow' },
  73: { desc: 'Снег',                    icon: '❄️', group: 'snow' },
  75: { desc: 'Сильный снег',            icon: '❄️', group: 'snow' },
  80: { desc: 'Ливень',                  icon: '🌦️', group: 'rain' },
  81: { desc: 'Сильный ливень',          icon: '🌧️', group: 'rain' },
  82: { desc: 'Очень сильный ливень',    icon: '⛈️', group: 'rain' },
  95: { desc: 'Гроза',                   icon: '⛈️', group: 'thunder' },
  96: { desc: 'Гроза с градом',          icon: '⛈️', group: 'thunder' },
  99: { desc: 'Сильная гроза с градом',  icon: '⛈️', group: 'thunder' },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { desc: 'Неизвестно', icon: '❓', group: 'cloudy' };
}

// ============ Тема фона ============
function applyTheme(weatherCode, isDay) {
  const info = getWeatherInfo(weatherCode);
  const timeOfDay = isDay ? 'day' : 'night';
  const theme = `${info.group}-${timeOfDay}`;

  document.body.dataset.theme = theme;
}

// ============ Конвертация температуры ============
function convertTemp(celsius) {
  if (currentUnit === 'F') return celsius * 9 / 5 + 32;
  return celsius;
}

function formatTemp(celsius, withDegree = true) {
  const value = Math.round(convertTemp(celsius));
  const sign = value > 0 ? '+' : '';
  const unit = withDegree ? `°${currentUnit}` : '°';
  return `${sign}${value}${unit}`;
}

// ============ localStorage ============
function saveCity(cityName) {
  try { localStorage.setItem(STORAGE_KEYS.city, cityName); }
  catch (err) { console.warn('Не удалось сохранить город:', err); }
}

function getSavedCity() {
  try { return localStorage.getItem(STORAGE_KEYS.city); }
  catch (err) { console.warn('Не удалось прочитать город:', err); return null; }
}

function saveUnit(unit) {
  try { localStorage.setItem(STORAGE_KEYS.unit, unit); }
  catch (err) { console.warn('Не удалось сохранить единицу:', err); }
}

// ============ Геокодинг ============
async function geocode(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка геокодинга');

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('Город не найден');
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { lat: latitude, lon: longitude, name, country };
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ru`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка обратного геокодинга');

    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision;
    const country = data.countryName;

    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    return 'Моё местоположение';
  } catch (err) {
    console.warn('Обратный геокодинг недоступен:', err);
    return 'Моё местоположение';
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
  if (!res.ok) throw new Error('Ошибка получения погоды');

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
  descEl.textContent = info.desc;

  feelsEl.textContent = formatTemp(current.apparent_temperature);
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  windEl.textContent = `${current.wind_speed_10m.toFixed(1)} м/с`;

  // Меняем тему фона
  applyTheme(current.weather_code, current.is_day === 1);
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
      <div class="hourly__time">${isNow ? 'Сейчас' : `${String(hour).padStart(2, '0')}:00`}</div>
      <div class="hourly__icon">${info.icon}</div>
      <div class="hourly__temp">${formatTemp(hourly.temperature_2m[i], false)}</div>
    `;

    hourlyListEl.appendChild(item);
    shown++;
  }
}

// ============ Рендер прогноза на 5 дней ============
function formatDay(dateStr, index) {
  if (index === 0) return 'Сегодня';
  const date = new Date(dateStr);
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()];
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

// ============ Общая отрисовка ============
function renderAll() {
  if (!lastData) return;
  renderWeather();
  renderHourly();
  renderForecast();
}

async function loadByCoords(lat, lon, cityName) {
  const { current, hourly, daily } = await fetchWeather(lat, lon);
  lastData = { cityName, current, hourly, daily };
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

// ============ Форма поиска ============
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) {
    hint.textContent = '⚠️ Введите название города';
    return;
  }

  hint.textContent = '⏳ Загружаем...';

  try {
    await loadByCityName(query);
    hint.textContent = '✅ Данные обновлены';
  } catch (err) {
    handleError(err);
  }
});

// ============ Геолокация ============
geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    hint.textContent = '❌ Геолокация не поддерживается браузером';
    return;
  }

  hint.textContent = '📡 Определяем местоположение...';
  geoBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const cityName = await reverseGeocode(latitude, longitude);
        await loadByCoords(latitude, longitude, cityName);
        saveCity(`geo:${latitude},${longitude}`);
        hint.textContent = '✅ Показана погода для вашего местоположения';
      } catch (err) {
        handleError(err);
      } finally {
        geoBtn.disabled = false;
      }
    },
    (error) => {
      geoBtn.disabled = false;

      const messages = {
        1: '🚫 Вы запретили доступ к геолокации',
        2: '📡 Не удалось определить местоположение',
        3: '⏱️ Превышено время ожидания',
      };
      hint.textContent = messages[error.code] || '❌ Ошибка геолокации';
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

  if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
    hint.textContent = '🌐 Нет связи с API. Проверьте интернет или VPN.';
  } else if (err.message === 'Город не найден') {
    hint.textContent = '🤷 Город не найден. Попробуйте другое название.';
  } else {
    hint.textContent = `❌ Ошибка: ${err.message}`;
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

  hint.textContent = '⏳ Загружаем последний город...';

  try {
    if (saved.startsWith('geo:')) {
      const [lat, lon] = saved.slice(4).split(',').map(Number);
      const cityName = await reverseGeocode(lat, lon);
      await loadByCoords(lat, lon, cityName);
    } else {
      await loadByCityName(saved, { save: false });
    }

    hint.textContent = '✅ Загружена последняя погода';
  } catch (err) {
    console.warn('Не удалось восстановить город:', err);
    localStorage.removeItem(STORAGE_KEYS.city);
    hint.textContent = '💡 Введите город или нажмите «Моё местоположение»';
  }
}

applyUnitButton();
restoreLastCity();