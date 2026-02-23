import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MediaEntry, UserProfile } from '../backend';
import { toast } from 'sonner';

export function useGenerateShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (expiryTime: bigint | null) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateShareLink(expiryTime);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate share link');
    },
  });
}

export function useRevokeShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (shareLinkId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeShareLink(shareLinkId);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke share link');
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
