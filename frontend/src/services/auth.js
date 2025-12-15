import api from './api';
import axios from 'axios'; // We might need a separate instance or use direct paths since Auth is at /auth not /api

// However, proxy rewrites /auth too.
const authApi = axios.create({
    baseURL: '/auth',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const login = async (email, password) => {
    const response = await authApi.post('/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const signup = async (name, email, password) => {
    const response = await authApi.post('/signup', { name, email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};
