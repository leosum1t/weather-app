import { useEffect, useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeatherCondition = (code) => {
    const weatherCodes = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Rime Fog",
      51: "Light Drizzle",
      53: "Drizzle",
      55: "Heavy Drizzle",
      56: "Freezing Drizzle",
      57: "Heavy Freezing Drizzle",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      66: "Freezing Rain",
      67: "Heavy Freezing Rain",
      71: "Light Snow",
      73: "Snow",
      75: "Heavy Snow",
      77: "Snow Grains",
      80: "Light Showers",
      81: "Rain Showers",
      82: "Heavy Showers",
      85: "Snow Showers",
      86: "Heavy Snow Showers",
      95: "Thunderstorm",
      96: "Thunderstorm with Hail",
      99: "Heavy Thunderstorm",
    };

    return weatherCodes[code] || "Unknown";
  };

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error("Unable to search for the city.");
      }

      const locationData = await locationResponse.json();

      if (!locationData.results || locationData.results.length === 0) {
        throw new Error("City not found. Please try another city.");
      }

      const location = locationData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather information.");
      }

      const weatherData = await weatherResponse.json();
      setWeather({
        city: location.name,
        country: location.country,
        temperature: Math.round(weatherData.current.temperature_2m),
        humidity: weatherData.current.relative_humidity_2m,
        condition: getWeatherCondition(weatherData.current.weather_code),
        windSpeed: weatherData.current.wind_speed_10m,
        temperatureUnit: weatherData.current_units.temperature_2m,
        humidityUnit: weatherData.current_units.relative_humidity_2m,
        windUnit: weatherData.current_units.wind_speed_10m,
      });
    } catch (error) {
      setWeather(null);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeather(city);
  };

  return (
    <main className="min-h-screen bg-sky-50 px-5 py-10 text-slate-800">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl flex-col">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="title-font text-5xl text-sky-700 md:text-6xl">मौसम साथी</h1>

          <p className="mt-3 text-sm text-slate-500 md:text-base">Find weather anywhere, anytime</p>
        </header>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center border-2 border-sky-300 bg-white px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Search city..."
              className="w-full bg-transparent py-3.5 text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 border-2 border-sky-300 bg-white px-8 py-3.5 font-semibold text-sky-600 transition duration-200 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:border-sky-200 disabled:text-sky-300"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/*Loading animation */}
        {loading && (
          <div className="my-10 flex items-center justify-center gap-3 text-sky-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600"></span>
            <p className="font-medium">Loading weather...</p>
          </div>
        )}

        {/* Error Message Handling */}
        {!loading && error && (
          <div className="mx-auto my-10 w-full max-w-xl rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Weather Information */}
        {!loading && !error && weather && (
          <section className="mt-12">
            {/* Location */}
            <h2 className="flex items-center justify-center gap-2 text-center text-xl font-semibold text-slate-800 md:text-2xl">
              <i className="fa-solid fa-location-dot text-sky-600"></i>
              {weather.city}, {weather.country}
            </h2>

            {/* Temperature Card */}
            <div className="mx-auto mt-8 flex w-full max-w-sm overflow-hidden rounded-xl border-2 border-sky-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex flex-1 items-center justify-center gap-2 border-r-2 border-sky-200 px-5 py-5 font-semibold text-slate-700">
                <i className="fa-solid fa-temperature-three-quarters text-lg text-sky-600"></i>
                <span>Temperature</span>
              </div>

              <div className="flex items-center justify-center px-7 py-5 text-2xl font-bold text-sky-600">
                {weather.temperature}
                {weather.temperatureUnit}
              </div>
            </div>

            {/* Additional Weather Cards*/}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <WeatherCard
                icon={<i className="fa-solid fa-droplet text-sky-600"></i>}
                label="Humidity"
                value={`${weather.humidity}${weather.humidityUnit}`}
              />

              <WeatherCard
                icon={<i className="fa-solid fa-cloud-sun"></i>}
                label="Weather"
                value={weather.condition}
              />

              <WeatherCard
                icon={<i className="fa-solid fa-wind text-sky-600"></i>}
                label="Wind"
                value={`${weather.windSpeed} ${weather.windUnit}`}
              />
            </div>
        </section>
        )}

        <footer className="mt-auto  pt-10 text-center text-sm text-slate-500">
          <p>
             Powered by Open-Meteo API | Designed & Developed by Sumit Pokharel
          </p>
        </footer>
      </div>
    </main>
  );
}

function WeatherCard({ icon, label, value }) {
  return (
    <div className="flex min-h-20 overflow-hidden rounded-xl border-2 border-sky-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-1 items-center justify-center gap-2 border-r-2 border-sky-200 px-4 py-4 font-semibold text-slate-700">
        <div className="text-lg text-sky-600">{icon}</div>
        <span>{label}</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-4 text-center font-bold text-sky-600">
        {value}
      </div>
    </div>
  );
}

export default App;