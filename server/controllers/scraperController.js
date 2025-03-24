
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
    
    console.log(`Attempting to scrape URL: ${url}`);
    const results = await scraperService.scrapeAmazonProduct(url);
    
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in scrapeAmazonProduct controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while scraping the product'
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
    
    const isValid = await scraperService.verifyApiKey(apiKey);
    
    return res.status(200).json({
      success: true,
      isValid
    });
  } catch (error) {
    console.error('Error in verifyApiKey controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while verifying the API key'
    });
  }
};
