import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MediaEntry } from '../backend';

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<MediaEntry[]>({
    queryKey: ['allReviews'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}
