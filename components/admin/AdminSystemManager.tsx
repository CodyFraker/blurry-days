'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Dashboard = {
	users: number;
	games: { total: number; active: number; expired: number; neverExpire: number };
	ruleTemplates: { enabled: number; disabled: number };
	videos: { visible: number; hidden: number; lastSync: string | null };
	config: { gameTtlDays: number; videoSyncCacheMinutes: number };
};

type AuditEntry = {
	id: string;
	action: string;
	entityType: string;
	entityId: string;
	createdAt: string;
};

type Checks = {
	database: string;
	rssReachable: boolean;
	env: { authSecret: boolean; discordOAuth: boolean; adminDiscordIds: boolean };
};

export function AdminSystemManager() {
	const [dashboard, setDashboard] = useState<Dashboard | null>(null);
	const [audit, setAudit] = useState<AuditEntry[]>([]);
	const [checks, setChecks] = useState<Checks | null>(null);

	const load = useCallback(async () => {
		const [dashRes, auditRes, checksRes] = await Promise.all([
			fetch('/api/admin/dashboard'),
			fetch('/api/admin/audit-log?page=1&pageSize=20'),
			fetch('/api/admin/system/checks')
		]);
		if (dashRes.ok) {
			setDashboard(await dashRes.json());
		}
		if (auditRes.ok) {
			const data = await auditRes.json();
			setAudit(data.entries);
		}
		if (checksRes.ok) {
			setChecks(await checksRes.json());
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">System</h1>
			{dashboard ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="rounded border p-4 dark:border-gray-700">
						<p className="text-sm text-gray-500">Users</p>
						<p className="text-2xl font-semibold">{dashboard.users}</p>
					</div>
					<div className="rounded border p-4 dark:border-gray-700">
						<p className="text-sm text-gray-500">Games</p>
						<p className="text-2xl font-semibold">{dashboard.games.total}</p>
						<p className="text-xs text-gray-500">
							{dashboard.games.active} active · {dashboard.games.neverExpire} never expire
						</p>
					</div>
					<div className="rounded border p-4 dark:border-gray-700">
						<p className="text-sm text-gray-500">Rule templates</p>
						<p className="text-2xl font-semibold">
							{dashboard.ruleTemplates.enabled + dashboard.ruleTemplates.disabled}
						</p>
						<p className="text-xs text-gray-500">
							{dashboard.ruleTemplates.disabled} disabled
						</p>
					</div>
					<div className="rounded border p-4 dark:border-gray-700">
						<p className="text-sm text-gray-500">Config</p>
						<p className="text-sm">Game TTL: {dashboard.config.gameTtlDays} days</p>
						<p className="text-sm">Video cache: {dashboard.config.videoSyncCacheMinutes} min</p>
					</div>
				</div>
			) : null}
			{checks ? (
				<section className="rounded border p-4 dark:border-gray-700">
					<h2 className="font-semibold">Checks</h2>
					<ul className="mt-2 text-sm">
						<li>Database: {checks.database}</li>
						<li>RSS reachable: {checks.rssReachable ? 'yes' : 'no'}</li>
						<li>AUTH_SECRET: {checks.env.authSecret ? 'set' : 'missing'}</li>
						<li>Discord OAuth: {checks.env.discordOAuth ? 'set' : 'missing'}</li>
						<li>ADMIN_DISCORD_IDS: {checks.env.adminDiscordIds ? 'set' : 'empty'}</li>
					</ul>
					<p className="mt-3">
						<Link href="/api/health" target="_blank" className="text-indigo-600">
							Open public health check
						</Link>
					</p>
				</section>
			) : null}
			<section>
				<h2 className="font-semibold">Recent audit log</h2>
				<ul className="mt-2 space-y-1 text-sm">
					{audit.map((entry) => (
						<li key={entry.id} className="border-b border-gray-100 py-1 dark:border-gray-800">
							{new Date(entry.createdAt).toLocaleString()} — {entry.action} ({entry.entityType}/
							{entry.entityId})
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
