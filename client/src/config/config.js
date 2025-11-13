// Use environment variable if available, otherwise fallback to defaults
const getApiUrl = () => {
  // Check for VITE_API_URL (Vite convention)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check for VITE_BACKEND_URL (alternative naming)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Fallback to defaults based on environment
  if (import.meta.env.PROD) {
    return "https://bookishbliss.onrender.com";
  }
  return "http://localhost:5000";
};

const config = {
  API_URL: getApiUrl()
};

export default config;