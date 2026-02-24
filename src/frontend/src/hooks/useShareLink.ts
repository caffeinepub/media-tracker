import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MediaEntry, UserProfile } from '../backend';
import { toast } from 'sonner';

export function useGenerateShareLink() {
  return useMutation({
    mutationFn: async (expiryTime: bigint | null) => {
      // Backend method not implemented yet
      toast.error('Share link functionality is not available yet');
      throw new Error('generateShareLink method not implemented in backend');
    },
    onError: (error) => {
      console.error('Failed to generate share link:', error);
    },
  });
}

export function useRevokeShareLink() {
  return useMutation({
    mutationFn: async (shareLinkId: bigint) => {
      // Backend method not implemented yet
      toast.error('Revoke share link functionality is not available yet');
      throw new Error('revokeShareLink method not implemented in backend');
    },
    onError: (error) => {
      console.error('Failed to revoke share link:', error);
    },
  });
}

export function useGetMediaEntriesByShareLink(shareLinkId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MediaEntry[]>({
    queryKey: ['sharedMediaEntries', shareLinkId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMediaEntriesByShareLink(BigInt(shareLinkId));
    },
    enabled: !!actor && !isFetching && !!shareLinkId,
    retry: false,
  });
}

export function useGetOwnerProfile(entries: MediaEntry[]) {
  const { actor, isFetching } = useActor();
  const ownerId = entries.length > 0 ? entries[0].owner : null;

  return useQuery<UserProfile | null>({
    queryKey: ['ownerProfile', ownerId?.toString()],
    queryFn: async () => {
      if (!actor || !ownerId) return null;
      return actor.getUserProfile(ownerId);
    },
    enabled: !!actor && !isFetching && !!ownerId,
  });
}
