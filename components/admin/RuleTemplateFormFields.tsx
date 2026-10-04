'use client';

import { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
	nativeSelectClassName,
	ruleCategories,
	ruleDrinkOptions,
	type RuleCategory,
	type RuleTemplateFormValues
} from '@/lib/admin/ruleTemplates/ruleFormConstants';
import { cn } from '@/lib/utils';

type RuleTemplateFormFieldsProps = {
	idPrefix: string;
	form: RuleTemplateFormValues;
	onChange: (form: RuleTemplateFormValues) => void;
	focusRuleText?: boolean;
	compact?: boolean;
};

export function RuleTemplateFormFields({
	idPrefix,
	form,
	onChange,
	focusRuleText,
	compact = false
}: RuleTemplateFormFieldsProps) {
	const textRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (focusRuleText) {
			textRef.current?.focus();
		}
	}, [focusRuleText]);

	return (
		<div className={compact ? 'space-y-2.5' : 'space-y-4'}>
			<div className={compact ? 'space-y-1' : 'space-y-2'}>
				<Label htmlFor={`${idPrefix}-rule-text`}>Rule text</Label>
				<Textarea
					ref={textRef}
					id={`${idPrefix}-rule-text`}
					rows={compact ? 2 : 3}
					value={form.text}
					onChange={(e) => onChange({ ...form, text: e.target.value })}
					required
					placeholder="Use {host} for the host name"
				/>
			</div>
			<div className={compact ? 'space-y-1' : 'space-y-2'}>
				<Label htmlFor={`${idPrefix}-rule-guidance`}>Player guidance</Label>
				<Textarea
					id={`${idPrefix}-rule-guidance`}
					rows={compact ? 2 : 3}
					value={form.description}
					onChange={(e) => onChange({ ...form, description: e.target.value })}
					placeholder="Optional guidance for edge cases"
				/>
			</div>
			<div className={cn('grid sm:grid-cols-2', compact ? 'gap-2' : 'gap-4')}>
				<div className={compact ? 'space-y-1' : 'space-y-2'}>
					<Label htmlFor={`${idPrefix}-rule-category`}>Category</Label>
					<select
						id={`${idPrefix}-rule-category`}
						className={nativeSelectClassName}
						value={form.category}
						onChange={(e) => onChange({ ...form, category: e.target.value as RuleCategory })}
					>
						{ruleCategories.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div className={compact ? 'space-y-1' : 'space-y-2'}>
					<Label htmlFor={`${idPrefix}-rule-drink`}>Drink</Label>
					<select
						id={`${idPrefix}-rule-drink`}
						className={nativeSelectClassName}
						value={form.baseDrink}
						onChange={(e) => onChange({ ...form, baseDrink: Number(e.target.value) })}
					>
						{ruleDrinkOptions.map((d) => (
							<option key={d.value} value={d.value}>
								{d.label}
							</option>
						))}
					</select>
				</div>
				<div className={compact ? 'space-y-1' : 'space-y-2'}>
					<Label htmlFor={`${idPrefix}-rule-weight`}>Weight</Label>
					<Input
						id={`${idPrefix}-rule-weight`}
						type="number"
						step="0.1"
						min="0.1"
						value={form.weight}
						onChange={(e) => onChange({ ...form, weight: Number(e.target.value) })}
						required
					/>
				</div>
				<div className={cn('flex items-end gap-2', compact ? 'pb-0' : 'pb-1')}>
					<Switch
						id={`${idPrefix}-rule-enabled`}
						checked={form.enabled}
						onCheckedChange={(enabled) => onChange({ ...form, enabled })}
					/>
					<Label htmlFor={`${idPrefix}-rule-enabled`}>Enabled in catalog</Label>
				</div>
			</div>
		</div>
	);
}
