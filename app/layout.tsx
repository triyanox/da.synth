import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import './globals.css';
import { Providers } from '@/components/providers';

const satoshi = localFont({
  src: './fonts/Satoshi-Variable.woff2',
  variable: '--font-sans',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'DaSynth',
  description: 'Dasynth is a web-based synthesizer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body
          className={cn(
            satoshi.variable,
            geistMono.variable,
            'bg-white font-sans',
          )}
        >
          {children}
        </body>
      </Providers>
    </html>
  );
}
