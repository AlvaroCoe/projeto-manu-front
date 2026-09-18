import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});
// ... resto do arquivo continua igual