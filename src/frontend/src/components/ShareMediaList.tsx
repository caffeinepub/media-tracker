import { useState } from 'react';
import { useGenerateShareLink, useRevokeShareLink } from '../hooks/useShareLink';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareMediaListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareMediaList({ open, onOpenChange }: ShareMediaListProps) {
  const [shareLinkId, setShareLinkId] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLink = useGenerateShareLink();
  const revokeLink = useRevokeShareLink();

  const shareUrl = shareLinkId 
    ? `${window.location.origin}/shared/${shareLinkId.toString()}`
    : '';

  const handleGenerate = () => {
    generateLink.mutate(null, {
      onSuccess: (linkId) => {
        setShareLinkId(linkId);
        toast.success('Share link generated!');
      },
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRevoke = () => {
    if (shareLinkId && window.confirm('Are you sure you want to revoke this share link?')) {
      revokeLink.mutate(shareLinkId, {
        onSuccess: () => {
          setShareLinkId(null);
          toast.success('Share link revoked');
        },
      });
    }
  };

  const handleClose = () => {
    setShareLinkId(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Share2 className="w-6 h-6 text-gold" />
            Share Your List
          </DialogTitle>
          <DialogDescription>
            Generate a shareable link that allows friends to view your media list in read-only mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!shareLinkId ? (
            <Button 
              onClick={handleGenerate} 
              disabled={generateLink.isPending}
              className="w-full"
            >
              {generateLink.isPending ? 'Generating...' : 'Generate Share Link'}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="shareUrl">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="shareUrl"
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleRevoke}
                  variant="destructive"
                  disabled={revokeLink.isPending}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke Link
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
