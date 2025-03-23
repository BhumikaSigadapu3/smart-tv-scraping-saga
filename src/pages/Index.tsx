
import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ScraperForm from '@/components/ScraperForm';
import ResultCard from '@/components/ResultCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowDown, Tv, Search, FilterX, Database, Award } from 'lucide-react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  forwardedRef?: React.RefObject<HTMLElement>;
}

const Section = ({ children, className = '', id, forwardedRef }: SectionProps) => (
  <section 
    id={id} 
    className={`py-16 md:py-24 ${className}`}
    ref={forwardedRef as React.RefObject<HTMLDivElement>}
  >
    <div className="container px-6 mx-auto">
      {children}
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true, margin: "-100px" }}
    className="glass-card p-6 rounded-xl"
  >
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default function Index() {
  const [results, setResults] = useState<any[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const handleResults = (newResults: any[]) => {
    setResults(newResults);
    
    // Scroll to results section
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <Section className="pt-32 md:pt-40 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        
        <motion.div
          className="relative z-10 mx-auto text-center max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            style={{ opacity, scale }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-4"
            >
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary inline-block mb-6">
                Smart TV Product Research Made Simple
              </span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Find the Perfect <span className="text-primary">Smart TV</span> with Our Web Scraper
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Effortlessly gather and compare Smart TV specifications and prices from Amazon to make informed purchasing decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" asChild>
                <a href="#scraper">Start Scraping</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">How It Works</a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block"
          >
            <ArrowDown className="text-muted-foreground" />
          </motion.div>
        </motion.div>
      </Section>
      
      {/* Features Section */}
      <Section id="features" className="bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Powerful Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Our Smart TV scraper provides everything you need to make informed decisions
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Search className="text-primary h-6 w-6" />}
            title="Real-Time Data Extraction"
            description="Get up-to-date information on Smart TVs directly from Amazon's product pages."
          />
          <FeatureCard
            icon={<FilterX className="text-primary h-6 w-6" />}
            title="Automated Filtering"
            description="Automatic filtering of irrelevant data to provide only what matters for your Smart TV search."
          />
          <FeatureCard
            icon={<Database className="text-primary h-6 w-6" />}
            title="Structured Results"
            description="Neatly organized data for easy comparison of different Smart TV models and specifications."
          />
          <FeatureCard
            icon={<Tv className="text-primary h-6 w-6" />}
            title="Smart TV Specialized"
            description="Optimized specifically for extracting and analyzing Smart TV features and specifications."
          />
          <FeatureCard
            icon={<Award className="text-primary h-6 w-6" />}
            title="Top-Rated Products"
            description="Easily identify highly-rated Smart TVs with our customer review extraction."
          />
          <FeatureCard
            icon={<Search className="text-primary h-6 w-6" />}
            title="Price Tracking"
            description="Monitor Smart TV prices over time to identify the best deals and price trends."
          />
        </div>
      </Section>
      
      {/* How It Works Section */}
      <Section id="how-it-works">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Simple, fast, and effective - our scraper does the hard work for you
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Enter Amazon URL</h3>
            <p className="text-muted-foreground">Paste an Amazon search results URL or product page for Smart TVs.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Start the Scraper</h3>
            <p className="text-muted-foreground">Click the "Scrape" button and let our tool gather all the Smart TV data.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">View Results</h3>
            <p className="text-muted-foreground">Browse structured Smart TV data with images, prices, features, and ratings.</p>
          </motion.div>
        </div>
      </Section>
      
      {/* Scraper Section */}
      <Section id="scraper" className="bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Start Scraping
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Enter an Amazon URL to begin gathering Smart TV information
          </motion.p>
        </div>
        
        <ScraperForm onResults={handleResults} />
      </Section>
      
      {/* Results Section */}
      {results.length > 0 && (
        <Section forwardedRef={resultsRef} className="pt-16">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Scraping Results
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Found {results.length} Smart TVs matching your criteria
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <ResultCard key={index} result={result} index={index} />
            ))}
          </div>
        </Section>
      )}
      
      <Footer />
    </div>
  );
}
