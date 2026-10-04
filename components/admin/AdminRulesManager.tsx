'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminRuleCreateSheet } from '@/components/admin/AdminRuleCreateSheet';
import {
	AdminRuleEditSheet,
	type RuleTemplateUpdatePayload
} from '@/components/admin/AdminRuleEditSheet';
import { AdminRulesTable, type AdminRuleRow } from '@/components/admin/AdminRulesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { nativeSelectClassName, ruleCategories } from '@/lib/admin/ruleTemplates/ruleFormConstants';
import type { RuleTemplatePayload } from '@/lib/admin/ruleTemplates/ruleTemplateForm';
import { cn } from '@/lib/utils';

const FETCH_PAGE_SIZE = 100;
const TABLE_PAGE_SIZE = 25;

type Pagination = {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

function apiRuleToRow(rule: {
	id: string;
	text: string;
	category: string;
	weight: number;
	baseDrink: number;
	usageCount?: number;
	enabled: boolean;
	description: string | null;
	thumbsUp?: number;
	thumbsDown?: number;
}): AdminRuleRow {
	return {
		id: rule.id,
		text: rule.text,
		category: rule.category,
		weight: rule.weight,
		baseDrink: rule.baseDrink,
		usageCount: rule.usageCount ?? 0,
		enabled: rule.enabled,
		description: rule.description,
		thumbsUp: rule.thumbsUp ?? 0,
		thumbsDown: rule.thumbsDown ?? 0
	};
}

export function AdminRulesManager() {
	const [rules, setRules] = useState<AdminRuleRow[]>([]);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [includeDisabled, setIncludeDisabled] = useState(true);
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [clientPage, setClientPage] = useState(1);
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [savingCreate, setSavingCreate] = useState(false);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [editingRule, setEditingRule] = useState<AdminRuleRow | null>(null);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [savingEdit, setSavingEdit] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams({
				page: '1',
				pageSize: String(FETCH_PAGE_SIZE),
				includeDisabled: includeDisabled ? 'true' : 'false'
			});
			const res = await fetch(`/api/admin/rule-templates?${params}`);
			if (!res.ok) {
				throw new Error('Failed to load rules');
			}
			const data = await res.json();
			setRules(data.rules);
			setPagination(data.pagination);
			setEditingRule((current) => {
				if (!current) {
					return null;
				}
				const refreshed = (data.rules as AdminRuleRow[]).find((r) => r.id === current.id);
				return refreshed ?? null;
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load');
		} finally {
			setLoading(false);
		}
	}, [includeDisabled]);

	useEffect(() => {
		queueMicrotask(() => {
			void load();
		});
	}, [load]);

	useEffect(() => {
		if (!successMessage) {
			return;
		}
		const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
		return () => window.clearTimeout(timer);
	}, [successMessage]);

	const filteredRules = useMemo(() => {
		const q = search.trim().toLowerCase();
		return rules.filter((rule) => {
			if (categoryFilter !== 'all' && rule.category !== categoryFilter) {
				return false;
			}
			if (!q) {
				return true;
			}
			const haystack = `${rule.text} ${rule.description ?? ''}`.toLowerCase();
			return haystack.includes(q);
		});
	}, [rules, search, categoryFilter]);

	const clientTotalPages = Math.max(1, Math.ceil(filteredRules.length / TABLE_PAGE_SIZE));
	const activePage = Math.min(clientPage, clientTotalPages);
	const pagedRules = useMemo(() => {
		const start = (activePage - 1) * TABLE_PAGE_SIZE;
		return filteredRules.slice(start, start + TABLE_PAGE_SIZE);
	}, [filteredRules, activePage]);

	function openCreate() {
		setEditSheetOpen(false);
		setEditingRule(null);
		setCreateSheetOpen(true);
	}

	function openEdit(rule: AdminRuleRow) {
		setCreateSheetOpen(false);
		setEditingRule(rule);
		setEditSheetOpen(true);
	}

	async function createRule(payload: RuleTemplatePayload, _addAnother: boolean): Promise<boolean> {
		setError(null);
		setSavingCreate(true);
		const res = await fetch('/api/admin/rule-templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				text: payload.text,
				description: payload.description,
				category: payload.category,
				weight: payload.weight,
				baseDrink: payload.baseDrink,
				enabled: payload.enabled
			})
		});
		setSavingCreate(false);
		if (!res.ok) {
			setError('Create failed');
			return false;
		}
		const data = await res.json();
		const created = apiRuleToRow(data.rule);
		setRules((prev) => [created, ...prev]);
		if (pagination) {
			setPagination({ ...pagination, total: pagination.total + 1 });
		}
		setSuccessMessage('Rule created');
		return true;
	}

	async function toggleEnabled(rule: AdminRuleRow) {
		setError(null);
		const next = !rule.enabled;
		setTogglingId(rule.id);
		setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: next } : r)));
		if (editingRule?.id === rule.id) {
			setEditingRule((r) => (r ? { ...r, enabled: next } : r));
		}
		const res = await fetch(`/api/admin/rule-templates/${rule.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ enabled: next })
		});
		setTogglingId(null);
		if (!res.ok) {
			setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: rule.enabled } : r)));
			if (editingRule?.id === rule.id) {
				setEditingRule((r) => (r ? { ...r, enabled: rule.enabled } : r));
			}
			setError('Update failed');
			return;
		}
	}

	async function saveRuleEdit(ruleId: string, payload: RuleTemplateUpdatePayload) {
		setError(null);
		setSavingEdit(true);
		const res = await fetch(`/api/admin/rule-templates/${ruleId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		setSavingEdit(false);
		if (!res.ok) {
			setError('Failed to save rule');
			return;
		}
		setRules((prev) =>
			prev.map((r) =>
				r.id === ruleId
					? {
							...r,
							text: payload.text,
							category: payload.category,
							weight: payload.weight,
							baseDrink: payload.baseDrink,
							enabled: payload.enabled,
							description: payload.description
						}
					: r
			)
		);
		setEditingRule((r) =>
			r && r.id === ruleId
				? {
						...r,
						text: payload.text,
						category: payload.category,
						weight: payload.weight,
						baseDrink: payload.baseDrink,
						enabled: payload.enabled,
						description: payload.description
					}
				: r
		);
		setSuccessMessage('Rule updated');
		setEditSheetOpen(false);
	}

	async function deleteRule(id: string) {
		setError(null);
		const res = await fetch(`/api/admin/rule-templates/${id}`, { method: 'DELETE' });
		if (!res.ok && res.status !== 204) {
			setError('Delete failed');
			return;
		}
		setRules((prev) => prev.filter((r) => r.id !== id));
		if (editingRule?.id === id) {
			setEditSheetOpen(false);
			setEditingRule(null);
		}
		setSuccessMessage('Rule deleted');
		if (pagination) {
			setPagination({ ...pagination, total: Math.max(0, pagination.total - 1) });
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Rule catalog</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage templates used when generating games.
						{pagination && pagination.total > FETCH_PAGE_SIZE
							? ` Showing first ${FETCH_PAGE_SIZE} of ${pagination.total} rules.`
							: null}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<Button type="button" className="gap-1.5" onClick={openCreate}>
						<Plus className="size-4" />
						Add rule
					</Button>
					<Label htmlFor="show-disabled" className="text-sm text-muted-foreground">
						Show disabled
					</Label>
					<Switch
						id="show-disabled"
						checked={includeDisabled}
						onCheckedChange={(checked) => {
							setIncludeDisabled(checked);
							setClientPage(1);
						}}
					/>
				</div>
			</div>

			{error ? (
				<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}
			{successMessage ? (
				<p
					className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
					role="status"
				>
					{successMessage}
				</p>
			) : null}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
					<div className="min-w-[12rem] flex-1 space-y-2">
						<Label htmlFor="rule-search">Search</Label>
						<Input
							id="rule-search"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setClientPage(1);
							}}
							placeholder="Filter by rule text or guidance"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="rule-category-filter">Category</Label>
						<select
							id="rule-category-filter"
							className={cn(nativeSelectClassName, 'min-w-[10rem]')}
							value={categoryFilter}
							onChange={(e) => {
								setCategoryFilter(e.target.value);
								setClientPage(1);
							}}
						>
							<option value="all">All categories</option>
							{ruleCategories.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">
					{filteredRules.length} rule{filteredRules.length === 1 ? '' : 's'}
				</p>
			</div>

			{loading ? (
				<div className="space-y-2 rounded-xl border border-border bg-card p-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<>
					<AdminRulesTable
						rules={pagedRules}
						onEdit={openEdit}
						onToggleEnabled={toggleEnabled}
						onDelete={deleteRule}
						togglingId={togglingId}
					/>
					{filteredRules.length > TABLE_PAGE_SIZE ? (
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="text-sm text-muted-foreground">
								Page {activePage} of {clientTotalPages}
							</p>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={activePage <= 1}
									onClick={() => setClientPage((p) => p - 1)}
								>
									Previous
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={activePage >= clientTotalPages}
									onClick={() => setClientPage((p) => p + 1)}
								>
									Next
								</Button>
							</div>
						</div>
					) : null}
				</>
			)}

			<AdminRuleCreateSheet
				open={createSheetOpen}
				onOpenChange={setCreateSheetOpen}
				onCreate={createRule}
				saving={savingCreate}
			/>

			<AdminRuleEditSheet
				rule={editingRule}
				open={editSheetOpen}
				onOpenChange={(open) => {
					setEditSheetOpen(open);
					if (!open) {
						setEditingRule(null);
					}
				}}
				onSave={saveRuleEdit}
				saving={savingEdit}
			/>
		</div>
	);
}
