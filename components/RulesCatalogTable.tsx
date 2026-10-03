import type { RuleTemplateListItem } from '@/lib/rules/ruleCatalog';
import { getDrinkName } from '@/lib/rules/drinks';

function categoryLabel(category: string) {
	return category.charAt(0).toUpperCase() + category.slice(1);
}

export function RulesCatalogTable({ rules }: { rules: RuleTemplateListItem[] }) {
	return (
		<div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-800">
			<table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
				<thead className="bg-gray-50 dark:bg-gray-900/50">
					<tr>
						<th className="px-4 py-3 font-semibold">Rule</th>
						<th className="px-4 py-3 font-semibold">Category</th>
						<th className="px-4 py-3 font-semibold">Drink</th>
						<th className="px-4 py-3 font-semibold">Weight</th>
						<th className="px-4 py-3 font-semibold">Created</th>
						<th className="px-4 py-3 font-semibold">Used in games</th>
						<th className="px-4 py-3 font-semibold">Rating</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
					{rules.map((rule) => {
						const drink = getDrinkName(rule.baseDrink);
						return (
							<tr key={rule.id} className="align-top">
								<td className="max-w-md px-4 py-3">{rule.text}</td>
								<td className="px-4 py-3 whitespace-nowrap">{categoryLabel(rule.category)}</td>
								<td className="px-4 py-3 whitespace-nowrap">
									{drink.icon} {drink.name}
								</td>
								<td className="px-4 py-3">{rule.weight.toFixed(2)}</td>
								<td className="px-4 py-3 whitespace-nowrap">
									{rule.createdAt.toLocaleDateString()}
								</td>
								<td className="px-4 py-3 text-center">{rule.usageCount}</td>
								<td className="px-4 py-3">
									<div
										className="flex items-center gap-3 text-gray-500 dark:text-gray-400"
										aria-label="Ratings coming soon"
									>
										<span className="inline-flex items-center gap-1" title="Thumbs up">
											<span aria-hidden>👍</span>
											<span>{rule.thumbsUp}</span>
										</span>
										<span className="inline-flex items-center gap-1" title="Thumbs down">
											<span aria-hidden>👎</span>
											<span>{rule.thumbsDown}</span>
										</span>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
