import React from 'react';
import MediaCard from './MediaCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { MediaEntry } from '../backend';

interface MediaListProps {
  entries: MediaEntry[];
  isPersonal: boolean;
}

export default function MediaList({ entries, isPersonal }: MediaListProps) {
  const { identity } = useInternetIdentity();

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-2">
          <p className="text-xl font-serif text-muted-foreground">
            {isPersonal ? 'No media entries yet' : 'This collection is empty'}
          </p>
          {isPersonal && (
            <p className="text-sm text-muted-foreground">
              Click "Add Media" to start tracking your favorites
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry) => {
        const isOwner = identity ? entry.owner.toString() === identity.getPrincipal().toString() : false;
        return <MediaCard key={entry.id.toString()} entry={entry} isOwner={isOwner} />;
      })}
    </div>
  );
}
