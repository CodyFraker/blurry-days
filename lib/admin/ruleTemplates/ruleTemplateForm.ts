import type { AdminRuleRow } from '@/components/admin/AdminRulesTable';
import { CategoryEnum, DrinkEnum } from '@/lib/db/enums';
import type { RuleCategory, RuleTemplateFormValues } from '@/lib/admin/ruleTemplates/ruleFormConstants';

export type RuleTemplatePayload = {
	text: string;
	category: RuleCategory;
	weight: number;
	baseDrink: number;
	enabled: boolean;
	description: string | null;
};

export function defaultRuleTemplateFormValues(): RuleTemplateFormValues {
	return {
		text: '',
		description: '',
		category: CategoryEnum.General,
		weight: 1,
		baseDrink: DrinkEnum.Sip,
		enabled: true
	};
}

export function ruleToFormValues(rule: AdminRuleRow): RuleTemplateFormValues {
	return {
		text: rule.text,
		description: rule.description ?? '',
		category: rule.category as RuleCategory,
		weight: rule.weight,
		baseDrink: rule.baseDrink,
		enabled: rule.enabled
	};
}

export function formToPayload(values: RuleTemplateFormValues): RuleTemplatePayload {
	return {
		text: values.text.trim(),
		category: values.category,
		weight: values.weight,
		baseDrink: values.baseDrink,
		enabled: values.enabled,
		description: values.description.trim() === '' ? null : values.description
	};
}
