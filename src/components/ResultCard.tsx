
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon, ChevronDown, ChevronUp, Info, Tag, CreditCard, Package, Monitor, Camera, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResultCardProps {
  result: {
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
  };
  index: number;
}

export default function ResultCard({ result, index }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const allImages = [...(result.imageUrls || []), ...(result.manufacturerImages || [])];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={expanded ? "col-span-full" : ""}
    >
      <Card className="overflow-hidden h-full glass-card border-transparent hover:border-primary/30 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4">
            <CardHeader className="p-0 pb-4">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-medium line-clamp-2">{result.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
              </div>
              
              <div className="flex items-center mt-2 gap-2">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <span className="text-sm font-medium">{result.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({result.numRatings} ratings)</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                  {result.price}
                </Badge>
                {result.discount && result.discount !== 'No discount' && (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    {result.discount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <Tabs defaultValue="images" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="images"><Monitor className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="about"><Info className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="specs"><Package className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="offers"><Tag className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="reviews"><MessageSquare className="h-4 w-4" /></TabsTrigger>
              </TabsList>
              
              <TabsContent value="images" className="mt-0">
                {allImages.length > 0 ? (
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden rounded-md mb-2">
                      <img 
                        src={allImages[activeImageIndex]} 
                        alt={`${result.title} - image ${activeImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((img, i) => (
                          <button 
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 ${activeImageIndex === i ? 'border-primary' : 'border-transparent'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No images available</div>
                )}
              </TabsContent>
              
              <TabsContent value="about" className="mt-0">
                <div className="max-h-48 overflow-y-auto">
                  <h4 className="font-medium mb-2">About this item</h4>
                  {result.aboutItem.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {result.aboutItem.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No product details available</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="specs" className="mt-0">
                <div className="max-h-48 overflow-y-auto">
                  <h4 className="font-medium mb-2">Product Specifications</h4>
                  {Object.keys(result.productInfo).length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(result.productInfo).map(([key, value], i) => (
                        <React.Fragment key={i}>
                          <div className="font-medium">{key}</div>
                          <div>{value}</div>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specifications available</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="offers" className="mt-0">
                <div className="max-h-48 overflow-y-auto">
                  <h4 className="font-medium mb-2">Bank Offers</h4>
                  {result.bankOffers.length > 0 && result.bankOffers[0] !== 'No bank offers available' ? (
                    <ul className="text-sm space-y-1">
                      {result.bankOffers.map((offer, i) => (
                        <li key={i} className="flex items-start">
                          <CreditCard className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                          <span>{offer}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No bank offers available</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-0">
                <div className="max-h-48 overflow-y-auto">
                  <h4 className="font-medium mb-2">Customer Review Summary</h4>
                  <p className="text-sm">{result.reviewSummary}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {expanded && (
            <div className="p-4 border-t md:border-t-0 md:border-l border-border">
              <h3 className="font-medium mb-3">Detailed Product Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">All Specifications</h4>
                  <div className="max-h-96 overflow-y-auto">
                    {Object.keys(result.productInfo).length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {Object.entries(result.productInfo).map(([key, value], i) => (
                          <React.Fragment key={i}>
                            <div className="font-medium">{key}</div>
                            <div>{value}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specifications available</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">All Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {allImages.map((image, i) => (
                      <div key={i} className="aspect-square rounded-md overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${result.title} - image ${i + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 pt-0 text-center">
          <Button 
            asChild 
            className="w-full md:w-auto"
          >
            <a href={result.link} target="_blank" rel="noopener noreferrer">
              View on Amazon
            </a>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
