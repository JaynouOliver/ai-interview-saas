import axios from "axios"

const api = axios.create({
  baseURL: process.env.API_URL,
  //   timeout: 10000,
  // headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
