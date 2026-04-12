const axios = require('axios');

const JAVA_ENGINE_URL = process.env.JAVA_ENGINE_URL || 'http://localhost:8080/compute';
const ALGORITHMS = [
    { id: 'FCFS', timeQuantum: null },
    { id: 'SJF', timeQuantum: null },
    { id: 'SRTF', timeQuantum: null },
    { id: 'RR', timeQuantum: 4 },
    { id: 'PRIORITY', timeQuantum: null },
];

// In-memory store for last scan result (no DB required)
let lastScanResult = null;

exports.receiveScan = async (req, res) => {
    try {
        const { processes, scannedAt, machineName } = req.body;

        if (!processes || processes.length === 0) {
            return res.status(400).json({ error: 'No process data provided.' });
        }

        // Strip scanner-only fields to build scheduler-compatible list
        const schedulerProcesses = processes.map(p => ({
            id: p.id,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            priority: p.priority,
        }));

        // Keep metadata for display
        const processMetadata = processes.map(p => ({
            id: p.id,
            realName: p.realName || p.id,
            pid: p.pid,
            memoryMB: p.memoryMB,
            rawCpuSec: p.rawCpuSec,
        }));

        // Run all 5 algorithms concurrently against the Java engine
        const algoResults = await Promise.all(
            ALGORITHMS.map(async ({ id: algorithm, timeQuantum }) => {
                try {
                    const resp = await axios.post(JAVA_ENGINE_URL, {
                        algorithm,
                        timeQuantum: timeQuantum || 4,
                        processes: schedulerProcesses,
                    }, { timeout: 10000 });
                    return { algorithm, results: resp.data, error: null };
                } catch (err) {
                    return { algorithm, results: null, error: err.message };
                }
            })
        );

        lastScanResult = {
            scannedAt: scannedAt || new Date().toISOString(),
            machineName: machineName || 'Unknown PC',
            processCount: processes.length,
            processMetadata,
            comparisons: algoResults,
        };

        console.log(`[PC-SCAN] Received ${processes.length} processes from ${machineName}, ran all 5 algorithms.`);
        res.json({ success: true, processCount: processes.length });

    } catch (err) {
        console.error('[PC-SCAN] Error:', err.message);
        res.status(500).json({ error: 'Failed to process scan data.' });
    }
};

exports.getScanResult = (req, res) => {
    if (!lastScanResult) {
        return res.json({ hasScan: false });
    }
    res.json({ hasScan: true, ...lastScanResult });
};
