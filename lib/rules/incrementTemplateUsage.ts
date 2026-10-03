import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ruleTemplates } from '@/lib/db/schema';

export async function incrementRuleTemplateUsage(templateIds: (string | null | undefined)[]) {
	for (const id of templateIds) {
		if (!id) continue;
		await db
			.update(ruleTemplates)
			.set({ usageCount: sql`${ruleTemplates.usageCount} + 1` })
			.where(eq(ruleTemplates.id, id));
	}
}
