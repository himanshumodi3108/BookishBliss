const development = {
    API_URL: "http://localhost:5000"
  };
  
  const production = {
    API_URL: "https://bookishbliss.onrender.com"  // Replace with your Render URL
  };
  
  const config = process.env.NODE_ENV === 'production' ? production : development;
  
  export default config;