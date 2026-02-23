import { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useGetMyMediaEntries } from '../hooks/useMediaEntries';
import { MediaEntry } from '../backend';
import ProfileSetup from '../components/ProfileSetup';
import MediaList from '../components/MediaList';
import AddMediaForm from '../components/AddMediaForm';
import ShareMediaList from '../components/ShareMediaList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Share2, Loader2, Search } from 'lucide-react';

type SortOption = 'recently-added' | 'title-asc' | 'title-desc' | 'rating-desc' | 'rating-asc';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: entries = [], isLoading: entriesLoading } = useGetMyMediaEntries();

  const [addFormOpen, setAddFormOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MediaEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recently-added');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    // First, filter by search query
    let filtered = entries;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = entries.filter(entry => 
        entry.title.toLowerCase().includes(query)
      );
    }

    // Then, sort the filtered results
    const sorted = [...filtered];
    switch (sortOption) {
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating-desc':
        sorted.sort((a, b) => {
          const ratingA = a.rating ? Number(a.rating) : 0;
          const ratingB = b.rating ? Number(b.rating) : 0;
          return ratingB - ratingA;
        });
        break;
      case 'rating-asc':
        sorted.sort((a, b) => {
          const ratingA = a.rating ? Number(a.rating) : 0;
          const ratingB = b.rating ? Number(b.rating) : 0;
          return ratingA - ratingB;
        });
        break;
      case 'recently-added':
      default:
        sorted.sort((a, b) => Number(b.dateAdded) - Number(a.dateAdded));
        break;
    }

    return sorted;
  }, [entries, searchQuery, sortOption]);

  const handleEdit = (entry: MediaEntry) => {
    setEditEntry(entry);
    setAddFormOpen(true);
  };

  const handleAddNew = () => {
    setEditEntry(null);
    setAddFormOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-serif font-bold text-foreground">Welcome to Media Tracker</h2>
          <p className="text-lg text-muted-foreground">
            Track your favorite movies, TV shows, and video games. Rate them, review them, and share your list with friends.
          </p>
          <p className="text-muted-foreground">
            Please log in to get started.
          </p>
        </div>
      </div>
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <>
      <ProfileSetup open={showProfileSetup} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground">
              {userProfile?.name ? `${userProfile.name}'s Collection` : 'My Collection'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShareDialogOpen(true)} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          </div>
        </div>

        <Separator />

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently-added">Recently Added</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="rating-desc">Rating (Highest First)</SelectItem>
              <SelectItem value="rating-asc">Rating (Lowest First)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {entriesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : (
          <MediaList entries={filteredAndSortedEntries} onEdit={handleEdit} />
        )}
      </div>

      <AddMediaForm 
        open={addFormOpen} 
        onOpenChange={setAddFormOpen}
        editEntry={editEntry}
      />

      <ShareMediaList 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen}
      />
    </>
  );
}
