import requests
from datetime import datetime
from collections import defaultdict

# General Config
API_KEY = "975fbdc0e0a737ed51e38e795d1a3f7a"  
CITY = "Jakarta"
URL = f"http://api.openweathermap.org/data/2.5/forecast?q={CITY}&appid={API_KEY}&units=metric"

response = requests.get(URL)
data = response.json()

# Group temps by date
daily_temps = defaultdict(list)
for entry in data['list']:
    date_str = entry['dt_txt'].split(' ')[0]
    daily_temps[date_str].append(entry['main']['temp'])

# Display only 5 days
print("Weather Forecast:")
for date_str, temps in list(daily_temps.items())[:5]:
    avg_temp = sum(temps) / len(temps)
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    print(f"{date_obj.strftime('%a, %d %b %Y')}: {avg_temp:.2f}°C")
