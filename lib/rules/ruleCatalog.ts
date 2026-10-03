import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { ruleTemplates, ruleVotes } from '@/lib/db/schema';

const listRulesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

export type ListRulesQuery = z.infer<typeof listRulesQuerySchema> & {
	offset: number;
	limit: number;
};

export function parseListRulesQuery(
	searchParams: URLSearchParams | Record<string, string | string[] | undefined>
) {
	const raw: Record<string, string> = {};
	if (searchParams instanceof URLSearchParams) {
		searchParams.forEach((value, key) => {
			raw[key] = value;
		});
	} else {
		for (const [key, value] of Object.entries(searchParams)) {
			if (value === undefined) continue;
			raw[key] = Array.isArray(value) ? value[0] : value;
		}
	}

	const parsed = listRulesQuerySchema.safeParse(raw);
	if (!parsed.success) {
		return { success: false as const, error: parsed.error };
	}

	const { page, pageSize } = parsed.data;
	return {
		success: true as const,
		data: {
			page,
			pageSize,
			offset: (page - 1) * pageSize,
			limit: pageSize
		}
	};
}

export type RuleTemplateListItem = {
	id: string;
	text: string;
	category: string;
	weight: number;
	baseDrink: number;
	usageCount: number;
	description: string | null;
	createdAt: Date;
	thumbsUp: number;
	thumbsDown: number;
};

export type ListRuleTemplatesResult = {
	rules: RuleTemplateListItem[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
};

export async function listRuleTemplates(query: ListRulesQuery): Promise<ListRuleTemplatesResult> {
	const rows = await db
		.select({
			id: ruleTemplates.id,
			text: ruleTemplates.text,
			category: ruleTemplates.category,
			weight: ruleTemplates.weight,
			baseDrink: ruleTemplates.baseDrink,
			usageCount: ruleTemplates.usageCount,
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
		.where(eq(ruleTemplates.enabled, true))
		.orderBy(desc(ruleTemplates.createdAt))
		.limit(query.limit)
		.offset(query.offset);

	const countResult = await db
		.select({ total: sql<number>`count(*)::int` })
		.from(ruleTemplates)
		.where(eq(ruleTemplates.enabled, true));

	const total = countResult[0]?.total ?? 0;
	const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

	return {
		rules: rows.map((row) => ({
			id: row.id,
			text: row.text,
			category: row.category,
			weight: row.weight,
			baseDrink: row.baseDrink,
			usageCount: row.usageCount,
			description: row.description,
			createdAt: row.createdAt,
			thumbsUp: row.thumbsUp,
			thumbsDown: row.thumbsDown
		})),
		pagination: {
			page: query.page,
			pageSize: query.pageSize,
			total,
			totalPages
		}
	};
}
