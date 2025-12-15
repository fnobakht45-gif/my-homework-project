console.clear();

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM آماده است — اسکریپت اجرا شد");

  let form = document.getElementById("search-form");
  let cityInput = document.getElementById("city-input");
  let weatherCity = document.getElementById("weather-city");
  let weatherTemp = document.getElementById("weather-temp");
  let currentDateElement = document.getElementById("currentDate");

  let rainText = document.getElementById("rain-text");
  let humidityEl = document.getElementById("humidity");
  let windSpeedEl = document.getElementById("wind-speed");
  let weatherIcon = document.getElementById("weather-icon");

  function formatDate(date) {
    let minutes = date.getMinutes();
    let hours = date.getHours();
    if (minutes < 10) minutes = `0${minutes}`;
    if (hours < 10) hours = `0${hours}`;
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return `${days[date.getDay()]} ${hours}:${minutes}`;
  }

  if (currentDateElement) {
    currentDateElement.innerHTML = formatDate(new Date());
  }

  // تبدیل نام شهر به مختصات
  function getCoordinates(cityName) {
    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.results || data.results.length === 0) {
          throw new Error("City not found");
        }
        return {
          lat: data.results[0].latitude,
          lon: data.results[0].longitude,
        };
      });
  }

  // گرفتن وضعیت هوا
  function getWeather(cityName) {
    weatherTemp.textContent = "Loading...";
    if (rainText) rainText.textContent = "Loading...";
    if (humidityEl) humidityEl.textContent = "Loading...";
    if (windSpeedEl) windSpeedEl.textContent = "Loading...";
    if (weatherIcon) weatherIcon.src = "icons/default.png";

    getCoordinates(cityName)
      .then((coords) => {
        let url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=precipitation,relative_humidity_2m,windspeed_10m`;
        return fetch(url);
      })
      .then((res) => res.json())
      .then((data) => {
        if (!data.current_weather) {
          weatherTemp.textContent = "No weather data";
          return;
        }
        
weatherTemp.textContent = `${data.current_weather.temperature} °C`;

// سرعت باد
if (windSpeedEl && data.current_weather?.windspeed !== undefined) {
  windSpeedEl.textContent =`${data.current_weather.windspeed} km/h`;
}

// رطوبت
if (humidityEl && data.hourly?.relative_humidity_2m) {
  humidityEl.textContent = `${data.hourly.relative_humidity_2m[0]}%`;
}

// بارش
if (rainText && data.hourly?.precipitation) {
  rainText.textContent = `${data.hourly.precipitation[0]} mm`;
}
     
       
        // تعیین آیکون بر اساس وضعیت هوا (simplified)
        let weatherCode = data.current_weather.weathercode; // Open-Meteo uses codes
        let weatherIcon = document.getElementById("weather-icon");

// داخل then(data => { })

let code = data.current_weather.weathercode;

if (weatherIcon) {
  if (code === 0) weatherIcon.src = "icons/sun.png";
  else if ([1,2,3].includes(code)) weatherIcon.src = "icons/cloud.png";
  else if ([61,63,65].includes(code)) weatherIcon.src = "icons/rain.png";
  else if ([71,73,75].includes(code)) weatherIcon.src = "icons/snow.png";
  else weatherIcon.src = "icons/default.png";
}
      })
      .catch((err) => {
        console.error(err);
        weatherTemp.textContent = "Error loading temperature";
        if (rainText) rainText.textContent = "Error";
        if (humidityEl) humidityEl.textContent = "Error";
        if (windSpeedEl) windSpeedEl.textContent = "Error";
        if (weatherIcon) weatherIcon.src = "icons/default.png";
      });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let cityName = cityInput.value.trim();
    if (!cityName) return;

    weatherCity.textContent = cityName;

    if (currentDateElement) {
      currentDateElement.innerHTML = formatDate(new Date());
    }

    getWeather(cityName);

    cityInput.value = "";
  });
});