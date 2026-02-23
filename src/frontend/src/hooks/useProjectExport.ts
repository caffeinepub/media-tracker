import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// This hook generates project documentation files for download
// Note: Since we're in the browser and JSZip is not available, we create individual files
// The backend cannot access the file system, so this is a client-side implementation
export function useProjectExport() {
  return useMutation({
    mutationFn: async () => {
      // Create README content
      const readmeContent = `# Media Tracker - Source Code Export

This is a documentation export of the Media Tracker application.

## Note
Due to browser security limitations, this export contains only the application metadata and structure information.
The complete source code (frontend and backend) is stored in the Internet Computer canister and cannot be directly accessed from the browser.

## What's Included
- Project structure documentation
- Application metadata
- Deployment information

## To Access Full Source Code
The complete source code is managed by the Caffeine platform and can be accessed through:
1. The Caffeine dashboard at https://caffeine.ai
2. Your project's repository if connected to version control
3. The canister's source code management system

## Application Details
- Name: Media Tracker
- Description: A movie, TV show, and video game tracking application
- Platform: Internet Computer (ICP)
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Motoko
- Authentication: Internet Identity

## Features
- Track movies, TV shows, and video games
- Rate and review media entries
- Share your collection with others via shareable links
- User profiles with Internet Identity authentication

Built with ❤️ using Caffeine.ai
`;

      // Create project structure documentation
      const structureContent = `# Project Structure

## Frontend (React + TypeScript)
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Layout.tsx       # Main layout with header/footer
│   │   ├── LoginButton.tsx  # Authentication button
│   │   ├── ProfileSetup.tsx # User profile setup modal
│   │   ├── MediaCard.tsx    # Media entry card component
│   │   ├── RatingBar.tsx    # Rating visualization
│   │   ├── MediaList.tsx    # Media grid display
│   │   ├── AddMediaForm.tsx # Create/edit media form
│   │   ├── ShareMediaList.tsx # Share link generator
│   │   └── ExportButton.tsx # Project export button
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main user dashboard
│   │   └── SharedMediaList.tsx # Public shared list view
│   ├── hooks/
│   │   ├── useActor.ts      # Backend actor initialization
│   │   ├── useInternetIdentity.ts # II authentication
│   │   ├── useUserProfile.ts # User profile management
│   │   ├── useMediaEntries.ts # Media CRUD operations
│   │   ├── useShareLink.ts  # Share link management
│   │   └── useProjectExport.ts # Project export functionality
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles (OKLCH color system)
│   └── backend.d.ts         # Backend type definitions
├── index.html
├── tailwind.config.js       # Tailwind configuration
└── package.json

## Backend (Motoko)
backend/
└── main.mo                  # Main canister with:
    ├── User profile management
    ├── Media entry CRUD operations
    ├── Share link generation
    └── Role-based access control

## Key Technologies
- React 19 + TypeScript
- TanStack Router for routing
- TanStack Query for state management
- Tailwind CSS + Shadcn UI for styling
- Internet Identity for authentication
- Motoko for backend logic
- Internet Computer Protocol (ICP)
`;

      // Create package info
      const packageInfo = {
        name: 'media-tracker',
        description: 'A movie, TV show, and video game tracking application on the Internet Computer',
        version: '1.0.0',
        platform: 'Internet Computer',
        frontend: {
          framework: 'React 19',
          language: 'TypeScript',
          styling: 'Tailwind CSS + Shadcn UI',
          stateManagement: 'TanStack Query',
          routing: 'TanStack Router',
        },
        backend: {
          language: 'Motoko',
          platform: 'Internet Computer',
        },
        authentication: 'Internet Identity',
        features: [
          'Media tracking (movies, TV shows, video games)',
          'Rating and review system',
          'Shareable collection links',
          'User profiles',
          'Role-based access control',
        ],
      };

      // Combine all content into a single text file
      const combinedContent = `${readmeContent}

${'='.repeat(80)}

${structureContent}

${'='.repeat(80)}

PROJECT INFO (JSON)
${JSON.stringify(packageInfo, null, 2)}
`;

      return combinedContent;
    },
    onSuccess: (content) => {
      // Create a download link and trigger download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media-tracker-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Project documentation exported successfully!');
    },
    onError: (error) => {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export project files');
    },
  });
}
