const axios = require('axios');
axios.post('http://localhost:5000/api/schedule', {
    algorithm: 'FCFS',
    processes: [{ id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 }]
}).then(res => console.log('SUCCESS:', res.data.results)).catch(err => console.error('ERROR:', err.response?.data || err.message));
