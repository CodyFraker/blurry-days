import { NextResponse } from 'next/server';
import { listRuleTemplates, parseListRulesQuery } from '@/lib/rules/ruleCatalog';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const parsed = parseListRulesQuery(searchParams);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
		}

		const result = await listRuleTemplates(parsed.data);

		return NextResponse.json({
			rules: result.rules.map((rule) => ({
				id: rule.id,
				text: rule.text,
				category: rule.category,
				weight: rule.weight,
				baseDrink: rule.baseDrink,
				usageCount: rule.usageCount,
				createdAt: rule.createdAt.toISOString(),
				thumbsUp: rule.thumbsUp,
				thumbsDown: rule.thumbsDown
			})),
			pagination: result.pagination
		});
	} catch (error) {
		console.error('Error listing rules:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
