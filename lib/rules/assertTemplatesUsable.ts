import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ruleTemplates } from '@/lib/db/schema';

export async function assertRuleTemplatesUsable(templateIds: string[]): Promise<{
	ok: true;
} | { ok: false; error: string }> {
	const uniqueIds = [...new Set(templateIds.filter(Boolean))];
	if (uniqueIds.length === 0) {
		return { ok: true };
	}

	const rows = await db
		.select({ id: ruleTemplates.id, enabled: ruleTemplates.enabled })
		.from(ruleTemplates)
		.where(inArray(ruleTemplates.id, uniqueIds));

	if (rows.length !== uniqueIds.length) {
		return { ok: false, error: 'One or more rule templates were not found' };
	}

	const disabled = rows.filter((r) => !r.enabled);
	if (disabled.length > 0) {
		return { ok: false, error: 'One or more rule templates are disabled' };
	}

	return { ok: true };
}

export async function isTemplateEnabled(id: string): Promise<boolean> {
	const row = await db
		.select({ enabled: ruleTemplates.enabled })
		.from(ruleTemplates)
		.where(and(eq(ruleTemplates.id, id), eq(ruleTemplates.enabled, true)))
		.limit(1);
	return row.length > 0;
}
