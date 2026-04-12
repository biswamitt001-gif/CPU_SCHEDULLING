const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
    algorithm: {
        type: String,
        required: true,
        enum: ['FCFS', 'SJF', 'RR', 'Priority']
    },
    timeQuantum: {
        type: Number,
        required: function () { return this.algorithm === 'RR'; }
    },
    processes: [{
        id: String,
        arrivalTime: Number,
        burstTime: Number,
        priority: { type: Number, default: 0 }
    }],
    results: {
        ganttChart: [{
            processId: String,
            startTime: Number,
            endTime: Number
        }],
        metrics: [{
            processId: String,
            completionTime: Number,
            turnaroundTime: Number,
            waitingTime: Number
        }],
        averageWaitingTime: Number,
        averageTurnaroundTime: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Simulation', simulationSchema);
