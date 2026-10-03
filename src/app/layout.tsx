import type {Metadata} from 'next';
import './globals.css';
export const metadata: Metadata = {title: 'Alibi Atlas — test a story’s timeline', description: 'A continuity workbench for fictional characters, authored events and travel constraints.'};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
