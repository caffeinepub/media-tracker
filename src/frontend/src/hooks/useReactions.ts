import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { EmojiReaction } from '../backend';

export function useReactionCounts(reviewId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<EmojiReaction[]>({
    queryKey: ['reactionCounts', reviewId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReactionCounts(reviewId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasUserReacted(reviewId: bigint, emoji: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasUserReacted', reviewId.toString(), emoji],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasUserReacted(reviewId, emoji);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, emoji }: { reviewId: bigint; emoji: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReaction(reviewId, emoji);
    },
    onSuccess: (_, { reviewId, emoji }) => {
      queryClient.invalidateQueries({ queryKey: ['reactionCounts', reviewId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['hasUserReacted', reviewId.toString(), emoji] });
    },
  });
}

export function useRemoveReaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, emoji }: { reviewId: bigint; emoji: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeReaction(reviewId, emoji);
    },
    onSuccess: (_, { reviewId, emoji }) => {
      queryClient.invalidateQueries({ queryKey: ['reactionCounts', reviewId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['hasUserReacted', reviewId.toString(), emoji] });
    },
  });
}
