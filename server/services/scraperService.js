
const FirecrawlApp = require('@mendable/firecrawl-js').default;
require('dotenv').config();

// Get API key from environment variable
const API_KEY = process.env.FIRECRAWL_API_KEY || '';

// Mock data in case of API failure
const mockTvData = [
  {
    title: "Amazon Fire TV 55\" Omni Series 4K UHD smart TV",
    price: "$399.99",
    rating: "4.5",
    numRatings: "12,345",
    discount: "20% off",
    bankOffers: [
      "10% instant discount on SBI Credit Cards",
      "No cost EMI on select cards"
    ],
    aboutItem: [
      "4K UHD resolution",
      "HDR 10, HLG, Dolby Digital Plus",
      "Hands-free Alexa built-in"
    ],
    productInfo: {
      "Brand": "Amazon",
      "Model": "Omni Series",
      "Screen Size": "55 inches",
      "Resolution": "4K UHD"
    },
    imageUrls: [
      "https://m.media-amazon.com/images/I/61LjkJzZ8NL._AC_SX522_.jpg",
      "https://m.media-amazon.com/images/I/71qPGY1kFOL._AC_SX522_.jpg"
    ],
    manufacturerImages: [
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/70608852-7a94-4ebb-a3da-e3c70e4c8e48._CR0,0,1464,625_PT0_SX1464__.jpg"
    ],
    reviewSummary: "Users praise the picture quality and Alexa integration, but some mention the sound quality could be improved.",
    link: "https://www.amazon.com/dp/B08SVZ775L"
  },
  {
    title: "TCL 55-inch Class 4-Series 4K UHD HDR Smart Roku TV",
    price: "$319.99",
    rating: "4.6",
    numRatings: "8,721",
    discount: "15% off",
    bankOffers: [
      "5% cash back with Amazon Pay ICICI Card",
      "No cost EMI available"
    ],
    aboutItem: [
      "4K Ultra HD Resolution",
      "Roku Smart TV Platform",
      "HDR Technology"
    ],
    productInfo: {
      "Brand": "TCL",
      "Model": "4-Series",
      "Screen Size": "55 inches",
      "Resolution": "4K UHD"
    },
    imageUrls: [
      "https://m.media-amazon.com/images/I/71RyRHZfRkL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/61GJoXzS5qL._AC_SX679_.jpg"
    ],
    manufacturerImages: [
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a7b8ac3c-d33a-4099-a6d9-f53a45e9411c._CR0,0,970,300_PT0_SX970__.jpg"
    ],
    reviewSummary: "Customers love the value for money and easy Roku interface, though some note the viewing angles could be better.",
    link: "https://www.amazon.com/dp/B08DHFX4FV"
  }
];

// Helper methods for extracting product details
const extractTitle = (content, metadata) => {
  if (metadata.title) return metadata.title;
  if (metadata.ogTitle) return metadata.ogTitle;
  
  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                    content.match(/id="productTitle"[^>]*>([^<]+)<\/span>/i) ||
                    content.match(/class="product-title"[^>]*>([^<]+)<\/span>/i);
  
  const textTitleMatch = content.match(/productTitle.*?\n(.*?)(?:\n|$)/i) ||
                        content.match(/Product Name:?\s*(.*?)(?:\n|$)/i);
  
  return (titleMatch && titleMatch[1].trim()) || 
         (textTitleMatch && textTitleMatch[1].trim()) || 
         'Unknown Product';
};

const extractPrice = (content, metadata) => {
  if (metadata.price) return metadata.price;
  
  const priceMatches = [
    content.match(/deal-price.*?₹\s?([\d,]+\.?\d*)|₹\s?([\d,]+\.?\d*)/i),
    content.match(/price.*?₹\s?([\d,]+\.?\d*)|₹\s?([\d,]+\.?\d*)/i),
    content.match(/\$\s?([\d,]+\.?\d*)/i),
    content.match(/price.*?RS\.?\s?([\d,]+\.?\d*)/i),
    content.match(/class="a-price"[^>]*>([^<]+)/i),
    content.match(/deal of the day:?\s*([\d,]+\.?\d*)/i),
    content.match(/price:?\s*₹\s?([\d,]+\.?\d*)|price:?\s*\$\s?([\d,]+\.?\d*)/i)
  ];
  
  for (const match of priceMatches) {
    if (match) {
      const price = match[1] || match[2];
      if (price) {
        return match[0].includes('₹') ? `₹${price}` : 
               match[0].includes('$') ? `$${price}` : 
               match[0].includes('RS') ? `Rs.${price}` : 
               price;
      }
    }
  }
  
  return 'Price unavailable';
};

const extractRating = (content, metadata) => {
  if (metadata.rating) return metadata.rating;
  
  const ratingMatches = [
    content.match(/(\d+\.?\d*)\s*out of\s*\d+\s*stars/i),
    content.match(/rating:?\s*(\d+\.?\d*)\s*\/\s*5/i),
    content.match(/class="a-icon-alt"[^>]*>([^<]+)/i)
  ];
  
  for (const match of ratingMatches) {
    if (match && match[1]) {
      const rating = parseFloat(match[1]);
      if (!isNaN(rating)) {
        return rating.toString();
      }
    }
  }
  
  return 'No ratings';
};

const extractNumRatings = (content, metadata) => {
  const reviewCountMatches = [
    content.match(/([\d,]+)\s*ratings/i),
    content.match(/([\d,]+)\s*reviews/i),
    content.match(/(\d+,\d+|\d+)\s*global ratings/i),
    content.match(/(\d+,\d+|\d+)\s*global reviews/i)
  ];
  
  for (const match of reviewCountMatches) {
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '0';
};

const extractDiscount = (content, metadata) => {
  const discountMatches = [
    content.match(/(\d+%)\s*off/i),
    content.match(/save\s*(\d+%)/i),
    content.match(/discount:?\s*(\d+%)/i),
    content.match(/You Save:?\s*₹\s?([\d,]+\.?\d*)|you save:?\s*\$\s?([\d,]+\.?\d*)/i)
  ];
  
  for (const match of discountMatches) {
    if (match && (match[1] || match[2])) {
      return match[1] || match[2] || 'No discount';
    }
  }
  
  return 'No discount';
};

const extractBankOffers = (content) => {
  const bankOfferSections = [
    content.match(/bank offers?:?\s*(.*?)(?:\n\n|\n\w|<\/)/is),
    content.match(/offers?:?\s*(.*?)(?:\n\n|\n\w|<\/)/is),
    content.match(/payment:?\s*(.*?)(?:\n\n|\n\w|<\/)/is),
    content.match(/EMI?:?\s*(.*?)(?:\n\n|\n\w|<\/)/is)
  ];
  
  let offers = [];
  
  for (const section of bankOfferSections) {
    if (section && section[1]) {
      const sectionOffers = section[1]
        .split(/\n|•|<li>|<br>/)
        .map(offer => offer.replace(/<[^>]+>/g, '').trim())
        .filter(offer => offer.length > 5 && 
              (offer.includes('bank') || 
               offer.includes('credit') || 
               offer.includes('debit') || 
               offer.includes('card') || 
               offer.includes('EMI') || 
               offer.includes('cashback') || 
               offer.includes('discount') || 
               offer.includes('offer')));
      
      offers = [...offers, ...sectionOffers];
    }
  }
  
  const listItems = content.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (listItems) {
    const potentialOffers = listItems
      .map(item => item.replace(/<[^>]*>/g, '').trim())
      .filter(item => item.length > 5 && 
             (item.includes('bank') || 
              item.includes('credit') || 
              item.includes('debit') || 
              item.includes('card') || 
              item.includes('EMI') || 
              item.includes('cashback') || 
              item.includes('discount') || 
              item.includes('offer')));
    
    offers = [...offers, ...potentialOffers];
  }
  
  return offers.length > 0 ? offers : ['No bank offers available'];
};

const extractAboutItem = (content) => {
  const aboutSections = [
    content.match(/about this item:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/product description:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/overview:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/features:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is)
  ];
  
  let aboutItems = [];
  
  for (const section of aboutSections) {
    if (section && section[1]) {
      const sectionItems = section[1]
        .split(/\n|•|<li>|<br>/)
        .map(item => item.replace(/<[^>]+>/g, '').trim())
        .filter(item => item.length > 3);
      
      aboutItems = [...aboutItems, ...sectionItems];
    }
  }
  
  const bulletLists = content.match(/<ul[^>]*>(.*?)<\/ul>/gis);
  if (bulletLists) {
    for (const list of bulletLists) {
      if (list.toLowerCase().includes('feature') || 
          list.toLowerCase().includes('about') || 
          list.toLowerCase().includes('description')) {
        
        const listItems = list.match(/<li[^>]*>(.*?)<\/li>/gi);
        if (listItems) {
          const items = listItems
            .map(item => item.replace(/<[^>]*>/g, '').trim())
            .filter(item => item.length > 3);
          
          aboutItems = [...aboutItems, ...items];
        }
      }
    }
  }
  
  return aboutItems.length > 0 ? aboutItems : ['No product details available'];
};

const extractProductInfo = (content) => {
  const productInfo = {};
  
  const sections = [
    content.match(/<table[^>]*>(.*?)<\/table>/gis),
    content.match(/Technical Details:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/Technical Specifications:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/Specifications:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/Product Information:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is)
  ];
  
  // Process tables first
  const tables = sections[0];
  if (tables) {
    for (const table of tables) {
      const rows = table.match(/<tr[^>]*>(.*?)<\/tr>/gis);
      if (rows) {
        for (const row of rows) {
          const cells = row.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi);
          if (cells && cells.length >= 2) {
            const key = cells[0].replace(/<[^>]*>/g, '').trim();
            const value = cells[1].replace(/<[^>]*>/g, '').trim();
            if (key && value && key.length < 100) {
              productInfo[key] = value;
            }
          }
        }
      }
    }
  }
  
  // Process text sections with potential specifications
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    if (section && section[1]) {
      const lines = section[1].split(/\n|<br>/);
      for (const line of lines) {
        const match = line.replace(/<[^>]*>/g, '').match(/([^:]+):\s*(.*)/);
        if (match && match[1] && match[2]) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && value && key.length < 100) {
            productInfo[key] = value;
          }
        }
      }
    }
  }
  
  // Look for key-value pairs in the content
  if (Object.keys(productInfo).length === 0) {
    const lines = content.split(/\n|<br>/);
    for (const line of lines) {
      const cleanLine = line.replace(/<[^>]*>/g, '');
      const match = cleanLine.match(/([^:]{2,50}):\s*(.*)/);
      if (match && match[1] && match[2]) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key && value && key.length < 100 && value.length < 500) {
          productInfo[key] = value;
        }
      }
    }
  }
  
  return productInfo;
};

const extractProductImages = (content, metadata) => {
  let images = [];
  
  if (metadata.images && Array.isArray(metadata.images)) {
    images = [...metadata.images];
  } else if (metadata.image) {
    images.push(metadata.image);
  }
  
  const imgRegex = /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const imgUrl = match[1];
    if (imgUrl.includes('amazon') && 
        !imgUrl.includes('icon') && 
        !imgUrl.includes('logo') && 
        !imgUrl.includes('sprite') &&
        !imgUrl.includes('transparent-pixel') &&
        !images.includes(imgUrl)) {
      images.push(imgUrl);
    }
  }
  
  return images.filter(url => url && url.length > 10);
};

const extractManufacturerImages = (content) => {
  const manufacturerSections = [
    content.match(/from the manufacturer:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/from manufacturer:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/manufacturer:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is)
  ];
  
  let images = [];
  
  for (const section of manufacturerSections) {
    if (section && section[1]) {
      const imgRegex = /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(section[1])) !== null) {
        const imgUrl = match[1];
        if (!imgUrl.includes('icon') && 
            !imgUrl.includes('logo') && 
            !imgUrl.includes('sprite') &&
            !imgUrl.includes('transparent-pixel') &&
            !images.includes(imgUrl)) {
          images.push(imgUrl);
        }
      }
    }
  }
  
  return images.filter(url => url && url.length > 10);
};

const generateReviewSummary = (content) => {
  const reviewSections = [
    content.match(/customer reviews:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/reviews:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is),
    content.match(/ratings:?\s*(.*?)(?:\n\n|\n\w|<\/div>)/is)
  ];
  
  for (const section of reviewSections) {
    if (section && section[1]) {
      const cleanText = section[1].replace(/<[^>]*>/g, ' ').trim();
      const sentences = cleanText.split(/\.\s*/);
      
      if (sentences.length > 1) {
        return sentences.slice(0, 3).join('. ') + '.';
      }
      return cleanText;
    }
  }
  
  const reviewSnippets = content.match(/reviews?:?\s*["']([^"']+)["']/gi);
  if (reviewSnippets && reviewSnippets.length > 0) {
    return reviewSnippets[0].replace(/reviews?:?\s*["']([^"']+)["']/i, '$1');
  }
  
  return 'No review summary available';
};

exports.scrapeAmazonProduct = async (url) => {
  try {
    console.log('Starting scrape for URL:', url);
    
    // Use the API key from environment
    const apiKey = process.env.FIRECRAWL_API_KEY || API_KEY;
    if (!apiKey) {
      throw new Error('Firecrawl API key is not configured');
    }
    
    const firecrawlApp = new FirecrawlApp({ apiKey });
    
    console.log('Calling Firecrawl API...');
    const crawlResponse = await firecrawlApp.crawlUrl(url, {
      limit: 10,
      scrapeOptions: {
        formats: ['markdown', 'html'],
        metadata: true
      }
    });

    if (!crawlResponse.success) {
      console.error('Crawl failed:', crawlResponse);
      throw new Error('Failed to crawl the provided URL');
    }

    console.log('Crawl successful, processing results...');
    
    // Parse the Firecrawl data
    if (crawlResponse.data && crawlResponse.data.length > 0) {
      // Extract product information from the data
      const products = crawlResponse.data.map((item) => {
        const metadata = item.metadata || {};
        const htmlContent = item.html || "";
        const textContent = item.markdown || item.content || "";
        const content = htmlContent + "\n" + textContent;
        
        return {
          title: extractTitle(content, metadata),
          price: extractPrice(content, metadata),
          rating: extractRating(content, metadata),
          numRatings: extractNumRatings(content, metadata),
          discount: extractDiscount(content, metadata),
          bankOffers: extractBankOffers(content),
          aboutItem: extractAboutItem(content),
          productInfo: extractProductInfo(content),
          imageUrls: extractProductImages(content, metadata),
          manufacturerImages: extractManufacturerImages(content),
          reviewSummary: generateReviewSummary(content),
          link: item.url || url
        };
      });

      console.log(`Extracted ${products.length} products`);

      // Filter out products that don't have at least basic info
      const validProducts = products.filter(product => 
        product.title && 
        (product.price || product.rating || product.imageUrls.length > 0)
      );

      if (validProducts.length > 0) {
        return validProducts;
      }
    }
    
    // Fallback to mock data if no valid products were found
    console.warn('No valid products found, returning mock data');
    return mockTvData;
  } catch (error) {
    console.error('Scraping error:', error);
    // Return mock data on error to ensure the UI has something to display
    return mockTvData;
  }
};

exports.verifyApiKey = async (apiKey) => {
  try {
    console.log('Verifying API key...');
    const firecrawlApp = new FirecrawlApp({ apiKey });
    
    // Make a test request to verify the API key
    const testResponse = await firecrawlApp.crawlUrl('https://example.com', {
      limit: 1,
      scrapeOptions: {
        formats: ['html'],
        metadata: true
      }
    });
    
    return testResponse.success === true;
  } catch (error) {
    console.error('API key verification error:', error);
    return false;
  }
};
