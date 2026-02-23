import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllReviews } from '../hooks/useReviews';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import ProfileSetup from '../components/ProfileSetup';
import CommunityReviewCard from '../components/CommunityReviewCard';
import { Loader2 } from 'lucide-react';

export default function CommunityReviews() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: reviews, isLoading: reviewsLoading } = useGetAllReviews();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Community Reviews</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Please log in to view community reviews
        </p>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  if (reviewsLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedReviews = reviews ? [...reviews].sort((a, b) => Number(b.dateAdded - a.dateAdded)) : [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-2">Community Reviews</h1>
        <p className="text-muted-foreground text-lg">
          Discover what others are watching, playing, and reviewing
        </p>
      </div>

      {sortedReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReviews.map((review) => (
            <CommunityReviewCard key={review.id.toString()} entry={review} />
          ))}
        </div>
      )}
    </div>
  );
}
