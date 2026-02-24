import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export function useGetBannerPhoto() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['bannerPhoto'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBannerPhoto();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetBannerPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageData,
      onProgress,
    }: {
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

      // Upload the banner to the backend
      await actor.setBannerPhoto(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannerPhoto'] });
      toast.success('Banner photo updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update banner photo:', error);
      toast.error('Failed to update banner photo');
    },
  });
}
