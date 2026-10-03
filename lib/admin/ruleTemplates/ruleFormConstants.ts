import { CategoryEnum, DrinkEnum } from '@/lib/db/enums';

export type RuleCategory = (typeof CategoryEnum)[keyof typeof CategoryEnum];

export const ruleCategories = Object.values(CategoryEnum);

export const ruleDrinkOptions = [
	{ value: DrinkEnum.Sip, label: 'Sip' },
	{ value: DrinkEnum.Gulp, label: 'Gulp' },
	{ value: DrinkEnum.Pull, label: 'Pull' },
	{ value: DrinkEnum.Shot, label: 'Shot' }
];

export const nativeSelectClassName =
	'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export type RuleTemplateFormValues = {
	text: string;
	description: string;
	category: RuleCategory;
	weight: number;
	baseDrink: number;
	enabled: boolean;
};
