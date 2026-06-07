// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { Provider } from '@/components/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DRAG STAR ANTOFAGASTA',
  description: 'Concurso de transformismo premium de Antofagasta',
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
