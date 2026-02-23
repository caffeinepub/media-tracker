import { MediaEntry } from '../backend';
import MediaCard from './MediaCard';
import { Film } from 'lucide-react';

interface MediaListProps {
  entries: MediaEntry[];
  onEdit?: (entry: MediaEntry) => void;
  readOnly?: boolean;
  emptyMessage?: string;
}

export default function MediaList({ entries, onEdit, readOnly = false, emptyMessage }: MediaListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Film className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
          {emptyMessage || 'No media entries yet'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {readOnly 
            ? 'This list is empty. Check back later!' 
            : 'Start tracking your favorite movies, TV shows, and video games by adding your first entry.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry) => (
        <MediaCard 
          key={entry.id.toString()} 
          entry={entry} 
          onEdit={onEdit}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
