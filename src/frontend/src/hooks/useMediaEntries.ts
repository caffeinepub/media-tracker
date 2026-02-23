import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MediaType } from '../backend';
import { toast } from 'sonner';

export function useGetMyMediaEntries() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myMediaEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyMediaEntries();
    },
    enabled: !!actor && !isFetching,
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
      toast.success('Media entry created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create media entry:', error);
      toast.error('Failed to create media entry');
    },
  });
}

export function useUpdateMediaEntry() {
  const { actor } = useActor();
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateMediaEntry(id, title, mediaType, rating, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      toast.success('Media entry updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update media entry:', error);
      toast.error('Failed to update media entry');
    },
  });
}

export function useDeleteMediaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMediaEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      toast.success('Media entry deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete media entry:', error);
      toast.error('Failed to delete media entry');
    },
  });
}
