import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCreateMediaEntry, useUpdateMediaEntry } from '../hooks/useMediaEntries';
import { MediaType, type MediaEntry } from '../backend';

interface AddMediaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editEntry?: MediaEntry;
}

export default function AddMediaForm({ isOpen, onClose, editEntry }: AddMediaFormProps) {
  const createMediaEntry = useCreateMediaEntry();
  const updateMediaEntry = useUpdateMediaEntry();

  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.movie);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState('');

  const isEditMode = !!editEntry;

  useEffect(() => {
    if (isOpen && editEntry) {
      setTitle(editEntry.title);
      setMediaType(editEntry.mediaType);
      setRating(editEntry.rating ? Number(editEntry.rating) : 5);
      setReview(editEntry.review || '');
    } else if (isOpen && !editEntry) {
      setTitle('');
      setMediaType(MediaType.movie);
      setRating(5);
      setReview('');
    }
  }, [isOpen, editEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const ratingValue = rating > 0 ? BigInt(rating) : null;
      const reviewValue = review.trim() || null;

      if (isEditMode && editEntry) {
        await updateMediaEntry.mutateAsync({
          id: editEntry.id,
          title: title.trim(),
          mediaType,
          rating: ratingValue,
          review: reviewValue,
        });
      } else {
        await createMediaEntry.mutateAsync({
          title: title.trim(),
          mediaType,
          rating: ratingValue,
          review: reviewValue,
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save media entry:', error);
    }
  };

  const isPending = createMediaEntry.isPending || updateMediaEntry.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isEditMode ? 'Edit Media Entry' : 'Add New Media'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediaType">Type *</Label>
            <Select
              value={mediaType}
              onValueChange={(value) => setMediaType(value as MediaType)}
              disabled={isPending}
            >
              <SelectTrigger id="mediaType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MediaType.movie}>Movie</SelectItem>
                <SelectItem value={MediaType.tvShow}>TV Show</SelectItem>
                <SelectItem value={MediaType.videoGame}>Video Game</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating: {rating}/10</Label>
            <Slider
              id="rating"
              min={0}
              max={10}
              step={1}
              value={[rating]}
              onValueChange={(values) => setRating(values[0])}
              disabled={isPending}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">Set to 0 for no rating</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
