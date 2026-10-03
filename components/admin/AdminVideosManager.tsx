'use client';

import { useCallback, useEffect, useState } from 'react';

type AdminVideo = {
	id: string;
	title: string;
	isHidden: boolean;
	gameCount: number;
	publishedAt: string;
	lastFetched: string;
};

export function AdminVideosManager() {
	const [videos, setVideos] = useState<AdminVideo[]>([]);
	const [lastSync, setLastSync] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [manualId, setManualId] = useState('');
	const [manualTitle, setManualTitle] = useState('');

	const load = useCallback(async () => {
		setError(null);
		const res = await fetch('/api/admin/videos');
		if (!res.ok) {
			setError('Failed to load videos');
			return;
		}
		const data = await res.json();
		setVideos(data.videos);
		setLastSync(data.lastSync);
	}, []);

	useEffect(() => {
		queueMicrotask(() => {
			void load();
		});
	}, [load]);

	async function forceSync() {
		const res = await fetch('/api/admin/videos/sync', { method: 'POST' });
		if (!res.ok) {
			setError('Sync failed');
			return;
		}
		await load();
	}

	async function toggleHidden(video: AdminVideo) {
		const res = await fetch(`/api/admin/videos/${video.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isHidden: !video.isHidden })
		});
		if (!res.ok) {
			setError('Update failed');
			return;
		}
		await load();
	}

	async function deleteVideo(video: AdminVideo) {
		if (!window.confirm(`Delete video ${video.title}?`)) {
			return;
		}
		const res = await fetch(`/api/admin/videos/${video.id}`, { method: 'DELETE' });
		if (res.status === 409) {
			setError('Cannot delete: games use this video');
			return;
		}
		if (!res.ok && res.status !== 204) {
			setError('Delete failed');
			return;
		}
		await load();
	}

	async function addManual(e: React.FormEvent) {
		e.preventDefault();
		const res = await fetch('/api/admin/videos', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: manualId.trim(),
				title: manualTitle.trim(),
				publishedAt: new Date().toISOString()
			})
		});
		if (!res.ok) {
			setError('Manual add failed');
			return;
		}
		setManualId('');
		setManualTitle('');
		await load();
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="text-2xl font-bold">Videos</h1>
				<button
					type="button"
					onClick={forceSync}
					className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
				>
					Force RSS sync
				</button>
			</div>
			{lastSync ? (
				<p className="text-sm text-gray-500">Last sync: {new Date(lastSync).toLocaleString()}</p>
			) : null}
			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			<form onSubmit={addManual} className="flex flex-wrap gap-2">
				<input
					className="rounded border p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
					placeholder="YouTube video id"
					value={manualId}
					onChange={(e) => setManualId(e.target.value)}
					required
				/>
				<input
					className="rounded border p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
					placeholder="Title"
					value={manualTitle}
					onChange={(e) => setManualTitle(e.target.value)}
					required
				/>
				<button type="submit" className="rounded border px-3 py-2 text-sm">Add manual</button>
			</form>
			<ul className="space-y-2">
				{videos.map((video) => (
					<li
						key={video.id}
						className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm dark:border-gray-700"
					>
						<div>
							<p className="font-medium">{video.title}</p>
							<p className="text-gray-500">
								{video.isHidden ? 'Hidden' : 'Visible'} · {video.gameCount} games
							</p>
						</div>
						<div className="flex gap-2">
							<button type="button" className="text-indigo-600" onClick={() => toggleHidden(video)}>
								{video.isHidden ? 'Unhide' : 'Hide'}
							</button>
							<button type="button" className="text-red-600" onClick={() => deleteVideo(video)}>
								Delete
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
