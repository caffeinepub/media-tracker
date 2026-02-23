import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginButton from './LoginButton';
import { Film } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-gold" />
              <h1 className="text-2xl font-serif font-bold text-foreground">Media Tracker</h1>
            </div>
            <LoginButton />
          </div>
        </div>
        {isAuthenticated && (
          <div className="w-full h-24 overflow-hidden">
            <img 
              src="/assets/generated/hero-banner.dim_1200x400.png" 
              alt="Media banner" 
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
