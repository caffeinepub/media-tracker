import { useQuery } from '@tanstack/react-query';

const TMDB_API_KEY = 'demo'; // Using demo mode for placeholder images
const UNSPLASH_ACCESS_KEY = 'demo'; // Using demo mode

interface MediaImageResult {
  imageUrl: string | null;
  isLoading: boolean;
}

export function useMediaImage(title: string, mediaType: string): MediaImageResult {
  const { data: imageUrl, isLoading } = useQuery<string | null>({
    queryKey: ['mediaImage', title, mediaType],
    queryFn: async () => {
      try {
        // For demo purposes, we'll use a simple image placeholder service
        // In production, you would integrate with TMDB, IGDB, or similar APIs
        
        // Generate a consistent color based on the title
        const hash = title.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const hue = Math.abs(hash % 360);
        const saturation = 60 + (Math.abs(hash) % 20);
        const lightness = 40 + (Math.abs(hash) % 20);
        
        // Use a placeholder service with the title
        const encodedTitle = encodeURIComponent(title);
        return `https://placehold.co/600x400/hsl(${hue},${saturation}%,${lightness}%)/white?text=${encodedTitle}`;
      } catch (error) {
        console.error('Failed to fetch media image:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: false,
  });

  return {
    imageUrl: imageUrl || null,
    isLoading,
  };
}
