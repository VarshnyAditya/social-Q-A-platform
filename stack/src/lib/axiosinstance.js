import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return req;
});

// Feeds OfflineOverlay: a request that fails with no `error.response` at
// all never reached the server — that's a real connectivity failure, not
// a normal 4xx/5xx from the API, which should still just reject normally
// and be handled by whatever page made the call.
axiosInstance.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:online"));
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined" && !error.response) {
      window.dispatchEvent(new Event("app:offline"));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;