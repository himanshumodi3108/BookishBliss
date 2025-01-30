const development = {
  API_URL: "http://localhost:5000"
};

const production = {
  API_URL: "https://bookishbliss.onrender.com:443"  // Your Render backend URL
};

const config = import.meta.env.PROD ? production : development;

export default config;