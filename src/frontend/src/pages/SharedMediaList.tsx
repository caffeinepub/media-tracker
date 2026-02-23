import { useParams } from '@tanstack/react-router';
import { useGetMediaEntriesByShareLink, useGetOwnerProfile } from '../hooks/useShareLink';
import MediaList from '../components/MediaList';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function SharedMediaList() {
  const { shareLinkId } = useParams({ from: '/shared/$shareLinkId' });
  const { data: entries = [], isLoading, error } = useGetMediaEntriesByShareLink(shareLinkId);
  const { data: ownerProfile } = useGetOwnerProfile(entries);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'This share link is invalid or has expired.'}
          </AlertDescription>
        </Alert>
        <Button onClick={handleGoHome} variant="outline" className="mt-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={handleGoHome} variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <h2 className="text-3xl font-serif font-bold text-foreground">
          {ownerProfile?.name ? `${ownerProfile.name}'s Collection` : 'Shared Collection'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · Read-only view
        </p>
      </div>

      <Separator />

      <MediaList 
        entries={entries} 
        readOnly 
        emptyMessage="This collection is empty"
      />
    </div>
  );
}
