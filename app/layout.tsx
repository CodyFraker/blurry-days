import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
	title: 'blurrydays drinking game generator',
	description: 'Generate custom drinking games from grainydays film photography videos',
	openGraph: {
		title: 'grainydays Drinking Game Generator',
		description: 'Generate custom drinking games from Grainydays film photography videos',
		images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Grainydays Drinking Game Generator' }]
	}
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.variable}>
				<Providers>
					<AppShell>{children}</AppShell>
				</Providers>
			</body>
		</html>
	);
}
