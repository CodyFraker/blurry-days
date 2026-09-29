import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import GameSummaryClient from './GameSummaryClient';

export default function GameSummaryPage() {
	return (
		<Suspense fallback={<LoadingSpinner label="Loading game setup..." />}>
			<GameSummaryClient />
		</Suspense>
	);
}
