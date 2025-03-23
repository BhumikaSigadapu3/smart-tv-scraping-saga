
import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-20 pt-10 pb-6 border-t border-border/40"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">
                SmartTV<span className="text-primary">Scraper</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              A powerful tool for gathering Smart TV information from Amazon to help you make informed purchasing decisions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <h3 className="font-medium mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
                <li><a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-border/20 text-center text-sm text-muted-foreground">
          <p>© {currentYear} SmartTV Scraper. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
