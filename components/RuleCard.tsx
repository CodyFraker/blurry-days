import { CategoryIcon } from '@/lib/brand/categoryIcons';
import { getDrinkName } from '@/lib/rules/drinks';

export type RuleView = {
	id: string;
	text: string;
	category: string;
	baseDrink: number;
	order?: number;
	isCustom?: boolean;
	ruleTemplateId?: string | null;
	description?: string | null;
};

function categoryLabel(category: string) {
	return category.charAt(0).toUpperCase() + category.slice(1);
}

export function RuleCard({
	rule,
	index,
	actions,
	indexBadgeVariant = 'default',
	showCategoryIcon = true
}: {
	rule: RuleView;
	index: number;
	actions?: React.ReactNode;
	indexBadgeVariant?: 'default' | 'frameNumber';
	showCategoryIcon?: boolean;
}) {
	const drink = getDrinkName(rule.baseDrink);

	return (
		<div
			className={`relative rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
				rule.isCustom
					? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40'
					: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
			}`}
		>
			{rule.isCustom && (
				<span
					className="mb-2 inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white max-sm:static sm:absolute sm:right-4 sm:top-4 sm:mb-0"
				>
					Custom
				</span>
			)}
			<div className="mb-3 flex items-center justify-between gap-2">
				<span
					className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${
						indexBadgeVariant === 'frameNumber'
							? 'border border-blue-400/60 bg-blue-700 font-mono tabular-nums'
							: 'bg-blue-600'
					}`}
				>
					{index + 1}
				</span>
				<span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
					<span>{drink.icon}</span>
					{drink.name}
				</span>
			</div>
			<p className="mb-4 text-gray-900 dark:text-gray-100">{rule.text}</p>
			{rule.description ? (
				<p
					data-testid="rule-guidance"
					className="mb-4 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
				>
					<span className="font-medium text-gray-700 dark:text-gray-300">Guidance: </span>
					{rule.description}
				</p>
			) : null}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
					{showCategoryIcon ? <CategoryIcon category={rule.category} /> : null}
					{categoryLabel(rule.category)}
				</span>
				{actions}
			</div>
		</div>
	);
}
