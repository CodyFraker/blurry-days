import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { CategoryEnum, ruleTemplates } from '@/lib/db/schema';
import { calculateEffectiveDrink } from '@/lib/rules/drinks';

export { calculateEffectiveDrink, getDrinkName } from '@/lib/rules/drinks';

export type RuleTemplatePoolItem = {
	id: string;
	text: string;
	category: (typeof CategoryEnum)[keyof typeof CategoryEnum];
	weight: number;
	baseDrink: number;
};

export function selectRulesFromPool(
	pool: RuleTemplatePoolItem[],
	_intoxicationLevel: number,
	maxRules: number = 5
): RuleTemplatePoolItem[] {
	const categories = Object.values(CategoryEnum) as (typeof CategoryEnum)[keyof typeof CategoryEnum][];
	const selectedCategories = shuffleArray(categories).slice(
		0,
		Math.min(3, Math.max(2, Math.floor(maxRules / 2)))
	);

	const categoryRules = pool.filter((rule) => (selectedCategories as string[]).includes(rule.category));

	const selectedRules: RuleTemplatePoolItem[] = [];
	const usedCategories = new Set<string>();

	while (selectedRules.length < maxRules && categoryRules.length > 0) {
		const totalWeight = categoryRules.reduce((sum, rule) => sum + rule.weight, 0);

		let random = Math.random() * totalWeight;
		let selectedIndex = -1;

		for (let i = 0; i < categoryRules.length; i++) {
			random -= categoryRules[i].weight;
			if (random <= 0) {
				selectedIndex = i;
				break;
			}
		}

		if (selectedIndex === -1) {
			selectedIndex = categoryRules.length - 1;
		}

		const selectedRule = categoryRules[selectedIndex];
		selectedRules.push(selectedRule);
		usedCategories.add(selectedRule.category);

		categoryRules.splice(selectedIndex, 1);

		if (usedCategories.size >= 2) {
			break;
		}
	}

	while (selectedRules.length < maxRules && categoryRules.length > 0) {
		const randomIndex = Math.floor(Math.random() * categoryRules.length);
		selectedRules.push(categoryRules[randomIndex]);
		categoryRules.splice(randomIndex, 1);
	}

	return selectedRules;
}

export async function selectRules(
	intoxicationLevel: number,
	maxRules: number = 5
): Promise<RuleTemplatePoolItem[]> {
	const rows = await db.select().from(ruleTemplates).where(eq(ruleTemplates.enabled, true));
	const pool: RuleTemplatePoolItem[] = rows.map((row) => ({
		id: row.id,
		text: row.text,
		category: row.category as RuleTemplatePoolItem['category'],
		weight: row.weight,
		baseDrink: row.baseDrink
	}));
	return selectRulesFromPool(pool, intoxicationLevel, maxRules);
}

export function substituteHostInRuleText(text: string, videoTitle: string): string {
	const hostName = extractHostName(videoTitle) || 'the host';
	return text.replace(/{host}/g, hostName);
}

export async function generateRulesForVideo({
	videoTitle,
	numberOfRules,
	intoxicationLevel
}: {
	videoId: string;
	videoTitle: string;
	numberOfRules: number;
	intoxicationLevel: number;
}) {
	const selectedRules = await selectRules(intoxicationLevel, numberOfRules);

	return selectedRules.map((rule) => ({
		ruleTemplateId: rule.id,
		text: substituteHostInRuleText(rule.text, videoTitle),
		category: rule.category,
		baseDrink: calculateEffectiveDrink(rule.baseDrink, intoxicationLevel - 1),
		weight: rule.weight,
		isCustom: false
	}));
}

function extractHostName(_videoTitle: string): string | null {
	void _videoTitle;
	return 'the host';
}

function shuffleArray<T>(array: readonly T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
