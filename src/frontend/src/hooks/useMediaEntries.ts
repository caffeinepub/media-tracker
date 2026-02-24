import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { MediaType, ExternalBlob } from '../backend';
import { toast } from 'sonner';

export function useGetMyMediaEntries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['myMediaEntries'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getMediaEntriesByUser(principal);
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useCreateMediaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      mediaType,
      rating,
      review,
    }: {
      title: string;
      mediaType: MediaType;
      rating: bigint | null;
      review: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMediaEntry(title, mediaType, rating, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
      toast.success('Media entry created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create media entry:', error);
      toast.error('Failed to create media entry');
    },
  });
}

export function useUpdateMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      mediaType,
      rating,
      review,
    }: {
      id: bigint;
      title: string;
      mediaType: MediaType;
      rating: bigint | null;
      review: string | null;
    }) => {
      // Backend method not implemented yet
      toast.error('Update functionality is not available yet');
      throw new Error('updateMediaEntry method not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
      toast.success('Media entry updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update media entry:', error);
    },
  });
}

export function useDeleteMediaEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      // Backend method not implemented yet
      toast.error('Delete functionality is not available yet');
      throw new Error('deleteMediaEntry method not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
      toast.success('Media entry deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete media entry:', error);
    },
  });
}

export function useAddImageToMediaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      imageData,
      onProgress,
    }: {
      mediaId: bigint;
      imageData: Uint8Array;
      onProgress?: (percentage: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');

      // Convert to Uint8Array<ArrayBuffer> to match the expected type
      const buffer = new ArrayBuffer(imageData.length);
      const typedArray = new Uint8Array(buffer);
      typedArray.set(imageData);

      // Create ExternalBlob with upload progress tracking
      let blob = ExternalBlob.fromBytes(typedArray);
      
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }

      // Upload the image to the backend
      await actor.addImageToMediaEntry('image/jpeg', mediaId, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
      queryClient.invalidateQueries({ queryKey: ['sharedMediaEntries'] });
      toast.success('Image uploaded successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    },
  });
}
