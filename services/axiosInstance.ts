// services/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:30010", // <-- your base URL
  timeout: 10000, // optional: timeout in ms
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
