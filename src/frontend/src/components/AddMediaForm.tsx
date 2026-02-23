import { useState, useEffect } from 'react';
import { MediaType, MediaEntry } from '../backend';
import { useCreateMediaEntry, useUpdateMediaEntry } from '../hooks/useMediaEntries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface AddMediaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEntry?: MediaEntry | null;
}

export default function AddMediaForm({ open, onOpenChange, editEntry }: AddMediaFormProps) {
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.movie);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState('');

  const createEntry = useCreateMediaEntry();
  const updateEntry = useUpdateMediaEntry();

  useEffect(() => {
    if (editEntry) {
      setTitle(editEntry.title);
      setMediaType(editEntry.mediaType);
      setRating(editEntry.rating !== undefined && editEntry.rating !== null ? Number(editEntry.rating) : 5);
      setReview(editEntry.review || '');
    } else {
      setTitle('');
      setMediaType(MediaType.movie);
      setRating(5);
      setReview('');
    }
  }, [editEntry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const data = {
      title: title.trim(),
      mediaType,
      rating: BigInt(rating),
      review: review.trim() || null,
    };

    if (editEntry) {
      updateEntry.mutate(
        { id: editEntry.id, ...data },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createEntry.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const isPending = createEntry.isPending || updateEntry.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {editEntry ? 'Edit Entry' : 'Add New Entry'}
          </DialogTitle>
          <DialogDescription>
            {editEntry ? 'Update your media entry details.' : 'Track a new movie, TV show, or video game.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediaType">Type *</Label>
            <Select value={mediaType} onValueChange={(value) => setMediaType(value as MediaType)}>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="rating">Rating</Label>
              <span className="text-sm font-semibold text-gold">{rating}/10</span>
            </div>
            <Slider
              id="rating"
              min={0}
              max={10}
              step={1}
              value={[rating]}
              onValueChange={(values) => setRating(values[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim() || isPending}>
              {isPending ? 'Saving...' : editEntry ? 'Update' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
