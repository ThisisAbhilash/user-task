const { Router } = require('express');
const healthController = require('./health.ctrl');

const router = Router();
router.get('/status', (req, res) => { res.json({ status: 'OK' }); });
router.get('/ping', healthController.ping);
router.get('/health', healthController.checkHealth);

module.exports = router;
