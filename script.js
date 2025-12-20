
console.clear();

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM آماده است — اسکریپت اجرا شد");

  const form = document.getElementById("search-form");
  const cityInput = document.getElementById("city-input");
  const weatherCity = document.getElementById("weather-city");
  const weatherTemp = document.getElementById("weather-temp");
  const currentDateElement = document.getElementById("currentDate");
  const descriptionE1 = document.getElementById("description");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");
  const weatherIcon = document.getElementById("weather-icon");
  const forecastSection = document.querySelector(".forecast");

  // تابع تبدیل کد هوا به متن انگلیسی
  function getWeatherDescriptionEN(code) {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";
    if (code === 51) return "Light drizzle";
    if (code === 53) return "Moderate drizzle";
    if (code === 55) return "Dense drizzle";
    if (code === 61) return "Slight rain";
    if (code === 63) return "Moderate rain";
    if (code === 65) return "Heavy rain";
    if (code === 71) return "Slight snow";
    if (code === 73) return "Moderate snow";
    if (code === 75) return "Heavy snow";
    if (code === 95) return "Thunderstorm";
    return "Unknown weather";
  }

  // تابع فرمت تاریخ و ساعت
  function formatDate(date) {
    let minutes = date.getMinutes();
    let hours = date.getHours();
    if (minutes < 10) minutes = `0${minutes}`;
    if (hours < 10) hours = `0${hours}`;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `${days[date.getDay()]} ${hours}:${minutes}`;
  }

  // نمایش تاریخ فعلی
  if (currentDateElement) {
    currentDateElement.textContent = formatDate(new Date());
  }

  // تبدیل نام شهر به مختصات
  function getCoordinates(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.results || data.results.length === 0) throw new Error("City not found");
        return {
          lat: data.results[0].latitude,
          lon: data.results[0].longitude,
        };
      });
  }

  // گرفتن وضعیت هوا و آپدیت UI
  function getWeather(cityName) {
    // نمایش Loading
    if (weatherTemp) weatherTemp.textContent = "Loading...";
    if (descriptionE1) descriptionE1.textContent = "Loading...";
    if (humidityEl) humidityEl.textContent = "Loading...";
    if (windSpeedEl) windSpeedEl.textContent = "Loading...";
    if (weatherIcon) weatherIcon.src = "icons/default.png";
    if (forecastSection) forecastSection.innerHTML = "Loading...";

    getCoordinates(cityName)
      .then(coords => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=relative_humidity_2m,windspeed_10m&timezone=auto`;
        return fetch(url);
      })
      .then(res => res.json())
      .then(data => {
        if (!data.current_weather) {
          if (weatherTemp) weatherTemp.textContent = "No weather data";
          if (descriptionE1) descriptionE1.textContent = "No data";
          if (forecastSection) forecastSection.innerHTML = "";
          return;
        }

        const code = data.current_weather.weathercode;
        const weatherDescText = getWeatherDescriptionEN(code);

        // وضعیت فعلی
        if (descriptionE1) descriptionE1.textContent = weatherDescText;
        if (weatherTemp) weatherTemp.textContent = `${data.current_weather.temperature} °C`;
        if (windSpeedEl && data.current_weather.windspeed !== undefined) {
          windSpeedEl.textContent = `${data.current_weather.windspeed} km/h`;
        }
        if (humidityEl && data.hourly?.relative_humidity_2m) {
          const hourIndex = new Date().getHours();
          humidityEl.textContent = `${data.hourly.relative_humidity_2m[hourIndex]}%`;
        }

        if (weatherIcon) {
          if (code === 0) weatherIcon.src = "icons/sun.png";
          else if ([1,2,3].includes(code)) weatherIcon.src = "icons/cloud.png";
          else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) weatherIcon.src = "icons/rain.png";
          else if (code >= 71 && code <= 75) weatherIcon.src = "icons/snow.png";
          else weatherIcon.src = "icons/default.png";
        }


        // پیش‌بینی 6 روز آینده
        if (data.daily && forecastSection) {
          forecastSection.innerHTML = "";
          const dailyTimes = data.daily.time;
          const tempMax = data.daily.temperature_2m_max;
          const tempMin = data.daily.temperature_2m_min;
          const weatherCodes = data.daily.weathercode;

          for (let i = 1; i < 7; i++) {
            const date = new Date(dailyTimes[i]);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

            let icon = "🌤️";
            const code = weatherCodes[i];
            if (code === 0) icon = "☀️";
            else if ([1,2,3].includes(code)) icon = "☁️";
            else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) icon = "🌧️";
            else if (code >= 71 && code <= 75) icon = "❄️";
            else if (code === 95) icon = "⛈️";

            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            dayDiv.innerHTML = `
              <div>${dayName}</div>
              <div>${icon}</div>
              <br />
              <div class="temperature-1"><strong>${Math.round(tempMax[i])}°</strong> ${Math.round(tempMin[i])}°</div>
            `;
            forecastSection.appendChild(dayDiv);
          }
        }

      })
      .catch(error => {
        console.error(error);
        if (weatherTemp) weatherTemp.textContent = "Error loading temperature";
        if (descriptionE1) descriptionE1.textContent = "Error";
        if (humidityEl) humidityEl.textContent = "Error";
        if (windSpeedEl) windSpeedEl.textContent = "Error";
        if (weatherIcon) weatherIcon.src = "icons/default.png";
        if (forecastSection) forecastSection.innerHTML = "Error loading forecast";
      });
  }

  // وقتی فرم submit شد
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    if (weatherCity) weatherCity.textContent = cityName;
    if (currentDateElement) currentDateElement.textContent = formatDate(new Date());

    getWeather(cityName);
    cityInput.value = "";
    cityInput.focus();
  });
});