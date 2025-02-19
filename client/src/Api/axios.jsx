import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// ทดสอบการเชื่อมต่อ API
api.get('/checkapi')
    .then(response => console.log("✅ API Connected:", response.data))
    .catch(error => console.error("❌ API Connection Failed:", error));

export default api;
