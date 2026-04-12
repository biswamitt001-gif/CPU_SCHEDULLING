import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const computeSchedule = async (data) => {
    const response = await api.post('/schedule', data);
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get('/schedule/history');
    return response.data;
};

export const getScanResult = async () => {
    const response = await api.get('/schedule/pc-scan/result');
    return response.data;
};

export const downloadScanner = () => {
    window.open('http://localhost:5000/api/download-scanner', '_blank');
};
