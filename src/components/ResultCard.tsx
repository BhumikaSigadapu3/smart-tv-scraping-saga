
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';

interface ResultCardProps {
  result: {
    title: string;
    price: string;
    rating: string;
    features: string[];
    imageUrl: string;
    link: string;
  };
  index: number;
}

export default function ResultCard({ result, index }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <a 
        href={result.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-[1.01] focus:scale-[1.01]"
      >
        <Card className="overflow-hidden h-full glass-card border-transparent hover:border-primary/30 transition-all">
          <div className="relative aspect-[16/9] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
            <img 
              src={result.imageUrl} 
              alt={result.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 z-20">
              <Badge variant="default" className="bg-primary/90 hover:bg-primary text-xs font-medium">
                {result.price}
              </Badge>
            </div>
            {result.rating && (
              <div className="absolute bottom-3 right-3 z-20 flex items-center bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                <StarIcon className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                <span>{result.rating}</span>
              </div>
            )}
          </div>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium line-clamp-2">{result.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {result.features && result.features.length > 0 && (
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                {result.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="line-clamp-1 flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}
