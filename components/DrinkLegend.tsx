import { DrinkEnum } from '@/lib/db/schema';
import { getDrinkName } from '@/lib/rules/drinks';

const levels = [DrinkEnum.Sip, DrinkEnum.Gulp, DrinkEnum.Pull, DrinkEnum.Shot];

export function DrinkLegend() {
	return (
		<div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
			{levels.map((level) => {
				const drink = getDrinkName(level);
				return (
					<span key={level} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
						<span aria-hidden>{drink.icon}</span>
						{drink.name}
					</span>
				);
			})}
		</div>
	);
}
