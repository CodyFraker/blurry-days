'use client';

import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { useCallback, useEffect, useState } from 'react';

type AdminRule = {
	id: string;
	text: string;
	category: string;
	weight: number;
	baseDrink: number;
	usageCount: number;
	enabled: boolean;
	createdAt: string;
	thumbsUp: number;
	thumbsDown: number;
};

const categories = Object.values(CategoryEnum);
const drinks = [
	{ value: DrinkEnum.Sip, label: 'Sip' },
	{ value: DrinkEnum.Gulp, label: 'Gulp' },
	{ value: DrinkEnum.Pull, label: 'Pull' },
	{ value: DrinkEnum.Shot, label: 'Shot' }
];

export function AdminRulesManager() {
	const [rules, setRules] = useState<AdminRule[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [includeDisabled, setIncludeDisabled] = useState(true);
	const [form, setForm] = useState({
		text: '',
		category: CategoryEnum.General,
		weight: 1,
		baseDrink: DrinkEnum.Sip,
		enabled: true
	});

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams({
				page: '1',
				pageSize: '100',
				includeDisabled: includeDisabled ? 'true' : 'false'
			});
			const res = await fetch(`/api/admin/rule-templates?${params}`);
			if (!res.ok) {
				throw new Error('Failed to load rules');
			}
			const data = await res.json();
			setRules(data.rules);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load');
		} finally {
			setLoading(false);
		}
	}, [includeDisabled]);

	useEffect(() => {
		load();
	}, [load]);

	async function createRule(e: React.FormEvent) {
		e.preventDefault();
		const res = await fetch('/api/admin/rule-templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
		if (!res.ok) {
			setError('Create failed');
			return;
		}
		setForm({
			text: '',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			enabled: true
		});
		await load();
	}

	async function toggleEnabled(rule: AdminRule) {
		const res = await fetch(`/api/admin/rule-templates/${rule.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ enabled: !rule.enabled })
		});
		if (!res.ok) {
			setError('Update failed');
			return;
		}
		await load();
	}

	async function deleteRule(id: string) {
		if (!window.confirm('Delete this rule template?')) {
			return;
		}
		const res = await fetch(`/api/admin/rule-templates/${id}`, { method: 'DELETE' });
		if (!res.ok && res.status !== 204) {
			setError('Delete failed');
			return;
		}
		await load();
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="text-2xl font-bold">Rule catalog</h1>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={includeDisabled}
						onChange={(e) => setIncludeDisabled(e.target.checked)}
					/>
					Show disabled
				</label>
			</div>

			{error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

			<form
				onSubmit={createRule}
				className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
			>
				<h2 className="font-semibold">New rule</h2>
				<textarea
					className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
					rows={2}
					value={form.text}
					onChange={(e) => setForm({ ...form, text: e.target.value })}
					required
					placeholder="Rule text (use {host} for host name)"
				/>
				<div className="flex flex-wrap gap-3">
					<select
						className="rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
						value={form.category}
						onChange={(e) => setForm({ ...form, category: e.target.value })}
					>
						{categories.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
					<input
						type="number"
						step="0.1"
						min="0.1"
						className="w-24 rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
						value={form.weight}
						onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
					/>
					<select
						className="rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-900"
						value={form.baseDrink}
						onChange={(e) => setForm({ ...form, baseDrink: Number(e.target.value) })}
					>
						{drinks.map((d) => (
							<option key={d.value} value={d.value}>{d.label}</option>
						))}
					</select>
					<button
						type="submit"
						className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						Create
					</button>
				</div>
			</form>

			{loading ? (
				<p className="text-sm text-gray-500">Loading…</p>
			) : (
				<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-gray-50 dark:bg-gray-900/50">
							<tr>
								<th className="px-3 py-2">Rule</th>
								<th className="px-3 py-2">Category</th>
								<th className="px-3 py-2">Enabled</th>
								<th className="px-3 py-2">Used</th>
								<th className="px-3 py-2">Rating</th>
								<th className="px-3 py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rules.map((rule) => (
								<tr key={rule.id} className="border-t border-gray-200 dark:border-gray-700">
									<td className="max-w-md px-3 py-2">{rule.text}</td>
									<td className="px-3 py-2">{rule.category}</td>
									<td className="px-3 py-2">{rule.enabled ? 'Yes' : 'No'}</td>
									<td className="px-3 py-2">{rule.usageCount}</td>
									<td className="px-3 py-2">+{rule.thumbsUp} / −{rule.thumbsDown}</td>
									<td className="px-3 py-2 space-x-2">
										<button
											type="button"
											className="text-indigo-600 dark:text-indigo-400"
											onClick={() => toggleEnabled(rule)}
										>
											{rule.enabled ? 'Disable' : 'Enable'}
										</button>
										<button
											type="button"
											className="text-red-600 dark:text-red-400"
											onClick={() => deleteRule(rule.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
