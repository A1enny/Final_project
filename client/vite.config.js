import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0', // เปิดให้ทุกอุปกรณ์ในเครือข่ายเข้าถึงได้
<<<<<<< HEAD
    port: 5173,
    proxy:{
      "/api":{
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      }
    }
=======
    port: 5173
>>>>>>> aa67cf38adf46127e5e9cfbd296caddeae48492a
  }
});
