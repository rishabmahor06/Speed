import axios from "axios";

// Configure axios defaults
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add request interceptor to attach Authorization header from localStorage
// and let axios handle JSON serialization natively.
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
