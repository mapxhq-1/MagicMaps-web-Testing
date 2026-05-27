let loadPromise = null;

export function getGooglePlacesApiKey() {
  return import.meta.env.VITE_GOOGLE_PLACES_API_KEY || "";
}

export function loadGoogleMapsPlaces() {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    return Promise.reject(
      new Error("VITE_GOOGLE_PLACES_API_KEY is not set. Add it to a .env file for place search.")
    );
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps JavaScript API"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
