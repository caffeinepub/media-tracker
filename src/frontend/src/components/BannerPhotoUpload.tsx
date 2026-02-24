import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSetBannerPhoto } from '../hooks/useBannerPhoto';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface BannerPhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BannerPhotoUpload({ isOpen, onClose }: BannerPhotoUploadProps) {
  const setBannerPhoto = useSetBannerPhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      await setBannerPhoto.mutateAsync({
        imageData: uint8Array,
        onProgress: (percentage) => {
          setUploadProgress(percentage);
        },
      });

      // Reset form and close
      handleRemoveImage();
      onClose();
    } catch (error) {
      console.error('Failed to upload banner photo:', error);
    }
  };

  const handleClose = () => {
    if (!setBannerPhoto.isPending) {
      handleRemoveImage();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Change Banner Photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="banner-image">Banner Image</Label>
            {!previewUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="banner-image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  disabled={setBannerPhoto.isPending}
                  className="hidden"
                />
                <label
                  htmlFor="banner-image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload banner image</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, GIF, or WebP (max 2MB)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1200x400 pixels
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative border border-border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Banner preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  disabled={setBannerPhoto.isPending}
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={setBannerPhoto.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={setBannerPhoto.isPending || !selectedFile}>
              {setBannerPhoto.isPending ? (
                <>
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    `Uploading ${uploadProgress}%...`
                  ) : (
                    'Uploading...'
                  )}
                </>
              ) : (
                'Upload Banner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
