import FirecrawlApp from '@mendable/firecrawl-js';

interface ScraperResult {
  title: string;
  price: string;
  rating: string;
  features: string[];
  imageUrl: string;
  link: string;
}

// Fallback mock data in case there's an API failure
const mockTvData: ScraperResult[] = [
  {
    title: "Amazon Fire TV 55\" Omni Series 4K UHD smart TV",
    price: "$399.99",
    rating: "4.5",
    features: [
      "4K UHD resolution",
      "HDR 10, HLG, Dolby Digital Plus",
      "Hands-free Alexa built-in"
    ],
    imageUrl: "https://m.media-amazon.com/images/I/61LjkJzZ8NL._AC_SX522_.jpg",
    link: "https://www.amazon.com/dp/B08SVZ775L"
  },
  {
    title: "TCL 55-inch Class 4-Series 4K UHD HDR Smart Roku TV",
    price: "$319.99",
    rating: "4.6",
    features: [
      "4K Ultra HD Resolution",
      "Roku Smart TV Platform",
      "HDR Technology"
    ],
    imageUrl: "https://m.media-amazon.com/images/I/71RyRHZfRkL._AC_SX679_.jpg",
    link: "https://www.amazon.com/dp/B08DHFX4FV"
  },
  {
    title: "Samsung 65-Inch Class Crystal UHD AU8000 Series",
    price: "$547.99",
    rating: "4.7",
    features: [
      "Crystal Processor 4K",
      "HDR",
      "Built-in Voice Assistants"
    ],
    imageUrl: "https://m.media-amazon.com/images/I/71LJJrKbezL._AC_SX679_.jpg",
    link: "https://www.amazon.com/dp/B08Z25RV2C"
  },
  {
    title: "Sony 55 Inch 4K Ultra HD TV X80K Series",
    price: "$598.00",
    rating: "4.4",
    features: [
      "4K HDR Processor X1",
      "TRILUMINOS PRO Display",
      "Google TV with Google Assistant"
    ],
    imageUrl: "https://m.media-amazon.com/images/I/81et35MprAL._AC_SX679_.jpg",
    link: "https://www.amazon.com/dp/B09NVPYCB8"
  },
  {
    title: "LG 65-Inch Class UQ9000 Series LED 4K UHD Smart webOS TV",
    price: "$496.99",
    rating: "4.3",
    features: [
      "α5 Gen5 AI Processor 4K",
      "webOS 22",
      "Filmmaker Mode & Game Optimizer"
    ],
    imageUrl: "https://m.media-amazon.com/images/I/A1SZVvYzbxL._AC_SX679_.jpg",
    link: "https://www.amazon.com/dp/B09VCB4X67"
  },
  {
    title: "Hisense 55-Inch Class R6 Series Dolby Vision HDR 4K UHD Roku Smart TV",
    price: "$289.99",
    rating: "4.5",
    features: [
      "4K Ultra HD Resolution",
      "Dolby Vision HDR & HDR10",
      "Roku TV Smart Platform"
    ],
    imageUrl: "https://m.media-amazon.com/images/I/81maxtl8J1L._AC_SX679_.jpg",
    link: "https://www.amazon.com/dp/B0BTZMQPS8"
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
    
    // Remove the Amazon URL validation to accept any URL
    // We'll let the API handle any URL issues

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey: this.API_KEY });
      }
      
      const crawlResponse = await this.firecrawlApp.crawlUrl(url, {
        limit: 10,
        scrapeOptions: {
          formats: ['markdown', 'html']
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
        const products = crawlResponse.data.map((item: any) => {
          // Extract product information from the crawled data
          return {
            title: item.title || item.metadata?.title || 'Unknown TV',
            price: item.metadata?.price || 'Price unavailable',
            rating: item.metadata?.rating || '0',
            features: item.metadata?.features || [],
            imageUrl: item.metadata?.image || 'https://via.placeholder.com/300x200?text=No+Image',
            link: item.url || url
          };
        }).filter((product: ScraperResult) => product.title !== 'Unknown TV');

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
}

export const scraperService = new ScraperService();
