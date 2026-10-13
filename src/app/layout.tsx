import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: { default: 'caveira — the coding agent that doesn’t refuse', template: '%s · caveira' },
  description: 'Abliterated open models that read, write and run your code, in your terminal or on your desktop.',
  openGraph: { siteName: 'caveira', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#0c0806', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-clip bg-ink font-sans text-ash">{children}</body>
    </html>
  );
}
