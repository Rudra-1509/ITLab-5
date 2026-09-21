// Runtime environment configuration for local development / non-docker environments
window.__ENV__ = window.__ENV__ || {
  VITE_API_URL: "http://localhost:5000/api",
  VITE_SOCKET_URL: "http://localhost:5000"
};
