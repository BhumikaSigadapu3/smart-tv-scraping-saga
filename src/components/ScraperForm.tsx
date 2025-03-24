
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface ScraperFormProps {
  onResults: (results: any[]) => void;
}

// API endpoint URL
const API_URL = 'http://localhost:5000/api/scraper';

export default function ScraperForm({ onResults }: ScraperFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    try {
      setIsLoading(true);
      toast.info('Starting the scraping process...', { duration: 3000 });
      
      const response = await fetch(`${API_URL}/amazon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to scrape the provided URL');
      }

      const result = await response.json();
      console.log('Scraping results:', result);
      
      if (result.success && result.data) {
        onResults(result.data);
        toast.success('Scraping completed successfully!');
      } else {
        throw new Error('No data received from the server');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to scrape the provided URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enter Amazon Product URL</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="https://www.amazon.com/dp/B09WZMR5WM"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pr-24 h-12 rounded-lg border-border/50 focus:border-primary"
              required
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-8 rounded-md mr-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  'Scrape'
                )}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Enter an Amazon product URL to extract detailed information including product name, price, ratings, discounts, bank offers, technical specifications, and images.
          </div>
        </form>
      </div>
    </motion.div>
  );
}
