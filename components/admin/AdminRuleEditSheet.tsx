'use client';

import { useState } from 'react';
import type { AdminRuleRow } from '@/components/admin/AdminRulesTable';
import { RuleTemplateFormFields } from '@/components/admin/RuleTemplateFormFields';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle
} from '@/components/ui/sheet';
import {
	formToPayload,
	ruleToFormValues,
	type RuleTemplatePayload
} from '@/lib/admin/ruleTemplates/ruleTemplateForm';

export type RuleTemplateUpdatePayload = RuleTemplatePayload;

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
			<form id="admin-rule-edit-form" onSubmit={handleSubmit} className="px-4">
				<RuleTemplateFormFields idPrefix="edit" form={form} onChange={setForm} />
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
