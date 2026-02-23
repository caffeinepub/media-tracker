import { MediaEntry, MediaType } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeleteMediaEntry } from '../hooks/useMediaEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Film, Tv, Gamepad2 } from 'lucide-react';
import RatingBar from './RatingBar';

interface MediaCardProps {
  entry: MediaEntry;
  onEdit?: (entry: MediaEntry) => void;
  readOnly?: boolean;
}

const mediaTypeConfig = {
  [MediaType.movie]: {
    label: 'Movie',
    icon: Film,
    color: 'bg-chart-1 text-primary-foreground',
  },
  [MediaType.tvShow]: {
    label: 'TV Show',
    icon: Tv,
    color: 'bg-chart-3 text-primary-foreground',
  },
  [MediaType.videoGame]: {
    label: 'Video Game',
    icon: Gamepad2,
    color: 'bg-chart-4 text-primary-foreground',
  },
};

export default function MediaCard({ entry, onEdit, readOnly = false }: MediaCardProps) {
  const { identity } = useInternetIdentity();
  const deleteEntry = useDeleteMediaEntry();
  
  const config = mediaTypeConfig[entry.mediaType];
  const Icon = config.icon;
  
  const isOwner = identity?.getPrincipal().toString() === entry.owner.toString();
  const showActions = !readOnly && isOwner;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry.mutate(entry.id);
    }
  };

  const reviewExcerpt = entry.review 
    ? entry.review.length > 120 
      ? entry.review.substring(0, 120) + '...' 
      : entry.review
    : 'No review yet';

  return (
    <Card className="hover:shadow-warm transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-serif text-xl mb-2 truncate">{entry.title}</CardTitle>
            <Badge className={`${config.color} gap-1`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(entry)}
                className="h-8 w-8"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleteEntry.isPending}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entry.rating !== undefined && entry.rating !== null && (
          <RatingBar rating={Number(entry.rating)} />
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">{reviewExcerpt}</p>
        <p className="text-xs text-muted-foreground">
          Added {new Date(Number(entry.dateAdded) / 1000000).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
