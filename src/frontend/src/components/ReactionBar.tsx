import React from 'react';
import { Button } from '@/components/ui/button';
import { useReactionCounts, useAddReaction, useRemoveReaction, useHasUserReacted } from '../hooks/useReactions';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ReactionBarProps {
  reviewId: bigint;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function ReactionBar({ reviewId }: ReactionBarProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: reactionCounts } = useReactionCounts(reviewId);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  const handleReactionClick = async (emoji: string, hasReacted: boolean) => {
    if (!isAuthenticated) return;

    try {
      if (hasReacted) {
        await removeReaction.mutateAsync({ reviewId, emoji });
      } else {
        await addReaction.mutateAsync({ reviewId, emoji });
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {EMOJIS.map((emoji) => {
        const reactionData = reactionCounts?.find((r) => r.emoji === emoji);
        const count = reactionData ? Number(reactionData.count) : 0;
        
        return (
          <ReactionButton
            key={emoji}
            emoji={emoji}
            count={count}
            reviewId={reviewId}
            onReactionClick={handleReactionClick}
            disabled={!isAuthenticated || addReaction.isPending || removeReaction.isPending}
          />
        );
      })}
    </div>
  );
}

interface ReactionButtonProps {
  emoji: string;
  count: number;
  reviewId: bigint;
  onReactionClick: (emoji: string, hasReacted: boolean) => void;
  disabled: boolean;
}

function ReactionButton({ emoji, count, reviewId, onReactionClick, disabled }: ReactionButtonProps) {
  const { data: hasReacted } = useHasUserReacted(reviewId, emoji);

  return (
    <Button
      variant={hasReacted ? 'default' : 'outline'}
      size="sm"
      onClick={() => onReactionClick(emoji, hasReacted || false)}
      disabled={disabled}
      className={`h-8 px-3 gap-1.5 transition-all ${
        hasReacted 
          ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
          : 'hover:bg-accent'
      }`}
    >
      <span className="text-base leading-none">{emoji}</span>
      {count > 0 && (
        <span className="text-xs font-semibold">{count}</span>
      )}
    </Button>
  );
}
