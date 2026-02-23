import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MediaEntry, MediaType } from '../backend';
import { toast } from 'sonner';

export function useGetMyMediaEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<MediaEntry[]>({
    queryKey: ['myMediaEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyMediaEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMediaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      mediaType: MediaType;
      rating: bigint | null;
      review: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMediaEntry(data.title, data.mediaType, data.rating, data.review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      toast.success('Entry added successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create entry');
    },
  });
}

export function useUpdateMediaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      mediaType: MediaType;
      rating: bigint | null;
      review: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMediaEntry(data.id, data.title, data.mediaType, data.rating, data.review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMediaEntries'] });
      toast.success('Entry updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update entry');
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
      toast.success('Entry deleted successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete entry');
    },
  });
}
