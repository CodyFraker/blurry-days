'use client';

import { useCallback, useEffect, useState } from 'react';

type AdminGame = {
	id: string;
	title: string;
	videoTitle: string;
	userId: string | null;
	isActive: boolean;
	expiresAt: string;
	expiresNever: boolean;
	playable: boolean;
};

export function AdminGamesManager() {
	const [games, setGames] = useState<AdminGame[]>([]);
	const [q, setQ] = useState('');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [detailRules, setDetailRules] = useState<{ text: string; isCustom: boolean }[]>([]);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setError(null);
		const params = new URLSearchParams({ page: '1', pageSize: '50' });
		if (q.trim()) {
			params.set('q', q.trim());
		}
		const res = await fetch(`/api/admin/games?${params}`);
		if (!res.ok) {
			setError('Failed to load games');
			return;
		}
		const data = await res.json();
		setGames(data.games);
	}, [q]);

	useEffect(() => {
		queueMicrotask(() => {
			void load();
		});
	}, [load]);

	async function loadDetail(id: string) {
		setSelectedId(id);
		const res = await fetch(`/api/admin/games/${id}`);
		if (!res.ok) {
			setError('Failed to load game');
			return;
		}
		const data = await res.json();
		setDetailRules(data.rules.map((r: { text: string; isCustom: boolean }) => ({
			text: r.text,
			isCustom: r.isCustom
		})));
	}

	async function patchGame(id: string, body: Record<string, unknown>) {
		const res = await fetch(`/api/admin/games/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			setError('Update failed');
			return;
		}
		await load();
		if (selectedId === id) {
			await loadDetail(id);
		}
	}

	async function deleteGame(id: string) {
		if (!window.confirm('Delete this game permanently?')) {
			return;
		}
		const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
		if (!res.ok && res.status !== 204) {
			setError('Delete failed');
			return;
		}
		setSelectedId(null);
		await load();
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Games moderation</h1>
			<div className="flex gap-2">
				<input
					className="flex-1 rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
					placeholder="Search title or game id"
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
				<button
					type="button"
					className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
					onClick={() => load()}
				>
					Search
				</button>
			</div>
			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			<div className="grid gap-6 lg:grid-cols-2">
				<ul className="space-y-2">
					{games.map((game) => (
						<li
							key={game.id}
							className="rounded border border-gray-200 p-3 text-sm dark:border-gray-700"
						>
							<button type="button" className="text-left w-full" onClick={() => loadDetail(game.id)}>
								<p className="font-medium">{game.title}</p>
								<p className="text-gray-500">{game.videoTitle}</p>
								<p className="mt-1 text-xs">
									{game.playable ? 'Playable' : 'Not playable'}
									{game.expiresNever ? ' · Never expires' : ` · Expires ${new Date(game.expiresAt).toLocaleDateString()}`}
								</p>
							</button>
						</li>
					))}
				</ul>
				{selectedId ? (
					<div className="rounded border border-gray-200 p-4 dark:border-gray-700">
						<h2 className="font-semibold">Game {selectedId}</h2>
						<ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
							{detailRules.map((rule, i) => (
								<li key={i}>
									{rule.isCustom ? '[custom] ' : ''}{rule.text}
								</li>
							))}
						</ul>
						<div className="mt-4 flex flex-wrap gap-2">
							<button
								type="button"
								className="text-sm text-indigo-600"
								onClick={() => patchGame(selectedId, { expiresNever: true })}
							>
								Never expire
							</button>
							<button
								type="button"
								className="text-sm text-indigo-600"
								onClick={() => {
									const d = new Date();
									d.setDate(d.getDate() + 30);
									patchGame(selectedId, { expiresAt: d.toISOString() });
								}}
							>
								Extend 30 days
							</button>
							<button
								type="button"
								className="text-sm text-indigo-600"
								onClick={() => patchGame(selectedId, { isActive: false })}
							>
								Deactivate
							</button>
							<button
								type="button"
								className="text-sm text-red-600"
								onClick={() => deleteGame(selectedId)}
							>
								Delete
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
