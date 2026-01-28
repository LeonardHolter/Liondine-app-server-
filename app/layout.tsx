import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lion Dine Menu API',
  description: 'API for parsing Lion Dine menus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
