import React, { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyMediaEntries } from '../hooks/useMediaEntries';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import MediaList from '../components/MediaList';
import AddMediaForm from '../components/AddMediaForm';
import ShareMediaList from '../components/ShareMediaList';
import ProfileSetup from '../components/ProfileSetup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import type { MediaEntry } from '../backend';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: mediaEntries = [], isLoading: entriesLoading } = useGetMyMediaEntries();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<string>('recently-added');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Filter and sort media entries
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...mediaEntries];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating-high':
        result.sort((a, b) => {
          const ratingA = a.rating ? Number(a.rating) : 0;
          const ratingB = b.rating ? Number(b.rating) : 0;
          return ratingB - ratingA;
        });
        break;
      case 'rating-low':
        result.sort((a, b) => {
          const ratingA = a.rating ? Number(a.rating) : 0;
          const ratingB = b.rating ? Number(b.rating) : 0;
          return ratingA - ratingB;
        });
        break;
      case 'recently-added':
      default:
        result.sort((a, b) => Number(b.dateAdded - a.dateAdded));
        break;
    }

    return result;
  }, [mediaEntries, searchTerm, sortOption]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">Welcome to Mofongo Tracker</h2>
          <p className="text-muted-foreground">Please log in to view your media collection</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Media Collection</h1>
          <p className="text-muted-foreground mt-1">
            Track and organize your favorite movies, TV shows, and video games
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsShareDialogOpen(true)} variant="outline">
            Share Collection
          </Button>
          <Button onClick={() => setIsAddFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Media
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recently-added">Recently Added</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="rating-high">Rating (High to Low)</SelectItem>
            <SelectItem value="rating-low">Rating (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {entriesLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your collection...</p>
          </div>
        </div>
      ) : (
        <MediaList entries={filteredAndSortedEntries} isPersonal={true} />
      )}

      <AddMediaForm isOpen={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} />
      <ShareMediaList open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
    </div>
  );
}
