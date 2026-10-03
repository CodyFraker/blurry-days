'use client';

import { useCallback, useEffect, useState } from 'react';

type VoteRow = {
	id: string;
	text: string;
	enabled: boolean;
	thumbsUp: number;
	thumbsDown: number;
	totalVotes: number;
};

export function AdminVotesManager() {
	const [templates, setTemplates] = useState<VoteRow[]>([]);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setError(null);
		const res = await fetch('/api/admin/rule-votes');
		if (!res.ok) {
			setError('Failed to load');
			return;
		}
		const data = await res.json();
		setTemplates(data.templates);
	}, []);

	useEffect(() => {
		queueMicrotask(() => {
			void load();
		});
	}, [load]);

	async function clearVotes(templateId: string) {
		if (!window.confirm('Clear all votes for this rule?')) {
			return;
		}
		const res = await fetch(`/api/admin/rule-templates/${templateId}/votes`, {
			method: 'DELETE'
		});
		if (!res.ok && res.status !== 204) {
			setError('Clear failed');
			return;
		}
		await load();
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Rule votes</h1>
			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			<table className="min-w-full text-left text-sm">
				<thead>
					<tr>
						<th className="px-2 py-1">Rule</th>
						<th className="px-2 py-1">Up</th>
						<th className="px-2 py-1">Down</th>
						<th className="px-2 py-1">Total</th>
						<th className="px-2 py-1" />
					</tr>
				</thead>
				<tbody>
					{templates.map((row) => (
						<tr key={row.id} className="border-t border-gray-200 dark:border-gray-700">
							<td className="max-w-md px-2 py-2">{row.text}</td>
							<td className="px-2 py-2">{row.thumbsUp}</td>
							<td className="px-2 py-2">{row.thumbsDown}</td>
							<td className="px-2 py-2">{row.totalVotes}</td>
							<td className="px-2 py-2">
								<button
									type="button"
									className="text-indigo-600"
									onClick={() => clearVotes(row.id)}
									disabled={row.totalVotes === 0}
								>
									Clear votes
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
