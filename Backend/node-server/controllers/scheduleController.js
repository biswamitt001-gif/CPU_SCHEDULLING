const Simulation = require('../models/Simulation');
const axios = require('axios');
const mongoose = require('mongoose');

const JAVA_ENGINE_URL = process.env.JAVA_ENGINE_URL || 'http://localhost:8080/compute';

exports.computeSchedule = async (req, res) => {
    try {
        const { algorithm, timeQuantum, processes } = req.body;

        if (!algorithm || !processes || !processes.length) {
            return res.status(400).json({ error: 'Algorithm and processes are required.' });
        }

        const javaResponse = await axios.post(JAVA_ENGINE_URL, {
            algorithm,
            timeQuantum,
            processes
        });

        const results = javaResponse.data;

        if (mongoose.connection.readyState === 1) {
            const simulation = new Simulation({
                algorithm,
                timeQuantum,
                processes,
                results
            });
            await simulation.save();
            return res.json(simulation);
        } else {
            return res.json({
                algorithm,
                timeQuantum,
                processes,
                results,
                _id: 'local-run-no-db',
                createdAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error computing schedule:', error.message);
        res.status(500).json({ error: 'Failed to compute schedule.' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json([]);
        }
        const history = await Simulation.find().sort({ createdAt: -1 }).limit(50);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
};
