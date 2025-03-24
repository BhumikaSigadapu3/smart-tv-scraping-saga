
const FirecrawlApp = require('@mendable/firecrawl-js').default;
require('dotenv').config();

// Get API key from environment variables
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

class ScraperService {
  constructor() {
    this.firecrawlApp = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
  }

  async verifyApiKey(apiKey) {
    try {
      // Create test instance with provided key
      const testApp = new FirecrawlApp({ apiKey });
      
      // Test the API key with a simple crawl request
      const testResponse = await testApp.crawlUrl('https://www.amazon.com', {
        limit: 1,
        scrapeOptions: {
          formats: ['text'],
          metadata: true  // Changed from extractMetadata to metadata
        }
      });
      
      return { 
        valid: testResponse.success, 
        message: testResponse.success ? 'API key is valid' : 'Invalid API key' 
      };
    } catch (error) {
      console.error('API key verification error:', error);
      return { valid: false, message: 'Error verifying API key' };
    }
  }

  async scrapeAmazonProduct(url) {
    try {
      console.log('Scraping Amazon URL:', url);
      
      const crawlResponse = await this.firecrawlApp.crawlUrl(url, {
        limit: 10,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          metadata: true  // Changed from extractMetadata to metadata
        }
      });

      if (!crawlResponse.success) {
        console.error('Crawl failed:', crawlResponse);
        throw new Error('Failed to crawl the provided URL');
      }

      console.log('Crawl successful with data count:', crawlResponse.data?.length || 0);
      
      // Process the crawled data
      const processedResults = this.processResults(crawlResponse.data, url);
      
      return {
        success: true,
        data: processedResults
      };
    } catch (error) {
      console.error('Scraping error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during scraping'
      };
    }
  }

  processResults(data, originalUrl) {
    if (!data || data.length === 0) {
      console.warn('No data received from crawl');
      return [];
    }

    // Extract product information from crawled data
    return data.map(item => {
      const metadata = item.metadata || {};
      const htmlContent = item.html || "";
      const textContent = item.markdown || item.content || "";
      const content = htmlContent + "\n" + textContent;
      
      return {
        title: this.extractTitle(content, metadata),
        price: this.extractPrice(content, metadata),
        rating: this.extractRating(content, metadata),
        numRatings: this.extractNumRatings(content),
        discount: this.extractDiscount(content),
        bankOffers: this.extractBankOffers(content),
        aboutItem: this.extractAboutItem(content),
        productInfo: this.extractProductInfo(content),
        imageUrls: this.extractProductImages(content, metadata),
        manufacturerImages: this.extractManufacturerImages(content),
        reviewSummary: this.generateReviewSummary(content),
        link: item.url || originalUrl
      };
    }).filter(product => 
      product.title && 
      (product.price || product.rating || product.imageUrls.length > 0)
    );
  }

  extractTitle(content, metadata) {
    if (metadata.title) return metadata.title;
    if (metadata.ogTitle) return metadata.ogTitle;
    
    const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                      content.match(/id="productTitle"[^>]*>([^<]+)<\/span>/i);
    
    return (titleMatch && titleMatch[1].trim()) || 'Unknown Product';
  }

  extractPrice(content, metadata) {
    if (metadata.price) return metadata.price;
    
    const priceMatches = [
      content.match(/deal-price.*?[\$₹]\s?([\d,]+\.?\d*)|[\$₹]\s?([\d,]+\.?\d*)/i),
      content.match(/\$\s?([\d,]+\.?\d*)/i),
      content.match(/class="a-price"[^>]*>([^<]+)/i)
    ];
    
    for (const match of priceMatches) {
      if (match) {
        const price = match[1] || match[2];
        if (price) {
          return match[0].includes('₹') ? `₹${price}` : `$${price}`;
        }
      }
    }
    
    return 'Price unavailable';
  }

  extractRating(content, metadata) {
    if (metadata.rating) return metadata.rating;
    
    const ratingMatch = content.match(/(\d+\.?\d*)\s*out of\s*\d+\s*stars/i);
    return ratingMatch ? ratingMatch[1] : 'No ratings';
  }

  extractNumRatings(content) {
    const reviewCountMatch = content.match(/([\d,]+)\s*ratings/i) || 
                            content.match(/([\d,]+)\s*reviews/i);
    return reviewCountMatch ? reviewCountMatch[1] : '0';
  }

  extractDiscount(content) {
    const discountMatch = content.match(/(\d+%)\s*off/i);
    return discountMatch ? discountMatch[1] : 'No discount';
  }

  extractBankOffers(content) {
    // Extract bank offers from content
    const bankOffersSection = content.match(/bank offers?:?\s*(.*?)(?:\n\n|\n\w|<\/)/is);
    
    if (bankOffersSection && bankOffersSection[1]) {
      return bankOffersSection[1]
        .split(/\n|•|<li>|<br>/)
        .map(offer => offer.replace(/<[^>]+>/g, '').trim())
        .filter(offer => offer.length > 5);
    }
    
    return ['No bank offers available'];
  }

  extractAboutItem(content) {
    const aboutSection = content.match(/about this item:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is);
    
    if (aboutSection && aboutSection[1]) {
      return aboutSection[1]
        .split(/\n|•|<li>|<br>/)
        .map(item => item.replace(/<[^>]+>/g, '').trim())
        .filter(item => item.length > 3);
    }
    
    // Try matching list items
    const bulletLists = content.match(/<ul[^>]*>(.*?)<\/ul>/gis);
    if (bulletLists) {
      for (const list of bulletLists) {
        if (list.toLowerCase().includes('feature') || list.toLowerCase().includes('about')) {
          const listItems = list.match(/<li[^>]*>(.*?)<\/li>/gi);
          if (listItems) {
            return listItems
              .map(item => item.replace(/<[^>]*>/g, '').trim())
              .filter(item => item.length > 3);
          }
        }
      }
    }
    
    return ['No product details available'];
  }

  extractProductInfo(content) {
    const productInfo = {};
    
    // Look for tables with product specs
    const tables = content.match(/<table[^>]*>(.*?)<\/table>/gis);
    if (tables) {
      for (const table of tables) {
        const rows = table.match(/<tr[^>]*>(.*?)<\/tr>/gis);
        if (rows) {
          for (const row of rows) {
            const cells = row.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi);
            if (cells && cells.length >= 2) {
              const key = cells[0].replace(/<[^>]*>/g, '').trim();
              const value = cells[1].replace(/<[^>]*>/g, '').trim();
              if (key && value) {
                productInfo[key] = value;
              }
            }
          }
        }
      }
    }
    
    return productInfo;
  }

  extractProductImages(content, metadata) {
    let images = [];
    
    // Try metadata first
    if (metadata.images && Array.isArray(metadata.images)) {
      images = [...metadata.images];
    } else if (metadata.image) {
      images.push(metadata.image);
    }
    
    // Extract image URLs from img tags
    const imgRegex = /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      const imgUrl = match[1];
      // Only include Amazon images and filter out small icons
      if (imgUrl.includes('amazon') && 
          !imgUrl.includes('icon') && 
          !imgUrl.includes('logo') && 
          !images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    }
    
    return images.filter(url => url && url.length > 10);
  }

  extractManufacturerImages(content) {
    // Look for manufacturer section images
    const manufacturerSection = content.match(/from the manufacturer:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is);
    let images = [];
    
    if (manufacturerSection && manufacturerSection[1]) {
      const imgRegex = /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(manufacturerSection[1])) !== null) {
        const imgUrl = match[1];
        if (!imgUrl.includes('icon') && !imgUrl.includes('logo') && !images.includes(imgUrl)) {
          images.push(imgUrl);
        }
      }
    }
    
    return images.filter(url => url && url.length > 10);
  }

  generateReviewSummary(content) {
    const reviewSection = content.match(/customer reviews:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is);
    
    if (reviewSection && reviewSection[1]) {
      const cleanText = reviewSection[1].replace(/<[^>]*>/g, ' ').trim();
      const sentences = cleanText.split(/\.\s*/);
      
      if (sentences.length > 1) {
        return sentences.slice(0, 2).join('. ') + '.';
      }
      return cleanText;
    }
    
    return 'No review summary available';
  }
}

module.exports = new ScraperService();
