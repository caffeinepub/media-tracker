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
import { useCreateMediaEntry, useUpdateMediaEntry, useAddImageToMediaEntry } from '../hooks/useMediaEntries';
import { MediaType, type MediaEntry } from '../backend';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AddMediaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editEntry?: MediaEntry;
}

export default function AddMediaForm({ isOpen, onClose, editEntry }: AddMediaFormProps) {
  const createMediaEntry = useCreateMediaEntry();
  const updateMediaEntry = useUpdateMediaEntry();
  const addImageToMediaEntry = useAddImageToMediaEntry();

  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.movie);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const isEditMode = !!editEntry;

  useEffect(() => {
    if (isOpen && editEntry) {
      setTitle(editEntry.title);
      setMediaType(editEntry.mediaType);
      setRating(editEntry.rating ? Number(editEntry.rating) : 5);
      setReview(editEntry.review || '');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    } else if (isOpen && !editEntry) {
      setTitle('');
      setMediaType(MediaType.movie);
      setRating(5);
      setReview('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    }
  }, [isOpen, editEntry]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const ratingValue = rating > 0 ? BigInt(rating) : null;
      const reviewValue = review.trim() || null;

      let mediaId: bigint;

      if (isEditMode && editEntry) {
        await updateMediaEntry.mutateAsync({
          id: editEntry.id,
          title: title.trim(),
          mediaType,
          rating: ratingValue,
          review: reviewValue,
        });
        mediaId = editEntry.id;
      } else {
        mediaId = await createMediaEntry.mutateAsync({
          title: title.trim(),
          mediaType,
          rating: ratingValue,
          review: reviewValue,
        });
      }

      // Upload image if selected
      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        await addImageToMediaEntry.mutateAsync({
          mediaId,
          imageData: uint8Array,
          onProgress: (percentage) => {
            setUploadProgress(percentage);
          },
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save media entry:', error);
    }
  };

  const isPending = createMediaEntry.isPending || updateMediaEntry.isPending || addImageToMediaEntry.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="image">Image (Optional)</Label>
            {!previewUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  disabled={isPending}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, GIF, or WebP (max 2MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative border border-border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  disabled={isPending}
                  className="absolute top-2 right-2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? (
                <>
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    `Uploading ${uploadProgress}%...`
                  ) : (
                    'Saving...'
                  )}
                </>
              ) : (
                isEditMode ? 'Update' : 'Add'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
