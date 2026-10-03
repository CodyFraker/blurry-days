import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, rules } from '@/lib/db/schema';
import { validateCreateGameBody } from '@/lib/games/validateCreateGame';
import { incrementRuleTemplateUsage } from '@/lib/rules/incrementTemplateUsage';
import { auth } from '@/lib/auth/config';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = validateCreateGameBody(body);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const { title, videoId, videoTitle, videoThumbnail, intoxicationLevel, rules: gameRules } =
			parsed.data;

		const session = await auth();
		const userId = session?.user?.id ?? null;

		const gameId = uuidv4();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		const newGame = await db
			.insert(games)
			.values({
				id: gameId,
				title: title || `${videoTitle} Drinking Game`,
				videoId,
				videoTitle,
				videoThumbnail: videoThumbnail ?? null,
				intoxicationLevel,
				userId,
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
