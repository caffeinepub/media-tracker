import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeleteMediaEntry } from '../hooks/useMediaEntries';
import { useMediaImage } from '../hooks/useMediaImage';
import AddMediaForm from './AddMediaForm';
import RatingBar from './RatingBar';
import type { MediaEntry } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MediaCardProps {
  entry: MediaEntry;
  isOwner: boolean;
}

export default function MediaCard({ entry, isOwner }: MediaCardProps) {
  const { identity } = useInternetIdentity();
  const deleteMediaEntry = useDeleteMediaEntry();
  const { imageUrl, isLoading: imageLoading } = useMediaImage(entry);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getMediaTypeBadge = (type: string) => {
    const badges = {
      movie: { label: 'Movie', variant: 'default' as const },
      tvShow: { label: 'TV Show', variant: 'secondary' as const },
      videoGame: { label: 'Video Game', variant: 'outline' as const },
    };
    return badges[type as keyof typeof badges] || badges.movie;
  };

  const handleDelete = async () => {
    if (!identity) return;
    
    try {
      await deleteMediaEntry.mutateAsync(entry.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete media entry:', error);
    }
  };

  const badge = getMediaTypeBadge(entry.mediaType);
  const rating = entry.rating ? Number(entry.rating) : null;
  const hasReview = entry.review && entry.review.trim().length > 0;

  return (
    <>
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
            {isOwner && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditFormOpen(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {rating !== null && (
            <div>
              <RatingBar rating={rating} />
            </div>
          )}
          {hasReview && (
            <div>
              <p className="text-sm text-muted-foreground line-clamp-3">{entry.review}</p>
            </div>
          )}
          {!rating && !hasReview && (
            <p className="text-sm text-muted-foreground italic">No rating or review yet</p>
          )}
        </CardContent>
      </Card>

      <AddMediaForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        editEntry={entry}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{entry.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMediaEntry.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMediaEntry.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
