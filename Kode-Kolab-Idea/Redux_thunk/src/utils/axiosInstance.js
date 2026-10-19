import axios from 'axios';

const instance = axios.create({
    baseURL: "https://api.algodive-admin.com/api", // here url is of your backend
    timeout: 8000,
});

instance.interceptors.request.use((config) =>{ // interceptors are used to intercept requests before they are sent
    const token = localStorage.getItem('adminToken'); // Assuming the token is stored in localStorage
    // If you are using sessionStorage or cookies, adjust accordingly
    if(token){
        config.headers.authorization = 'Bearer ${token}'; // Use template literals for string interpolation
    }
    return config;
});

export default instance;
