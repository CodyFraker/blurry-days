import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import GameSummaryClient from './GameSummaryClient';

type GameSummaryPageProps = {
	searchParams: Promise<{ videoId?: string }>;
};

export default async function GameSummaryPage({ searchParams }: GameSummaryPageProps) {
	const { videoId } = await searchParams;

	return (
		<Suspense fallback={<LoadingSpinner label="Loading game setup..." />}>
			<GameSummaryClient videoId={videoId} />
		</Suspense>
	);
}
