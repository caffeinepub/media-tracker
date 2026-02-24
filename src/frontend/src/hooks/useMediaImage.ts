import { useQuery } from '@tanstack/react-query';
import type { MediaEntry, Image } from '../backend';
import { ExternalBlob } from '../backend';

interface MediaImageResult {
  imageUrl: string | null;
  isLoading: boolean;
}

export function useMediaImage(entry: MediaEntry): MediaImageResult {
  const { data: imageUrl, isLoading } = useQuery<string | null>({
    queryKey: ['mediaImage', entry.id.toString(), entry.image ? 'has-image' : 'no-image'],
    queryFn: async () => {
      try {
        // If the entry has an uploaded image, use it
        if (entry.image) {
          if (entry.image.__kind__ === 'external') {
            // Return the direct URL for external blobs
            return entry.image.external.getDirectURL();
          } else if (entry.image.__kind__ === 'embedded') {
            // Convert embedded bytes to a data URL
            // Create a new Uint8Array with ArrayBuffer to satisfy type requirements
            const uint8Array = new Uint8Array(entry.image.embedded);
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
          }
        }

        // Fall back to placeholder service
        const hash = entry.title.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const hue = Math.abs(hash % 360);
        const saturation = 60 + (Math.abs(hash) % 20);
        const lightness = 40 + (Math.abs(hash) % 20);
        
        const encodedTitle = encodeURIComponent(entry.title);
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
