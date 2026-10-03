import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ruleTemplates, rules } from '@/lib/db/schema';

export type PlayableGameRule = {
	id: string;
	text: string;
	category: string;
	baseDrink: number;
	order: number;
	isCustom: boolean;
	description: string | null;
};

export async function getPlayableGameRules(gameId: string): Promise<PlayableGameRule[]> {
	const rows = await db
		.select({
			id: rules.id,
			text: rules.text,
			category: rules.category,
			baseDrink: rules.baseDrink,
			order: rules.order,
			isCustom: rules.isCustom,
			description: ruleTemplates.description
		})
		.from(rules)
		.leftJoin(ruleTemplates, eq(rules.ruleTemplateId, ruleTemplates.id))
		.where(eq(rules.gameId, gameId))
		.orderBy(asc(rules.order));

	return rows.map((row) => ({
		id: row.id,
		text: row.text,
		category: row.category,
		baseDrink: row.baseDrink,
		order: row.order,
		isCustom: row.isCustom,
		description: row.isCustom ? null : row.description
	}));
}
