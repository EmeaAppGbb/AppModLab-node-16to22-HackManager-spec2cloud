const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');

/* GET home page / dashboard */
router.get('/', (req, res) => {
  try {
    const data = dashboardService.getStats();
    res.render('index', data);
  } catch (err) {
    logger.error({ err }, 'Dashboard error');
    res.render('error', { message: 'Error loading dashboard', error: err });
  }
});

module.exports = router;
