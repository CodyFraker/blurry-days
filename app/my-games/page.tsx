'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { EmptyStateIllustration } from '@/components/brand/EmptyStateIllustration';
import { filmEdgeCardClassName } from '@/components/brand/FilmEdgeCard';
import { ViewfinderFrame } from '@/components/brand/ViewfinderFrame';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type SavedGame = {
	id: string;
	title: string;
	videoTitle: string;
	videoThumbnail: string | null;
	intoxicationLevel: number;
	createdAt: string;
	expiresAt: string;
};

export default function MyGamesPage() {
	const { status } = useSession();
	const [games, setGames] = useState<SavedGame[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (status !== 'authenticated') {
			setLoading(false);
			return;
		}
		(async () => {
			try {
				const res = await fetch('/api/me/games');
				if (res.status === 401) {
					setError('Please sign in to view your games.');
					return;
				}
				if (!res.ok) throw new Error('Failed to load games');
				const data = await res.json();
				setGames(data.games);
			} catch {
				setError('Failed to load your games');
			} finally {
				setLoading(false);
			}
		})();
	}, [status]);

	if (status === 'loading' || loading) {
		return <LoadingSpinner label="Loading your games..." />;
	}

	if (status === 'unauthenticated') {
		return (
			<div className="mx-auto max-w-md py-16 text-center">
				<EmptyStateIllustration variant="signIn" className="mb-6 h-20 w-20" />
				<h2 className="text-2xl font-bold">My Games</h2>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Sign in with Discord to save and view your drinking games.
				</p>
				<button
					type="button"
					onClick={() => signIn('discord')}
					className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
				>
					Sign in with Discord
				</button>
			</div>
		);
	}

	if (error) {
		return <p className="text-center text-red-600 dark:text-red-400">{error}</p>;
	}

	return (
		<div>
			<h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">My Games</h2>
			{games.length === 0 ? (
				<div className="flex flex-col items-center text-center text-gray-600 dark:text-gray-400">
					<EmptyStateIllustration variant="noGames" className="mb-4 h-20 w-20" />
					<p>
						No saved games yet.{' '}
						<Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
							Create one
						</Link>
						.
					</p>
				</div>
			) : (
				<ul className="grid gap-4 sm:grid-cols-2">
					{games.map((game) => (
						<li key={game.id}>
							<Link
								href={`/game/${game.id}`}
								className={filmEdgeCardClassName(
									'flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md sm:flex-row dark:border-gray-700 dark:bg-gray-800'
								)}
							>
								{game.videoThumbnail && (
									<ViewfinderFrame size="sm">
										<img
											src={game.videoThumbnail}
											alt=""
											loading="lazy"
											className="h-full w-full scale-[1.05] object-cover"
										/>
									</ViewfinderFrame>
								)}
								<div className="min-w-0">
									<h3 className="font-semibold text-gray-900 dark:text-white">{game.title}</h3>
									<p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
										{game.videoTitle}
									</p>
									<p className="mt-1 text-xs text-gray-500">
										Expires {new Date(game.expiresAt).toLocaleDateString()}
									</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
