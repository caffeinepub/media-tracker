import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RatingBar from './RatingBar';
import ReactionBar from './ReactionBar';
import { useGetUserProfile } from '../hooks/useReviewerProfile';
import { useMediaImage } from '../hooks/useMediaImage';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MediaEntry } from '../backend';

interface CommunityReviewCardProps {
  entry: MediaEntry;
}

export default function CommunityReviewCard({ entry }: CommunityReviewCardProps) {
  const { data: reviewerProfile } = useGetUserProfile(entry.owner);
  const { imageUrl, isLoading: imageLoading } = useMediaImage(entry);
  const [isExpanded, setIsExpanded] = useState(false);

  const getMediaTypeBadge = (type: string) => {
    const badges = {
      movie: { label: 'Movie', variant: 'default' as const },
      tvShow: { label: 'TV Show', variant: 'secondary' as const },
      videoGame: { label: 'Video Game', variant: 'outline' as const },
    };
    return badges[type as keyof typeof badges] || badges.movie;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const badge = getMediaTypeBadge(entry.mediaType);
  const rating = entry.rating ? Number(entry.rating) : null;
  const reviewText = entry.review || '';
  const shouldTruncate = reviewText.length > 200;
  const displayText = shouldTruncate && !isExpanded ? reviewText.slice(0, 200) + '...' : reviewText;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      {/* Media Image */}
      <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden rounded-t-lg">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={entry.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <span class="text-4xl font-serif text-muted-foreground/50">
                      ${entry.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-4xl font-serif text-muted-foreground/50">
              {entry.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-serif line-clamp-2">{entry.title}</CardTitle>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {rating !== null && (
          <div>
            <RatingBar rating={rating} />
          </div>
        )}

        {reviewText && (
          <div className="space-y-2">
            <p className="text-sm text-foreground whitespace-pre-wrap">{displayText}</p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-0 text-primary hover:text-primary/80"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="font-medium">
            {reviewerProfile?.name || 'Anonymous User'}
          </span>
          <span>{formatDate(entry.dateAdded)}</span>
        </div>

        <ReactionBar reviewId={entry.id} />
      </CardContent>
    </Card>
  );
}
