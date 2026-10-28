import { NextResponse } from 'next/server';
import { generateRulesBodySchema } from '@/lib/games/schemas';
import { generateRulesForVideo } from '@/lib/rules/ruleEngine';
import { getClientIp, rateLimitOrResponse } from '@/lib/security/rateLimit';

const GENERATE_RULES_LIMIT = 30;
const GENERATE_RULES_WINDOW_MS = 60_000;

export async function POST(request: Request) {
	try {
		const limited = rateLimitOrResponse(request, {
			key: `games:generate-rules:${getClientIp(request)}`,
			limit: GENERATE_RULES_LIMIT,
			windowMs: GENERATE_RULES_WINDOW_MS
		});
		if (limited) {
			return limited;
		}

		const body = await request.json();
		const parsed = generateRulesBodySchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}

		const { videoId, videoTitle, numberOfRules, intoxicationLevel } = parsed.data;

		const rules = await generateRulesForVideo({
			videoId,
			videoTitle,
			numberOfRules,
			intoxicationLevel
		});

		return NextResponse.json({ rules });
	} catch (error) {
		console.error('Error generating rules:', error);
		return NextResponse.json({ error: 'Failed to generate rules' }, { status: 500 });
	}
}
