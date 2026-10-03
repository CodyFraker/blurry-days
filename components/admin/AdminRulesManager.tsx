'use client';



import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChevronDown, Plus } from 'lucide-react';

import { CategoryEnum, DrinkEnum } from '@/lib/db/enums';

import {

	AdminRuleEditSheet,

	type RuleTemplateUpdatePayload

} from '@/components/admin/AdminRuleEditSheet';

import { AdminRulesTable, type AdminRuleRow } from '@/components/admin/AdminRulesTable';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {

	Collapsible,

	CollapsibleContent,

	CollapsibleTrigger

} from '@/components/ui/collapsible';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Skeleton } from '@/components/ui/skeleton';

import { Switch } from '@/components/ui/switch';

import { Textarea } from '@/components/ui/textarea';

import {

	nativeSelectClassName,

	ruleCategories,

	ruleDrinkOptions,

	type RuleCategory

} from '@/lib/admin/ruleTemplates/ruleFormConstants';

import { cn } from '@/lib/utils';



const FETCH_PAGE_SIZE = 100;

const TABLE_PAGE_SIZE = 25;



type Pagination = {

	page: number;

	pageSize: number;

	total: number;

	totalPages: number;

};



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

	const [createOpen, setCreateOpen] = useState(false);

	const [togglingId, setTogglingId] = useState<string | null>(null);

	const [editingRule, setEditingRule] = useState<AdminRuleRow | null>(null);

	const [editSheetOpen, setEditSheetOpen] = useState(false);

	const [savingEdit, setSavingEdit] = useState(false);

	const [form, setForm] = useState<{

		text: string;

		description: string;

		category: RuleCategory;

		weight: number;

		baseDrink: number;

		enabled: boolean;

	}>({

		text: '',

		description: '',

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



	function openEdit(rule: AdminRuleRow) {

		setEditingRule(rule);

		setEditSheetOpen(true);

	}



	async function createRule(e: React.FormEvent) {

		e.preventDefault();

		setError(null);

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

			description: '',

			category: CategoryEnum.General,

			weight: 1,

			baseDrink: DrinkEnum.Sip,

			enabled: true

		});

		setSuccessMessage('Rule created');

		setCreateOpen(false);

		await load();

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

				<div className="flex items-center gap-3">

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



			<Collapsible open={createOpen} onOpenChange={setCreateOpen}>

				<Card>

					<CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">

						<div>

							<CardTitle>New rule</CardTitle>

							<CardDescription>Add a template to the catalog.</CardDescription>

						</div>

						<CollapsibleTrigger asChild>

							<Button type="button" variant="outline" size="sm" className="gap-1">

								<Plus className="size-4" />

								{createOpen ? 'Hide' : 'Add rule'}

								<ChevronDown

									className={cn('size-4 transition-transform', createOpen && 'rotate-180')}

								/>

							</Button>

						</CollapsibleTrigger>

					</CardHeader>

					<CollapsibleContent>

						<CardContent>

							<form onSubmit={createRule} className="space-y-4">

								<div className="space-y-2">

									<Label htmlFor="new-rule-text">Rule text</Label>

									<Textarea

										id="new-rule-text"

										rows={2}

										value={form.text}

										onChange={(e) => setForm({ ...form, text: e.target.value })}

										required

										placeholder="Use {host} for the host name"

									/>

								</div>

								<div className="space-y-2">

									<Label htmlFor="new-rule-guidance">Guidance (optional)</Label>

									<Textarea

										id="new-rule-guidance"

										rows={2}

										value={form.description}

										onChange={(e) => setForm({ ...form, description: e.target.value })}

										placeholder="How players should handle edge cases"

									/>

								</div>

								<div className="flex flex-wrap items-end gap-3">

									<div className="space-y-2">

										<Label htmlFor="new-rule-category">Category</Label>

										<select

											id="new-rule-category"

											className={nativeSelectClassName}

											value={form.category}

											onChange={(e) =>

												setForm({

													...form,

													category: e.target.value as RuleCategory

												})

											}

										>

											{ruleCategories.map((c) => (

												<option key={c} value={c}>{c}</option>

											))}

										</select>

									</div>

									<div className="space-y-2">

										<Label htmlFor="new-rule-weight">Weight</Label>

										<Input

											id="new-rule-weight"

											type="number"

											step="0.1"

											min="0.1"

											className="w-24"

											value={form.weight}

											onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}

										/>

									</div>

									<div className="space-y-2">

										<Label htmlFor="new-rule-drink">Drink</Label>

										<select

											id="new-rule-drink"

											className={nativeSelectClassName}

											value={form.baseDrink}

											onChange={(e) => setForm({ ...form, baseDrink: Number(e.target.value) })}

										>

											{ruleDrinkOptions.map((d) => (

												<option key={d.value} value={d.value}>{d.label}</option>

											))}

										</select>

									</div>

									<Button type="submit">Create rule</Button>

								</div>

							</form>

						</CardContent>

					</CollapsibleContent>

				</Card>

			</Collapsible>



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

								<option key={c} value={c}>{c}</option>

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


