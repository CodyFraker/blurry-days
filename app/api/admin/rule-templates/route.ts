import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import {
	createRuleTemplateSchema,
	listAdminRuleTemplatesQuerySchema
} from '@/lib/admin/ruleTemplates/schemas';
import { listAdminRuleTemplates } from '@/lib/admin/ruleTemplates/ruleTemplateAdmin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { ruleTemplates } from '@/lib/db/schema';
import { parseListRulesQuery } from '@/lib/rules/ruleCatalog';

/**
 * GET /api/admin/rule-templates
 *
 * Paginated rule templates for admins. Query: page, pageSize, includeDisabled (default true).
 *
 * - 401 / 403 — auth
 * - 200 — `{ rules, pagination }`
 */
export async function GET(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { searchParams } = new URL(request.url);
	const listParsed = parseListRulesQuery(searchParams);
	if (!listParsed.success) {
		return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
	}

	const adminQuery = listAdminRuleTemplatesQuerySchema.safeParse({
		page: searchParams.get('page') ?? undefined,
		pageSize: searchParams.get('pageSize') ?? undefined,
		includeDisabled: searchParams.get('includeDisabled') ?? undefined
	});
	if (!adminQuery.success) {
		return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
	}

	const result = await listAdminRuleTemplates(listParsed.data, adminQuery.data.includeDisabled);

	return NextResponse.json({
		rules: result.rules.map((rule) => ({
			...rule,
			createdAt: rule.createdAt.toISOString()
		})),
		pagination: result.pagination
	});
}

/**
 * POST /api/admin/rule-templates
 *
 * Create a rule template.
 *
 * - 401 / 403 — auth
 * - 400 — validation error
 * - 201 — created rule
 */
export async function POST(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const body = await request.json();
	const parsed = createRuleTemplateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
	}

	const [created] = await db
		.insert(ruleTemplates)
		.values({
			text: parsed.data.text,
			category: parsed.data.category,
			weight: parsed.data.weight,
			baseDrink: parsed.data.baseDrink,
			enabled: parsed.data.enabled
		})
		.returning();

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'rule_template.create',
		entityType: 'rule_template',
		entityId: created.id
	});

	return NextResponse.json(
		{
			rule: {
				...created,
				createdAt: created.createdAt.toISOString()
			}
		},
		{ status: 201 }
	);
}
