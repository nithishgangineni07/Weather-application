const apiKey = '17251aea81a87db5685b646487f5ef5a'; // Replace with your OpenWeather API key

// Event listener for the search button
document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        getWeatherByCity(city);
        getForecastByCity(city);
        addCityToRecent(city);
    } else {
        showError('Please enter a city name.');
    }
});

// Event listener for the location button
document.getElementById('location-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByLocation(latitude, longitude);
            getForecastByLocation(latitude, longitude);
        }, () => {
            showError('Unable to retrieve your location.');
        });
    } else {
        showError('Geolocation is not supported by this browser.');
    }
});

// Event listener for the recent cities dropdown
document.getElementById('recent-cities').addEventListener('change', (event) => {
    const city = event.target.value;
    if (city) {
        getWeatherByCity(city);
        getForecastByCity(city);
    }
});

// Fetch weather data by city name
function getWeatherByCity(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => updateWeather(data))
        .catch(error => showError(error.message));
}

// Fetch weather data by geographic coordinates
function getWeatherByLocation(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to retrieve weather data');
            }
            return response.json();
        })
        .then(data => updateWeather(data))
        .catch(error => showError(error.message));
}

// Fetch 5-day forecast data by city name
function getForecastByCity(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to retrieve forecast data');
            }
            return response.json();
        })
        .then(data => updateForecast(data))
        .catch(error => showError(error.message));
}

// Fetch 5-day forecast data by geographic coordinates
function getForecastByLocation(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to retrieve forecast data');
            }
            return response.json();
        })
        .then(data => updateForecast(data))
        .catch(error => showError(error.message));
}

// Update the weather display with fetched data
function updateWeather(data) {
    if (data.cod === 200) {
        document.getElementById('weather-card').classList.remove('hidden');
        document.getElementById('error-message').classList.add('hidden');
        document.getElementById('day').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        document.getElementById('location').textContent = data.name;
        document.getElementById('temperature').textContent = `${data.main.temp}°C`;
        document.getElementById('weather-condition').textContent = data.weather[0].description;
        document.getElementById('min-temp').textContent = `${data.main.temp_min}°C`;
        document.getElementById('max-temp').textContent = `${data.main.temp_max}°C`;
    } else {
        showError('City not found.');
    }
}

// Update the forecast display with fetched data
function updateForecast(data) {
    if (data.cod === "200") {
        const forecastContainer = document.getElementById('forecast');
        forecastContainer.classList.remove('hidden');
        forecastContainer.innerHTML = ''; // Clear previous forecast

        // Filter the forecast data to get one entry per day at 12:00 PM
        const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes('12:00:00'));

        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            const temp = `${forecast.main.temp}°C`;
            const weather = forecast.weather[0].description;
            const icon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
            const wind = `${forecast.wind.speed} m/s`;
            const humidity = `${forecast.main.humidity}%`;

            const forecastElement = document.createElement('div');
            forecastElement.classList.add('bg-gray-800', 'bg-opacity-70', 'rounded-2xl', 'p-4', 'shadow-xl', 'text-center');

            forecastElement.innerHTML = `
                <p class="font-bold">${date}</p>
                <img src="${icon}" alt="${weather}" class="mx-auto">
                <p class="text-lg">${temp}</p>
                <p class="text-sm">${weather}</p>
                <p class="text-sm">Wind: ${wind}</p>
                <p class="text-sm">Humidity: ${humidity}</p>
            `;

            forecastContainer.appendChild(forecastElement);
        });
    } else {
        showError('Unable to retrieve forecast data.');
    }
}

// Display error messages
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    document.getElementById('weather-card').classList.add('hidden');
    document.getElementById('forecast').classList.add('hidden');
}

// Add city to recent searches and update the dropdown
function addCityToRecent(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCitiesDropdown();
    }
}

// Update the recent cities dropdown with stored cities
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const recentCitiesDropdown = document.getElementById('recent-cities');
    recentCitiesDropdown.innerHTML = '<option value="" disabled selected>Select a recently searched city</option>';
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
    if (recentCities.length > 0) {
        recentCitiesDropdown.classList.remove('hidden');
    } else {
        recentCitiesDropdown.classList.add('hidden');
    }
}

// Initialize recent cities dropdown on page load
document.addEventListener('DOMContentLoaded', updateRecentCitiesDropdown);