import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ruleTemplates, ruleVotes } from '@/lib/db/schema';
import type { ListRulesQuery } from '@/lib/rules/ruleCatalog';

export type AdminRuleTemplateListItem = {
	id: string;
	text: string;
	category: string;
	weight: number;
	baseDrink: number;
	usageCount: number;
	enabled: boolean;
	description: string | null;
	createdAt: Date;
	thumbsUp: number;
	thumbsDown: number;
};

export async function listAdminRuleTemplates(
	query: ListRulesQuery,
	includeDisabled: boolean
): Promise<{
	rules: AdminRuleTemplateListItem[];
	pagination: { page: number; pageSize: number; total: number; totalPages: number };
}> {
	const enabledFilter = includeDisabled ? undefined : eq(ruleTemplates.enabled, true);

	const rows = await db
		.select({
			id: ruleTemplates.id,
			text: ruleTemplates.text,
			category: ruleTemplates.category,
			weight: ruleTemplates.weight,
			baseDrink: ruleTemplates.baseDrink,
			usageCount: ruleTemplates.usageCount,
			enabled: ruleTemplates.enabled,
			description: ruleTemplates.description,
			createdAt: ruleTemplates.createdAt,
			thumbsUp: sql<number>`(
				select count(*)::int from ${ruleVotes}
				where ${ruleVotes.ruleTemplateId} = ${ruleTemplates.id} and ${ruleVotes.vote} = 1
			)`.mapWith(Number),
			thumbsDown: sql<number>`(
				select count(*)::int from ${ruleVotes}
				where ${ruleVotes.ruleTemplateId} = ${ruleTemplates.id} and ${ruleVotes.vote} = -1
			)`.mapWith(Number)
		})
		.from(ruleTemplates)
		.where(enabledFilter)
		.orderBy(desc(ruleTemplates.createdAt))
		.limit(query.limit)
		.offset(query.offset);

	const countResult = await db
		.select({ total: sql<number>`count(*)::int` })
		.from(ruleTemplates)
		.where(enabledFilter);

	const total = countResult[0]?.total ?? 0;
	const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

	return {
		rules: rows,
		pagination: {
			page: query.page,
			pageSize: query.pageSize,
			total,
			totalPages
		}
	};
}

export async function getAdminRuleTemplateById(id: string) {
	const rows = await db
		.select({
			id: ruleTemplates.id,
			text: ruleTemplates.text,
			category: ruleTemplates.category,
			weight: ruleTemplates.weight,
			baseDrink: ruleTemplates.baseDrink,
			usageCount: ruleTemplates.usageCount,
			enabled: ruleTemplates.enabled,
			description: ruleTemplates.description,
			createdAt: ruleTemplates.createdAt,
			thumbsUp: sql<number>`(
				select count(*)::int from ${ruleVotes}
				where ${ruleVotes.ruleTemplateId} = ${ruleTemplates.id} and ${ruleVotes.vote} = 1
			)`.mapWith(Number),
			thumbsDown: sql<number>`(
				select count(*)::int from ${ruleVotes}
				where ${ruleVotes.ruleTemplateId} = ${ruleTemplates.id} and ${ruleVotes.vote} = -1
			)`.mapWith(Number)
		})
		.from(ruleTemplates)
		.where(eq(ruleTemplates.id, id))
		.limit(1);

	return rows[0] ?? null;
}
