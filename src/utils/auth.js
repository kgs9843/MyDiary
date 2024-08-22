import { jwtDecode } from 'jwt-decode';
import api from './api'

export const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp > currentTime;
    } catch (error) {
        console.error('Invalid token:', error);
        return false;
    }
};

export const refreshToken = async () => {
    try {
        const response = await api.post('/token');
        return response.data.token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};


export const getToken = async () => {
    let token = localStorage.getItem('token');


    if (token) {
        token = await refreshToken();
        if (token) {
            localStorage.setItem('token', token);
        }
    }
}