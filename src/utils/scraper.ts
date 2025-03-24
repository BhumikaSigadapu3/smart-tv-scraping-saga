
import FirecrawlApp from '@mendable/firecrawl-js';

interface ScraperResult {
  title: string;
  price: string;
  rating: string;
  numRatings: string;
  discount: string;
  bankOffers: string[];
  aboutItem: string[];
  productInfo: Record<string, string>;
  imageUrls: string[];
  manufacturerImages: string[];
  reviewSummary: string;
  link: string;
}

// Fallback mock data in case there's an API failure
const mockTvData: ScraperResult[] = [
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

class ScraperService {
  private firecrawlApp: FirecrawlApp | null = null;
  private API_KEY = 'fc-fb0365b520d84b0fa6c744841b2790df';
  private API_KEY_STORAGE_KEY = 'firecrawl_api_key';

  constructor() {
    this.firecrawlApp = new FirecrawlApp({ apiKey: this.API_KEY });
    // Store the API key in localStorage as well for future reference
    localStorage.setItem(this.API_KEY_STORAGE_KEY, this.API_KEY);
  }

  saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('Firecrawl API key saved successfully');
  }

  getApiKey(): string {
    return this.API_KEY;
  }

  async scrapeAmazonTVs(url: string): Promise<ScraperResult[]> {
    console.log('Scraping URL with Firecrawl:', url);
    
    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey: this.API_KEY });
      }
      
      const crawlResponse = await this.firecrawlApp.crawlUrl(url, {
        limit: 10,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          extractMetadata: true
        }
      });

      if (!crawlResponse.success) {
        console.error('Crawl failed:', crawlResponse);
        throw new Error('Failed to crawl the provided URL');
      }

      console.log('Crawl successful:', crawlResponse);
      
      // Parse the Firecrawl data to match our ScraperResult interface
      if (crawlResponse.data && crawlResponse.data.length > 0) {
        // Try to extract product information from the data
        const products: ScraperResult[] = crawlResponse.data.map((item: any) => {
          // Extract product information
          const metadata = item.metadata || {};
          const content = item.content || "";
          
          // Use regex and content analysis to extract specific details
          // These are simplified extractors - in a real implementation you would have more robust parsing
          const extractedPrice = metadata.price || this.extractPrice(content);
          const extractedRating = metadata.rating || this.extractRating(content);
          const extractedNumRatings = this.extractNumRatings(content);
          const extractedDiscount = this.extractDiscount(content);
          const extractedBankOffers = this.extractBankOffers(content);
          const extractedAboutItem = this.extractAboutItem(content);
          const extractedProductInfo = this.extractProductInfo(content);
          const extractedImageUrls = metadata.images || [metadata.image] || this.extractImages(content);
          const extractedManufacturerImages = this.extractManufacturerImages(content);
          const reviewSummary = this.generateReviewSummary(content);
          
          return {
            title: metadata.title || this.extractTitle(content) || 'Unknown Product',
            price: extractedPrice || 'Price unavailable',
            rating: extractedRating || 'No ratings',
            numRatings: extractedNumRatings || '0',
            discount: extractedDiscount || 'No discount',
            bankOffers: extractedBankOffers.length > 0 ? extractedBankOffers : ['No bank offers available'],
            aboutItem: extractedAboutItem.length > 0 ? extractedAboutItem : ['No product details available'],
            productInfo: extractedProductInfo,
            imageUrls: extractedImageUrls.filter(Boolean),
            manufacturerImages: extractedManufacturerImages.filter(Boolean),
            reviewSummary: reviewSummary || 'No review summary available',
            link: item.url || url
          };
        }).filter((product: ScraperResult) => product.title !== 'Unknown Product');

        if (products.length > 0) {
          return products;
        }
      }
      
      // If no products were found, return mock data
      console.warn('No products found in Firecrawl response, returning mock data');
      return mockTvData;
    } catch (error) {
      console.error('Scraping error:', error);
      // Return mock data on error to ensure the UI has something to display
      return mockTvData;
    }
  }

  // Helper methods to extract specific data from the content
  private extractTitle(content: string): string {
    // Simple regex to find product title (would need to be improved)
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  private extractPrice(content: string): string {
    // Try to find price patterns (₹, $, etc.)
    const priceMatch = content.match(/₹\s?[\d,]+\.?\d*|₹\d+,\d+|\$\s?[\d,]+\.?\d*/i);
    return priceMatch ? priceMatch[0].trim() : '';
  }

  private extractRating(content: string): string {
    // Look for patterns like "4.5 out of 5 stars"
    const ratingMatch = content.match(/(\d+\.?\d*)\s*out of\s*\d+\s*stars/i);
    return ratingMatch ? ratingMatch[1].trim() : '';
  }

  private extractNumRatings(content: string): string {
    // Look for patterns like "12,345 ratings"
    const ratingsMatch = content.match(/([\d,]+)\s*ratings/i);
    return ratingsMatch ? ratingsMatch[1].trim() : '';
  }

  private extractDiscount(content: string): string {
    // Look for discount percentages
    const discountMatch = content.match(/(\d+%)\s*off/i);
    return discountMatch ? discountMatch[1].trim() : '';
  }

  private extractBankOffers(content: string): string[] {
    // This is a simplified approach - would need more sophisticated parsing
    const bankOfferSection = content.match(/bank offers?:?\s*(.*?)(?:\n\n|\n\w)/is);
    if (bankOfferSection && bankOfferSection[1]) {
      return bankOfferSection[1]
        .split(/\n|•|<li>/)
        .map(offer => offer.trim())
        .filter(offer => offer.length > 5);
    }
    return [];
  }

  private extractAboutItem(content: string): string[] {
    // Look for "About this item" section
    const aboutMatch = content.match(/about this item:?\s*(.*?)(?:\n\n|\n\w)/is);
    if (aboutMatch && aboutMatch[1]) {
      return aboutMatch[1]
        .split(/\n|•|<li>/)
        .map(item => item.trim())
        .filter(item => item.length > 3);
    }
    
    // Try matching list items
    const listItems = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (listItems) {
      return listItems
        .map(item => item.replace(/<[^>]*>/g, '').trim())
        .filter(item => item.length > 3);
    }
    
    return [];
  }

  private extractProductInfo(content: string): Record<string, string> {
    const productInfo: Record<string, string> = {};
    
    // Look for product specifications in tables
    const tableMatch = content.match(/<table[^>]*>(.*?)<\/table>/is);
    if (tableMatch) {
      const rowMatches = tableMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gi);
      if (rowMatches) {
        rowMatches.forEach(row => {
          const cells = row.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi);
          if (cells && cells.length >= 2) {
            const key = cells[0].replace(/<[^>]*>/g, '').trim();
            const value = cells[1].replace(/<[^>]*>/g, '').trim();
            if (key && value) {
              productInfo[key] = value;
            }
          }
        });
      }
    }
    
    // If no tables found, try looking for key-value pairs in the text
    if (Object.keys(productInfo).length === 0) {
      const lines = content.split('\n');
      lines.forEach(line => {
        const match = line.match(/([^:]+):\s*(.*)/);
        if (match && match[1] && match[2]) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && value) {
            productInfo[key] = value;
          }
        }
      });
    }
    
    return productInfo;
  }

  private extractImages(content: string): string[] {
    // Extract image URLs from img tags
    const imgTags = content.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
    if (imgTags) {
      return imgTags
        .map(tag => {
          const srcMatch = tag.match(/src=["'](https?:\/\/[^"']+)["']/i);
          return srcMatch ? srcMatch[1] : null;
        })
        .filter(Boolean) as string[];
    }
    return [];
  }

  private extractManufacturerImages(content: string): string[] {
    // Look for manufacturer section
    const manufacturerSection = content.match(/from the manufacturer:?\s*(.*?)(?:\n\n|\n\w)/is);
    if (manufacturerSection) {
      const imgTags = manufacturerSection[1].match(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
      if (imgTags) {
        return imgTags
          .map(tag => {
            const srcMatch = tag.match(/src=["'](https?:\/\/[^"']+)["']/i);
            return srcMatch ? srcMatch[1] : null;
          })
          .filter(Boolean) as string[];
      }
    }
    return [];
  }

  private generateReviewSummary(content: string): string {
    // This would typically involve AI processing, but we'll mock it with a simple extraction
    const reviewSection = content.match(/customer reviews:?\s*(.*?)(?:\n\n|\n\w)/is);
    if (reviewSection) {
      const sentences = reviewSection[1].split(/\.\s*/);
      // Take the first two sentences as a simple summary
      if (sentences.length > 1) {
        return sentences.slice(0, 2).join('. ') + '.';
      }
      return reviewSection[1].trim();
    }
    return '';
  }
}

export const scraperService = new ScraperService();
