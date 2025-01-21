import axios from "axios";

const Axios = axios.create({
  baseURL: "http://localhost:3002/api", 
})

export default Axios;
