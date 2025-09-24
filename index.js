// index.js

// Tabs
const userTab = document.querySelector('[data-user-wheather]');
const searchTab = document.querySelector('[data-search-wheather]');
const grantAccessContainer = document.querySelector('.grant-loc-container');
const searchForm = document.querySelector('[data-search-form]');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const searchInput = document.querySelector('[data-searchInput]');

let currentTab = userTab;
const ApiKey = 'c2da6e475aa61f4c06a8d3166317d75d'; // your key

currentTab.classList.add("current-tab");

// switch tab listeners
userTab.addEventListener('click', () => switchTab(userTab));
searchTab.addEventListener('click', () => switchTab(searchTab));

function switchTab(clickedTab) {
  if (clickedTab !== currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains('active')) {
      // go to search tab
      userInfoContainer.classList.remove('active');
      grantAccessContainer.classList.remove('active');
      searchForm.classList.add('active');
    } else {
      // go to user weather tab
      searchForm.classList.remove('active');
      userInfoContainer.classList.remove('active');
      getFromSessionStorage();
    }
  }
}

// check for coordinates in session storage
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add('active');
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeather(coordinates);
  }
}

// grant location access button
document.querySelector('[data-grantAccess]').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
});

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeather(userCoordinates);
}

// fetch weather by coordinates
async function fetchUserWeather(coordinates) {
  const { lat, lon } = coordinates;
  loadingScreen.classList.add('active');
  grantAccessContainer.classList.remove('active');
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKey}&units=metric`
    );
    const data = await res.json();
    renderWeatherInfo(data);
  } catch (err) {
    alert('Error fetching your weather');
  } finally {
    loadingScreen.classList.remove('active');
  }
}

// search form submit
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const cityName = searchInput.value.trim();
  if (cityName) {
    fetchWeatherByCity(cityName);
  }
});

// fetch weather by city
async function fetchWeatherByCity(city) {
  loadingScreen.classList.add('active');
  userInfoContainer.classList.remove('active');
  grantAccessContainer.classList.remove('active');
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${ApiKey}&units=metric`
    );
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    renderWeatherInfo(data);
  } catch (err) {
    alert(err.message);
  } finally {
    loadingScreen.classList.remove('active');
  }
}

// render weather info in UI
function renderWeatherInfo(weatherInfo) {
  userInfoContainer.classList.add('active');
  document.querySelector('[city-name]').textContent = `${weatherInfo.name}, ${weatherInfo.sys.country}`;
  document.querySelector('[data-countryIcon]').src =
    `https://flagcdn.com/48x36/${weatherInfo.sys.country.toLowerCase()}.png`;
  document.querySelector('[data-wheatherDesc]').textContent = weatherInfo.weather[0].description;
  document.querySelector('[data-wheathericon]').src =
    `http://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`;
  document.querySelector('[data-temp]').textContent = `${weatherInfo.main.temp} °C`;
  document.querySelector('[data-wind]').textContent = `${weatherInfo.wind.speed} m/s`;
  document.querySelector('[data-hum]').textContent = `${weatherInfo.main.humidity}%`;
  document.querySelector('[data-cloud]').textContent = `${weatherInfo.clouds.all}%`;
}

// on page load, try to get your weather
getFromSessionStorage();
