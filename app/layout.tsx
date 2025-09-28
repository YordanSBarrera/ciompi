import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import MainWrapper from '@/app/components/MainWrapper';
import MuiThemeProvider from '@/lib/ProviderTheme';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ciompi Cobranza',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MuiThemeProvider>
          <MainWrapper>{children} </MainWrapper>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
