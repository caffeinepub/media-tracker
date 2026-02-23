import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useUserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileSetupProps {
  open: boolean;
}

export default function ProfileSetup({ open }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile.mutate({ name: name.trim() });
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Welcome to Media Tracker</DialogTitle>
          <DialogDescription>
            Please enter your name to get started tracking your favorite movies, TV shows, and video games.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!name.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
