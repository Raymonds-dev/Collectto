import axios from 'axios';

const api = axios.create({
  baseURL: 'http://89.167.89.185:8080',
});
export default api;
