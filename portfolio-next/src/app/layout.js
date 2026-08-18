import { Space_Grotesk, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Jimmy De Jesus | AI & Data Science Portfolio',
  description: 'Portfolio showcasing enterprise AI engineering, data science, and business analytics projects.',
  openGraph: {
    title: 'Jimmy De Jesus | AI & Data Science Portfolio',
    description: 'Enterprise AI, Data Science & Business Intelligence projects.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${plusJakarta.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
