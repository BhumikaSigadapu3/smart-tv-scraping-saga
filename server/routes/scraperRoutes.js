
const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Route to scrape Amazon product
router.post('/amazon', scraperController.scrapeAmazonProduct);

// Route to check API key validity
router.post('/verify-key', scraperController.verifyApiKey);

module.exports = router;
