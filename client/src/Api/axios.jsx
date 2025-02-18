import axios from "axios";

const instance = axios.create({
  baseURL: "http://119.59.101.86:3002/api", // เปลี่ยน localhost เป็น IP จริง
  headers: { "Content-Type": "application/json" },
});

export default instance;
