import type { RuleTemplateListItem } from '@/lib/rules/ruleCatalog';
import { CategoryIcon } from '@/lib/brand/categoryIcons';
import { getDrinkName } from '@/lib/rules/drinks';

function categoryLabel(category: string) {
	return category.charAt(0).toUpperCase() + category.slice(1);
}

export function RulesCatalogCards({ rules }: { rules: RuleTemplateListItem[] }) {
	return (
		<ul className="space-y-3 md:hidden">
			{rules.map((rule) => {
				const drink = getDrinkName(rule.baseDrink);
				return (
					<li
						key={rule.id}
						className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
					>
						<p className="font-medium text-gray-900 dark:text-gray-50">{rule.text}</p>
						<div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
							<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
								<CategoryIcon category={rule.category} />
								{categoryLabel(rule.category)}
							</span>
							<span>{drink.icon} {drink.name}</span>
							<span>Used in {rule.usageCount} games</span>
						</div>
						<p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
							Weight {rule.weight.toFixed(2)} · {rule.createdAt.toLocaleDateString()} · 👍{' '}
							{rule.thumbsUp} 👎 {rule.thumbsDown}
						</p>
					</li>
				);
			})}
		</ul>
	);
}
