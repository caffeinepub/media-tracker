import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import ExportButton from './ExportButton';
import BannerPhotoUpload from './BannerPhotoUpload';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBannerPhoto } from '../hooks/useBannerPhoto';
import { Film, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity } = useInternetIdentity();
  const { data: bannerPhoto } = useGetBannerPhoto();
  const [isBannerUploadOpen, setIsBannerUploadOpen] = useState(false);
  const isAuthenticated = !!identity;
  const currentYear = new Date().getFullYear();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Get banner URL
  const bannerUrl = bannerPhoto?.getDirectURL() || '/assets/generated/hero-banner.dim_1200x400.png';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Film className="w-8 h-8 text-primary" />
                <span className="text-2xl font-serif font-bold text-foreground">Mofongo Tracker</span>
              </Link>
              {isAuthenticated && (
                <nav className="flex items-center gap-4">
                  <Link
                    to="/community"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      currentPath === '/community' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Community Reviews
                  </Link>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && <ExportButton />}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full h-[200px] bg-muted overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bannerUrl})` }}
          role="img"
          aria-label="Hero banner"
        />
        {isAuthenticated && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsBannerUploadOpen(true)}
                  className="absolute bottom-4 right-4 shadow-lg"
                >
                  <ImagePlus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change banner photo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} Mofongo Tracker. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <BannerPhotoUpload isOpen={isBannerUploadOpen} onClose={() => setIsBannerUploadOpen(false)} />
    </div>
  );
}
