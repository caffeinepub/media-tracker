import React from 'react';
import { Link } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import ExportButton from './ExportButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Film } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Film className="w-8 h-8 text-primary" />
              <span className="text-2xl font-serif font-bold text-foreground">Media Tracker</span>
            </Link>
            <div className="flex items-center gap-2">
              {isAuthenticated && <ExportButton />}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <div
        className="w-full h-[200px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1200x400.png)' }}
        role="img"
        aria-label="Hero banner"
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} Media Tracker. Built with ❤️ using{' '}
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
    </div>
  );
}
