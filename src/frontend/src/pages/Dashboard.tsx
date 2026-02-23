import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useGetMyMediaEntries } from '../hooks/useMediaEntries';
import { MediaEntry } from '../backend';
import ProfileSetup from '../components/ProfileSetup';
import MediaList from '../components/MediaList';
import AddMediaForm from '../components/AddMediaForm';
import ShareMediaList from '../components/ShareMediaList';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Share2, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: entries = [], isLoading: entriesLoading } = useGetMyMediaEntries();

  const [addFormOpen, setAddFormOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MediaEntry | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

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

        {entriesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : (
          <MediaList entries={entries} onEdit={handleEdit} />
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
