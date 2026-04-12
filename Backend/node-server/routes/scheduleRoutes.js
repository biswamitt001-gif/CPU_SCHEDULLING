const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const pcScanController = require('../controllers/pcScanController');

// Manual simulation routes
router.post('/', scheduleController.computeSchedule);
router.get('/history', scheduleController.getHistory);

// PC Scanner routes
router.post('/pc-scan', pcScanController.receiveScan);
router.get('/pc-scan/result', pcScanController.getScanResult);

module.exports = router;
