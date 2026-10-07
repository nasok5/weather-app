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

// ============ Состояние приложения ============
let currentUnit = 'C';     // 'C' или 'F'
let lastData = null;       // последние данные от API: { cityName, current, hourly, daily }

// ============ Словарь погодных кодов WMO ============
const weatherCodes = {
  0:  { desc: 'Ясно',                    icon: '☀️' },
  1:  { desc: 'Преимущественно ясно',    icon: '🌤️' },
  2:  { desc: 'Переменная облачность',   icon: '⛅' },
  3:  { desc: 'Пасмурно',                icon: '☁️' },
  45: { desc: 'Туман',                   icon: '🌫️' },
  48: { desc: 'Изморозь',                icon: '🌫️' },
  51: { desc: 'Слабая морось',           icon: '🌦️' },
  53: { desc: 'Морось',                  icon: '🌦️' },
  55: { desc: 'Сильная морось',          icon: '🌧️' },
  61: { desc: 'Небольшой дождь',         icon: '🌧️' },
  63: { desc: 'Дождь',                   icon: '🌧️' },
  65: { desc: 'Сильный дождь',           icon: '🌧️' },
  71: { desc: 'Небольшой снег',          icon: '🌨️' },
  73: { desc: 'Снег',                    icon: '❄️' },
  75: { desc: 'Сильный снег',            icon: '❄️' },
  80: { desc: 'Ливень',                  icon: '🌦️' },
  81: { desc: 'Сильный ливень',          icon: '🌧️' },
  82: { desc: 'Очень сильный ливень',    icon: '⛈️' },
  95: { desc: 'Гроза',                   icon: '⛈️' },
  96: { desc: 'Гроза с градом',          icon: '⛈️' },
  99: { desc: 'Сильная гроза с градом',  icon: '⛈️' },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { desc: 'Неизвестно', icon: '❓' };
}

// ============ Конвертация температуры ============
function convertTemp(celsius) {
  if (currentUnit === 'F') return celsius * 9 / 5 + 32;
  return celsius;
}

// Форматирование температуры с учётом единицы и знака
function formatTemp(celsius, withDegree = true) {
  const value = Math.round(convertTemp(celsius));
  const sign = value > 0 ? '+' : '';
  const unit = withDegree ? `°${currentUnit}` : '°';
  return `${sign}${value}${unit}`;
}

// ============ Геокодинг: имя → координаты ============
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

// ============ Обратный геокодинг ============
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

// ============ Прогноз: координаты → погода ============
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
              `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
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

// ============ Перерисовать всё ============
function renderAll() {
  if (!lastData) return;
  renderWeather();
  renderHourly();
  renderForecast();
}

// ============ Загрузка по координатам ============
async function loadByCoords(lat, lon, cityName) {
  const { current, hourly, daily } = await fetchWeather(lat, lon);

  lastData = { cityName, current, hourly, daily };
  renderAll();
}

// ============ Переключатель единиц ============
unitsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.units__btn');
  if (!btn) return;

  const unit = btn.dataset.unit;
  if (unit === currentUnit) return;

  currentUnit = unit;

  // Обновляем активную кнопку
  unitsEl.querySelectorAll('.units__btn').forEach((b) => {
    b.classList.toggle('units__btn--active', b.dataset.unit === unit);
  });

  // Перерисовываем все температуры
  renderAll();
});

// ============ Обработка формы ============
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) {
    hint.textContent = '⚠️ Введите название города';
    return;
  }

  hint.textContent = '⏳ Загружаем...';

  try {
    const { lat, lon, name, country } = await geocode(query);
    await loadByCoords(lat, lon, country ? `${name}, ${country}` : name);

    hint.textContent = '✅ Данные обновлены';
  } catch (err) {
    handleError(err);
  }
});

// ============ Обработка геолокации ============
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

// ============ Единая обработка ошибок ============
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