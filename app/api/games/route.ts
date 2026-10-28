import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, rules } from '@/lib/db/schema';
import { computeDefaultGameExpiresAt } from '@/lib/games/gameTtl';
import { generateEditToken } from '@/lib/games/editToken';
import { validateCreateGameBody } from '@/lib/games/validateCreateGame';
import { assertRuleTemplatesUsable } from '@/lib/rules/assertTemplatesUsable';
import { incrementRuleTemplateUsage } from '@/lib/rules/incrementTemplateUsage';
import { auth } from '@/lib/auth/config';
import { getClientIp, rateLimitOrResponse } from '@/lib/security/rateLimit';
import { getYoutubeThumbnailUrl } from '@/lib/youtube/thumbnailUrl';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const CREATE_GAME_LIMIT = 10;
const CREATE_GAME_WINDOW_MS = 60_000;

export async function POST(request: Request) {
	try {
		const limited = rateLimitOrResponse(request, {
			key: `games:create:${getClientIp(request)}`,
			limit: CREATE_GAME_LIMIT,
			windowMs: CREATE_GAME_WINDOW_MS
		});
		if (limited) {
			return limited;
		}

		const body = await request.json();
		const parsed = validateCreateGameBody(body);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}

		const { title, videoId, videoTitle, intoxicationLevel, rules: gameRules } =
			parsed.data;
		const videoThumbnail = getYoutubeThumbnailUrl(videoId);

		const templateIds = gameRules
			.filter((rule) => !rule.isCustom && rule.ruleTemplateId)
			.map((rule) => rule.ruleTemplateId as string);
		const templateCheck = await assertRuleTemplatesUsable(templateIds);
		if (!templateCheck.ok) {
			return NextResponse.json({ error: templateCheck.error }, { status: 400 });
		}

		const session = await auth();
		const userId = session?.user?.id ?? null;

		const gameId = uuidv4();
		const expiresAt = computeDefaultGameExpiresAt();
		const { token: editToken, hash: editTokenHash } = generateEditToken();

		const newGame = await db
			.insert(games)
			.values({
				id: gameId,
				title: title || `${videoTitle} Drinking Game`,
				videoId,
				videoTitle,
				videoThumbnail,
				intoxicationLevel,
				userId,
				editTokenHash,
				expiresAt
			})
			.returning();

		await Promise.all(
			gameRules.map((rule, index) =>
				db.insert(rules).values({
					gameId,
					ruleTemplateId: rule.isCustom ? null : rule.ruleTemplateId ?? null,
					text: rule.text,
					category: rule.category,
					weight: rule.weight ?? 1.0,
					baseDrink: rule.baseDrink,
					isCustom: rule.isCustom ?? false,
					order: index + 1
				})
			)
		);

		await incrementRuleTemplateUsage(
			gameRules.filter((rule) => !rule.isCustom).map((rule) => rule.ruleTemplateId)
		);

		const createdRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, gameId))
			.orderBy(rules.order);

		return NextResponse.json({
			editToken,
			game: {
				id: gameId,
				title: newGame[0].title,
				videoTitle,
				videoThumbnail,
				intoxicationLevel,
				expiresAt: newGame[0].expiresAt
			},
			rules: createdRules
		});
	} catch (error) {
		console.error('Error creating game:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
