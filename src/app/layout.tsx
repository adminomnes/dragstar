// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { Provider } from '@/components/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DRAG STAR ANTOFAGASTA',
  description: 'Concurso de transformismo premium de Antofagasta',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👑</text></svg>',
  },
};

import RealityEffects from '@/components/RealityEffects';
import AudioPlayer from '@/components/AudioPlayer';
import DesertBackground from '@/components/DesertBackground';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" data-theme="dark">
      <head />
      <body className={`${inter.className} bg-deep-black text-bright-white min-h-screen`}>
        <DesertBackground />
        <RealityEffects />
        <Provider>
          {children}
          <AudioPlayer />
        </Provider>
      </body>
    </html>
  );
}
