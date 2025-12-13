console.clear();

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM آماده است — اسکریپت اجرا شد");

  let form = document.getElementById("search-form");
  let cityInput = document.getElementById("city-input");
  let weatherCity = document.getElementById("weather-city");
  let weatherTemp = document.getElementById("weather-temp");
  let currentDateElement = document.getElementById("currentDate");

  function formatDate(date) {
    let minutes = date.getMinutes();
    let hours = date.getHours();
    if (minutes < 10) minutes = `0${minutes}`;
    if (hours < 10) hours = `0${hours}`;
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `${days[date.getDay()]} ${hours}:${minutes}`;
  }

  if (currentDateElement) {
    currentDateElement.innerHTML = formatDate(new Date());
  }

  // 1) تبدیل نام شهر به مختصات (Geocoding)
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

  // 2) گرفتن دما از Open-Meteo
  function getWeather(cityName) {
    weatherTemp.textContent = "Loading...";

    getCoordinates(cityName)
      .then((coords) => {
        let url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;

        return fetch(url);
      })
      .then((res) => res.json())
      .then((data) => {
        if (!data.current_weather) {
          weatherTemp.textContent = "No weather data";
          return;
        }

        let temp = data.current_weather.temperature;
        weatherTemp.textContent = `${temp} °C`;
      })
      .catch((err) => {
        console.error(err);
        weatherTemp.textContent = "Error loading temperature";
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
