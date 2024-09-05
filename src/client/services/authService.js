import axios from 'axios';

export const authService = {
    login: async (username, password, rememberMe) => {
        const response = await axios.post('/auth/login', { username, password, rememberMe });
        return response.data;
    },
    logout: async () => {
        await axios.post('/auth/logout');
    },
    register: async (username, password) => {
        const response = await axios.post('/auth/register', { username, password });
        return response.data;
    },
    authenticate: async () => {
        const response = await axios.get('/auth/authenticate', {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        return response.data;
    },
    authenticateAdmin: async () => {
        const response = await axios.get('/auth/authenticate', {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        return response.data;
    },
};
