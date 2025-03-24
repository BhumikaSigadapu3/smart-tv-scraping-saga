
const scraperService = require('../services/scraperService');

exports.scrapeAmazonProduct = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    // Validate URL format
    if (!url.includes('amazon.com')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Amazon URL'
      });
    }
    
    console.log('Received scraping request for URL:', url);
    const result = await scraperService.scrapeAmazonProduct(url);
    
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Controller error in scrapeAmazonProduct:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during scraping'
    });
  }
};

exports.verifyApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    const result = await scraperService.verifyApiKey(apiKey);
    
    return res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      message: result.message
    });
  } catch (error) {
    console.error('Controller error in verifyApiKey:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while verifying the API key'
    });
  }
};
