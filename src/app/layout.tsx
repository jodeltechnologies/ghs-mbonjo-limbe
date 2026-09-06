import type { Metadata } from 'next';
import './globals.css';

// Page titles read as "Section — GHS Mbonjo Limbe" rather than repeating the
// school name first on every tab. Part 9.2.
export const metadata: Metadata = {
  title: { default: 'GHS Mbonjo Limbe', template: '%s — GHS Mbonjo Limbe' },
  description:
    'Government High School Mbonjo, Limbe. Lycée de Mbonjo, Limbe. ' +
    'Fako Division, South West Region, Cameroon.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/shield-32.png', apple: '/shield-180.png' },
  openGraph: {
    type: 'website',
    siteName: 'GHS Mbonjo Limbe',
    images: [{ url: '/share.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Tinos:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
