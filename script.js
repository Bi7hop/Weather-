const cities = {
    "Berlin": { lat: 52.5200, lon: 13.4050 },
    "Hamburg": { lat: 53.5511, lon: 9.9937 },
    "Munich": { lat: 48.1351, lon: 11.5820 },
    "Cologne": { lat: 50.9375, lon: 6.9603 },
    "Frankfurt": { lat: 50.1109, lon: 8.6821 },
    "Stuttgart": { lat: 48.7758, lon: 9.1829 },
    "Düsseldorf": { lat: 51.2277, lon: 6.7735 },
    "Dortmund": { lat: 51.5136, lon: 7.4653 },
    "Essen": { lat: 51.4556, lon: 7.0116 },
    "Bremen": { lat: 53.0793, lon: 8.8017 },
    "Dresden": { lat: 51.0504, lon: 13.7373 },
    "Leipzig": { lat: 51.3397, lon: 12.3731 },
    "Hannover": { lat: 52.3759, lon: 9.7320 },
    "Nuremberg": { lat: 49.4521, lon: 11.0767 },
    "Duisburg": { lat: 51.4344, lon: 6.7623 },
    "Bochum": { lat: 51.4818, lon: 7.2162 },
    "Wuppertal": { lat: 51.2562, lon: 7.1508 },
    "Bielefeld": { lat: 52.0302, lon: 8.5325 },
    "Bonn": { lat: 50.7374, lon: 7.0982 },
    "Münster": { lat: 51.9607, lon: 7.6261 }
};

const map = L.map('map').setView([51.1657, 10.4515], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getWeatherIcon(weatherCode) {
    const weatherIcons = {
        "clear": "☀️",
        "cloudy": "☁️",
        "rain": "🌧️",
        "snow": "❄️",
        "thunderstorm": "⛈️",
        "fog": "🌫️"
    };

    if (weatherCode === 0) return weatherIcons.clear;
    if (weatherCode >= 1 && weatherCode <= 3) return weatherIcons.cloudy;
    if (weatherCode >= 45 && weatherCode <= 48) return weatherIcons.fog;
    if (weatherCode >= 51 && weatherCode <= 67) return weatherIcons.rain;
    if (weatherCode >= 71 && weatherCode <= 77) return weatherIcons.snow;
    if (weatherCode >= 80 && weatherCode <= 82) return weatherIcons.rain;
    if (weatherCode >= 95 && weatherCode <= 99) return weatherIcons.thunderstorm;
    
    return "❓"; 
}

function getWeatherDataForCity(city, lat, lon, marker) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Berlin`)
        .then(response => response.json())
        .then(data => {
            const temperature = data.current_weather.temperature;
            const weatherCode = data.current_weather.weathercode;
            const weatherIcon = getWeatherIcon(weatherCode);

            const forecast = data.daily.time.map((date, index) => ({
                date,
                temperature_max: data.daily.temperature_2m_max[index],
                temperature_min: data.daily.temperature_2m_min[index],
                weathercode: data.daily.weathercode[index]
            })).slice(0, 3);

            const popupContent = `
                <div class="popup-content">
                    <h1>${city}</h1>
                    <p>${temperature}°C ${weatherIcon}</p>
                    <div class="forecast">
                        ${forecast.map(day => `
                            <p>${day.date}: ${day.temperature_min}°C - ${day.temperature_max}°C ${getWeatherIcon(day.weathercode)}</p>
                        `).join('')}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent).openPopup();
        })
        .catch(error => {
            console.error(`Fehler beim Abrufen der Wetterdaten für ${city}: ${error.message}`);
        });
}

for (const city in cities) {
    const { lat, lon } = cities[city];
    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<div class="popup-content"><h1>${city}</h1><p>Daten werden geladen...</p></div>`)
        .on('click', () => {
            getWeatherDataForCity(city, lat, lon, marker);
        });
}


const geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
}).on('markgeocode', function(e) {
    const lat = e.geocode.center.lat;
    const lon = e.geocode.center.lng;
    const city = e.geocode.name;

    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<div class="popup-content"><h1>${city}</h1><p>Daten werden geladen...</p></div>`)
        .on('click', () => {
            getWeatherDataForCity(city, lat, lon, marker);
        });

    map.setView([lat, lon], 10);
    getWeatherDataForCity(city, lat, lon, marker);
}).addTo(map);
