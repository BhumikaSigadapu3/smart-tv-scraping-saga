
# Amazon Scraper Backend

This is the backend service for the Amazon Scraper application. It provides an API to scrape Amazon product pages and extract detailed information.

## Features

- Scrapes Amazon product details including:
  - Product name
  - Price
  - Ratings
  - Discounts
  - Bank offers
  - Technical specifications
  - Product images
  - Review summaries

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory based on `.env.example`:
   ```
   PORT=5000
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   ```

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### `POST /api/scraper/amazon`

Scrapes an Amazon product URL.

**Request Body:**
```json
{
  "url": "https://www.amazon.com/dp/B09WZMR5WM"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Product Name",
      "price": "$399.99",
      "rating": "4.5",
      "numRatings": "12,345",
      "discount": "20% off",
      "bankOffers": ["10% instant discount on SBI Credit Cards"],
      "aboutItem": ["4K UHD resolution", "HDR 10, HLG, Dolby Digital Plus"],
      "productInfo": {
        "Brand": "Amazon",
        "Model": "Omni Series"
      },
      "imageUrls": ["https://example.com/image1.jpg"],
      "manufacturerImages": ["https://example.com/mfr-image.jpg"],
      "reviewSummary": "Users praise the picture quality and Alexa integration."
    }
  ]
}
```

### `POST /api/scraper/verify-key`

Verifies if a Firecrawl API key is valid.

**Request Body:**
```json
{
  "apiKey": "your-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true
}
```
