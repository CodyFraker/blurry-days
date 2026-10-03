'use client';

import { useState } from 'react';
import type { AdminRuleRow } from '@/components/admin/AdminRulesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
	nativeSelectClassName,
	ruleCategories,
	ruleDrinkOptions,
	type RuleCategory,
	type RuleTemplateFormValues
} from '@/lib/admin/ruleTemplates/ruleFormConstants';

export type RuleTemplateUpdatePayload = {
	text: string;
	category: RuleCategory;
	weight: number;
	baseDrink: number;
	enabled: boolean;
	description: string | null;
};

function ruleToFormValues(rule: AdminRuleRow): RuleTemplateFormValues {
	return {
		text: rule.text,
		description: rule.description ?? '',
		category: rule.category as RuleCategory,
		weight: rule.weight,
		baseDrink: rule.baseDrink,
		enabled: rule.enabled
	};
}

function formToPayload(values: RuleTemplateFormValues): RuleTemplateUpdatePayload {
	return {
		text: values.text.trim(),
		category: values.category,
		weight: values.weight,
		baseDrink: values.baseDrink,
		enabled: values.enabled,
		description: values.description.trim() === '' ? null : values.description
	};
}

type AdminRuleEditSheetProps = {
	rule: AdminRuleRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (ruleId: string, payload: RuleTemplateUpdatePayload) => Promise<void>;
	saving: boolean;
};

type RuleEditFormProps = {
	rule: AdminRuleRow;
	onSave: (ruleId: string, payload: RuleTemplateUpdatePayload) => Promise<void>;
	saving: boolean;
	onOpenChange: (open: boolean) => void;
};

function RuleEditForm({ rule, onSave, saving, onOpenChange }: RuleEditFormProps) {
	const [form, setForm] = useState(() => ruleToFormValues(rule));

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		await onSave(rule.id, formToPayload(form));
	}

	const dirty = (() => {
		const next = formToPayload(form);
		const original = formToPayload(ruleToFormValues(rule));
		return (
			next.text !== original.text ||
			next.category !== original.category ||
			next.weight !== original.weight ||
			next.baseDrink !== original.baseDrink ||
			next.enabled !== original.enabled ||
			next.description !== original.description
		);
	})();

	return (
		<>
			<form id="admin-rule-edit-form" onSubmit={handleSubmit} className="space-y-4 px-4">
				<div className="space-y-2">
					<Label htmlFor="edit-rule-text">Rule text</Label>
					<Textarea
						id="edit-rule-text"
						rows={3}
						value={form.text}
						onChange={(e) => setForm({ ...form, text: e.target.value })}
						required
						placeholder="Use {host} for the host name"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="edit-rule-guidance">Player guidance</Label>
					<Textarea
						id="edit-rule-guidance"
						rows={3}
						value={form.description}
						onChange={(e) => setForm({ ...form, description: e.target.value })}
						placeholder="Optional guidance for edge cases"
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="edit-rule-category">Category</Label>
						<select
							id="edit-rule-category"
							className={nativeSelectClassName}
							value={form.category}
							onChange={(e) => setForm({ ...form, category: e.target.value as RuleCategory })}
						>
							{ruleCategories.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edit-rule-drink">Drink</Label>
						<select
							id="edit-rule-drink"
							className={nativeSelectClassName}
							value={form.baseDrink}
							onChange={(e) => setForm({ ...form, baseDrink: Number(e.target.value) })}
						>
							{ruleDrinkOptions.map((d) => (
								<option key={d.value} value={d.value}>
									{d.label}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edit-rule-weight">Weight</Label>
						<Input
							id="edit-rule-weight"
							type="number"
							step="0.1"
							min="0.1"
							value={form.weight}
							onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
							required
						/>
					</div>
					<div className="flex items-end gap-3 pb-1">
						<Switch
							id="edit-rule-enabled"
							checked={form.enabled}
							onCheckedChange={(enabled) => setForm({ ...form, enabled })}
						/>
						<Label htmlFor="edit-rule-enabled">Enabled in catalog</Label>
					</div>
				</div>
			</form>
			<SheetFooter>
				<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button
					type="submit"
					form="admin-rule-edit-form"
					disabled={!dirty || saving || !form.text.trim()}
				>
					{saving ? 'Saving…' : 'Save changes'}
				</Button>
			</SheetFooter>
		</>
	);
}

export function AdminRuleEditSheet({
	rule,
	open,
	onOpenChange,
	onSave,
	saving
}: AdminRuleEditSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="bottom" className="overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Edit rule</SheetTitle>
					<SheetDescription>Update catalog fields. Changes apply to new games.</SheetDescription>
				</SheetHeader>
				{rule && open ? (
					<RuleEditForm
						key={rule.id}
						rule={rule}
						onSave={onSave}
						saving={saving}
						onOpenChange={onOpenChange}
					/>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
