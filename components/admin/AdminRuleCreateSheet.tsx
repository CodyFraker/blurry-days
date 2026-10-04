'use client';

import { useEffect, useState } from 'react';
import { RuleTemplateFormFields } from '@/components/admin/RuleTemplateFormFields';
import { Button } from '@/components/ui/button';
import {
	DraggableBottomSheet,
	DraggableBottomSheetContent
} from '@/components/ui/draggable-bottom-sheet';
import { SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { RuleTemplateFormValues } from '@/lib/admin/ruleTemplates/ruleFormConstants';
import {
	defaultRuleTemplateFormValues,
	formToPayload,
	type RuleTemplatePayload
} from '@/lib/admin/ruleTemplates/ruleTemplateForm';

export type { RuleTemplatePayload };

type AdminRuleCreateSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (payload: RuleTemplatePayload, addAnother: boolean) => Promise<boolean>;
	saving: boolean;
};

export function AdminRuleCreateSheet({
	open,
	onOpenChange,
	onCreate,
	saving
}: AdminRuleCreateSheetProps) {
	const [form, setForm] = useState<RuleTemplateFormValues>(defaultRuleTemplateFormValues);
	const [focusRuleText, setFocusRuleText] = useState(false);
	const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setFocusRuleText(true);
		}
	}, [open]);

	async function submit(addAnother: boolean) {
		setInlineSuccess(null);
		const ok = await onCreate(formToPayload(form), addAnother);
		if (!ok) {
			return;
		}
		if (addAnother) {
			setForm((current) => ({ ...current, text: '', description: '' }));
			setFocusRuleText(true);
			setInlineSuccess('Rule added. Enter the next rule below.');
		} else {
			onOpenChange(false);
		}
	}

	const canSubmit = form.text.trim().length > 0 && !saving;

	return (
		<DraggableBottomSheet open={open} onOpenChange={onOpenChange}>
			<DraggableBottomSheetContent onRequestClose={() => onOpenChange(false)}>
				<div className="min-h-0 flex-1 overflow-y-auto">
					<SheetHeader className="gap-0 px-4 pb-2 pt-0 pr-10 text-left">
						<SheetTitle className="text-base">New rule</SheetTitle>
						<SheetDescription className="text-xs">Add a template to the catalog.</SheetDescription>
					</SheetHeader>
					{inlineSuccess ? (
						<p className="px-4 pb-1 text-xs text-primary" role="status">
							{inlineSuccess}
						</p>
					) : null}
					<form
						id="admin-rule-create-form"
						onSubmit={(e) => {
							e.preventDefault();
							void submit(false);
						}}
						className="px-4"
					>
						<RuleTemplateFormFields
							idPrefix="create"
							form={form}
							compact
							onChange={(next) => {
								setFocusRuleText(false);
								setForm(next);
							}}
							focusRuleText={focusRuleText && open}
						/>
					</form>
					<SheetFooter className="mt-2 gap-1.5 border-t px-4 py-2 sm:flex-row sm:justify-end">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onOpenChange(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={!canSubmit}
							onClick={() => void submit(true)}
						>
							{saving ? 'Creating…' : 'Create and add another'}
						</Button>
						<Button type="submit" form="admin-rule-create-form" size="sm" disabled={!canSubmit}>
							{saving ? 'Creating…' : 'Create rule'}
						</Button>
					</SheetFooter>
				</div>
			</DraggableBottomSheetContent>
		</DraggableBottomSheet>
	);
}
