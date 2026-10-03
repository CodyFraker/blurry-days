'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorPanel } from '@/components/ErrorPanel';
import { RuleCard, type RuleView } from '@/components/RuleCard';
import { getYoutubeWatchUrl } from '@/lib/youtube/watchUrl';

type Game = {
	id: string;
	title: string;
	videoId: string;
	videoTitle: string;
	videoThumbnail: string;
	intoxicationLevel: number;
	expiresAt: string;
};

const intoxicationLabels = ['Tipsy', 'Buzzed', 'Drunk', 'Wasted', 'Blackout'];

export default function GamePage() {
	const params = useParams();
	const gameId = params.id as string;
	const [game, setGame] = useState<Game | null>(null);
	const [rules, setRules] = useState<RuleView[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch(`/api/games/${gameId}`);
				if (!response.ok) throw new Error('Game not found');
				const data = await response.json();
				setGame(data.game);
				setRules(data.rules);
			} catch {
				setError('Failed to load game');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [gameId]);

	async function copyShareLink() {
		const shareUrl = `${window.location.origin}/game/${gameId}`;
		await navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	if (isLoading) {
		return <LoadingSpinner label="Loading your drinking game..." />;
	}

	if (error || !game) {
		return (
			<ErrorPanel
				title="Game Not Found"
				message="The game you're looking for doesn't exist or has expired."
			/>
		);
	}

	const label = intoxicationLabels[game.intoxicationLevel - 1] || 'Unknown';

	return (
		<div className="space-y-6 sm:space-y-10">
			<div className="grid gap-8 lg:grid-cols-[1fr_auto]">
				<div className="flex flex-col gap-4 sm:flex-row">
					<img
						src={game.videoThumbnail}
						alt={game.videoTitle}
						loading="lazy"
						className="mx-auto h-auto w-full max-w-[300px] rounded-xl border border-gray-200 object-cover sm:mx-0 dark:border-gray-700"
					/>
					<div>
						<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">{game.title}</h1>
						<p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{game.videoTitle}</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								🍻 {label}
							</span>
							<span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
								⏰ Expires {new Date(game.expiresAt).toLocaleDateString()}
							</span>
						</div>
					</div>
				</div>
				<div className="text-center lg:text-right">
					<div className="flex flex-col gap-2 sm:items-end">
						<a
							href={getYoutubeWatchUrl(game.videoId)}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
						>
							▶️ Watch Video
						</a>
						<button
							type="button"
							onClick={copyShareLink}
							className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 sm:w-auto dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
						>
							{copied ? '✅ Copied!' : '📋 Share Game'}
						</button>
					</div>
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
						Share this link with your friends to play together!
					</p>
				</div>
			</div>
			<div className="text-center">
				<h2 className="text-2xl font-bold">📜 The Rules</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Follow these rules as you watch the video. Drink responsibly!
				</p>
			</div>
			<div className="mx-auto max-w-2xl space-y-4">
				{rules.map((rule, index) => (
					<RuleCard key={rule.id} rule={rule} index={index} />
				))}
			</div>
			<p className="text-center">
				<Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
					Create another game
				</Link>
			</p>
		</div>
	);
}
