import React, { useState, useEffect } from 'react';
import { getMediaFiles } from '../api/mediaFiles';

interface HeroSliderProps {
  interval?: number; // Time in ms between image transitions
}

/**
 * A component that displays a rotating hero image from the media folder
 */
const HeroSlider: React.FC<HeroSliderProps> = ({ interval = 8000 }) => {
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);

  // Fetch available images from the media folder
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Get media files using our API
        const mediaFiles = await getMediaFiles();
        
        if (mediaFiles.length > 0) {
          // Map filenames to full paths
          setImages(mediaFiles.map(file => `/media/${file}`));
        } else {
          // Fallback to default image if no media files found
          setImages(['/media/pianist.webp']);
        }
      } catch (error) {
        console.error('Error fetching media files:', error);
        // Fallback to default image
        setImages(['/media/pianist.webp']);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Rotate through images at the specified interval
  useEffect(() => {
    if (images.length <= 1) return;
    
    const rotateImages = () => {
      // Start fade out
      setFadeIn(false);
      
      // After fade out completes, change the image and fade in
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFadeIn(true);
      }, 750); // Half of the total transition time
    };
    
    const timer = setInterval(rotateImages, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  // Handle manual image selection
  const handleSelectImage = (index: number) => {
    if (index === activeIndex) return;
    
    // Start fade out
    setFadeIn(false);
    
    // After fade out completes, change the image and fade in
    setTimeout(() => {
      setActiveIndex(index);
      setFadeIn(true);
    }, 750); // Half of the total transition time
  };

  if (loading || images.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-800 animate-pulse rounded-lg"></div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-lg">
      {/* Current image with fade effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1500 ease-in-out"
        style={{ 
          backgroundImage: `url(${images[activeIndex]})`,
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'scale(1)' : 'scale(1.05)'
        }}
      />
      
      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
      
      {/* Image indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              onClick={() => handleSelectImage(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
