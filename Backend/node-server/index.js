require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cpu-scheduler';

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/schedule', scheduleRoutes);

// Download scanner agent as a zip file
app.get('/api/download-scanner', (req, res) => {
    const agentDir = path.join(__dirname, 'scanner-agent');
    const ps1 = path.join(agentDir, 'SchedSim-Scanner.ps1');
    const bat = path.join(agentDir, 'Run-Scanner.bat');

    if (!fs.existsSync(ps1)) {
        return res.status(404).json({ error: 'Scanner agent files not found.' });
    }

    // Stream a simple combined script download (bat file)
    res.setHeader('Content-Disposition', 'attachment; filename="SchedSim-Scanner.zip"');
    res.setHeader('Content-Type', 'application/zip');

    // Use archiver if available, otherwise stream bat
    try {
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        archive.file(ps1, { name: 'SchedSim-Scanner.ps1' });
        archive.file(bat, { name: 'Run-Scanner.bat' });
        archive.finalize();
    } catch {
        // Fallback: send the bat file directly
        res.setHeader('Content-Disposition', 'attachment; filename="Run-Scanner.bat"');
        res.setHeader('Content-Type', 'application/octet-stream');
        fs.createReadStream(bat).pipe(res);
    }
});

mongoose.connect(MONGO_URI)
    .then(() => { console.log('Connected to MongoDB'); })
    .catch((err) => { console.error('MongoDB connection error. Starting without Database:', err.message); });

// Always start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
