(function() {
  'use strict';
  
  const elements = {
    fetchBtn: document.getElementById('fetchBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    apiKey: document.getElementById('apiKey'),
    forecastList: document.getElementById('forecastList'),
    error: document.getElementById('error'),
    loading: document.getElementById('loading'),
    lastUpdated: document.getElementById('lastUpdated')
  };
  
  let lastFetchTime = null;
  
  function showError(message) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
    elements.loading.style.display = 'none';
    elements.refreshBtn.classList.remove('visible');
  }
  
  function hideError() {
    elements.error.style.display = 'none';
  }
  
  function showLoading() {
    elements.loading.style.display = 'block';
    elements.forecastList.innerHTML = '';
    hideError();
    elements.refreshBtn.classList.remove('visible');
  }
  
  function hideLoading() {
    elements.loading.style.display = 'none';
  }
  
  function formatDate(isoDate) {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }
  
  function updateLastUpdated() {
    const now = new Date();
    lastFetchTime = now;
    elements.lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
  
  function displayForecast(data) {
    if (!Array.isArray(data.list)) {
      throw new Error('Invalid API response format');
    }
    
    const dailyTemps = new Map();
    
    data.list.forEach(entry => {
      const date = entry.dt_txt.split(' ')[0];
      const temp = entry.main?.temp;
      
      if (typeof temp === 'number') {
        if (!dailyTemps.has(date)) {
          dailyTemps.set(date, []);
        }
        dailyTemps.get(date).push(temp);
      }
    });
    
    const sortedDates = Array.from(dailyTemps.keys()).sort().slice(0, 5);
    
    if (sortedDates.length === 0) {
      throw new Error('No forecast data available');
    }
    
    elements.forecastList.innerHTML = '';
    
    sortedDates.forEach(date => {
      const temps = dailyTemps.get(date);
      const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
      
      const listItem = document.createElement('li');
      listItem.className = 'forecast-item';
      
      listItem.innerHTML = `
        <div class="forecast-date">${formatDate(date)}</div>
        <div class="forecast-temp">${avgTemp.toFixed(1)}°C</div>
      `;
      
      elements.forecastList.appendChild(listItem);
    });
    
    updateLastUpdated();
    elements.refreshBtn.classList.add('visible');
  }
  
  async function fetchWeatherData() {
    const apiKey = elements.apiKey.value.trim();
    
    if (!apiKey) {
      showError('Please enter your OpenWeatherMap API key');
      return;
    }
    
    showLoading();
    
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=Jakarta&appid=${encodeURIComponent(apiKey)}&units=metric`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your key and try again.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      if (data.cod !== '200') {
        throw new Error(data.message || 'API returned an error');
      }
      
      displayForecast(data);
      hideLoading();
      
    } catch (error) {
      hideLoading();
      showError(`Failed to fetch weather data: ${error.message}`);
    }
  }
  
  function handleRefresh() {
    if (lastFetchTime) {
      fetchWeatherData();
    } else {
      showError('No data to refresh. Please fetch forecast first.');
    }
  }
  
  // Event listeners
  elements.fetchBtn.addEventListener('click', fetchWeatherData);
  elements.refreshBtn.addEventListener('click', handleRefresh);
  
  // Allow Enter key to trigger fetch
  elements.apiKey.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      fetchWeatherData();
    }
  });
  
  // Auto-focus API key input
  elements.apiKey.focus();
  
})();
