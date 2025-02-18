import axios from "axios";

const instance = axios.create({
  baseURL: "https://119.59.101.86:8000/Api_backend_maw/api/v1/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});


export default instance;
