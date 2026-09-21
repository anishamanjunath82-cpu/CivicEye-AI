const MYSURU_LAT = 12.2958;
const MYSURU_LNG = 76.6394;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';

async function getMysoreWeather() {
  if (!WEATHER_API_KEY) {
    return getSimulatedWeather();
  }
  
  try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${MYSURU_LAT}&lon=${MYSURU_LNG}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await response.json();
      return {
          condition: data.weather[0].main,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          isRaining: data.weather[0].main.toLowerCase().includes('rain'),
          windSpeed: data.wind.speed,
          visibility: data.visibility,
          monsoonMode: data.weather[0].main.toLowerCase().includes('rain') || data.main.humidity > 85
      };
  } catch (error) {
      console.error('Weather API error:', error);
      return getSimulatedWeather();
  }
}

function getSimulatedWeather() {
  const month = new Date().getMonth();
  // June (5) to Sept (8) = monsoon
  const isMonsoon = month >= 5 && month <= 8;
  
  return {
    condition: isMonsoon ? 'Rain' : 'Clear',
    temperature: isMonsoon ? 24 : 30,
    humidity: isMonsoon ? 90 : 45,
    isRaining: isMonsoon,
    windSpeed: isMonsoon ? 15 : 5,
    visibility: isMonsoon ? 2000 : 10000,
    monsoonMode: isMonsoon
  };
}

function getWeatherAdjustment(weather) {
  if (weather.isRaining || weather.monsoonMode) {
      return { factor: 0.8, label: 'Monsoon Mode' };
  } else if (weather.visibility < 5000) {
      return { factor: 0.9, label: 'Low Visibility' };
  }
  return { factor: 1.0, label: 'Clear Conditions' };
}

module.exports = { getMysoreWeather, getWeatherAdjustment };
