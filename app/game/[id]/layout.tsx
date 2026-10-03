import type { Metadata } from 'next';
import { getPlayableGame } from '@/lib/games/getPlayableGame';

export async function generateMetadata({
	params
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const game = await getPlayableGame(id);

	if (!game) {
		return {
			title: 'Game not found',
			openGraph: {
				title: 'Grainydays Drinking Game',
				images: [{ url: '/opengraph-image', width: 1200, height: 630 }]
			}
		};
	}

	return {
		title: game.title,
		description: `Drinking game for ${game.videoTitle}`,
		openGraph: {
			title: game.title,
			description: `Drinking game for ${game.videoTitle}`,
			images: [{ url: `/game/${id}/opengraph-image`, width: 1200, height: 630, alt: game.title }]
		}
	};
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
	return children;
}
