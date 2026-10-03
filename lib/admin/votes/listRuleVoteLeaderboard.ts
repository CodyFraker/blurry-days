import { desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ruleTemplates, ruleVotes } from '@/lib/db/schema';

export async function listRuleVoteLeaderboard(limit = 50) {
	const rows = await db
		.select({
			id: ruleTemplates.id,
			text: ruleTemplates.text,
			enabled: ruleTemplates.enabled,
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
		.orderBy(
			desc(sql`(
				select count(*) from ${ruleVotes}
				where ${ruleVotes.ruleTemplateId} = ${ruleTemplates.id}
			)`)
		)
		.limit(limit);

	return rows.map((row) => ({
		...row,
		totalVotes: row.thumbsUp + row.thumbsDown
	}));
}
