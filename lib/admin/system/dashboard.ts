import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
	adminAuditLog,
	games,
	ruleTemplates,
	users,
	youtubeVideos
} from '@/lib/db/schema';
import { getGameTtlDays } from '@/lib/games/gameTtl';
import {
	getLatestVideoSyncTime,
	getVideoSyncCacheMinutes
} from '@/lib/youtube/syncChannelVideos';

export async function getAdminDashboard() {
	const now = new Date();

	const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
	const [gameCount] = await db.select({ count: sql<number>`count(*)::int` }).from(games);
	const [activeGames] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(games)
		.where(eq(games.isActive, true));
	const [neverExpireGames] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(games)
		.where(eq(games.expiresNever, true));
	const [expiredGames] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(games)
		.where(and(eq(games.expiresNever, false), lt(games.expiresAt, now)));
	const [enabledTemplates] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(ruleTemplates)
		.where(eq(ruleTemplates.enabled, true));
	const [disabledTemplates] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(ruleTemplates)
		.where(eq(ruleTemplates.enabled, false));
	const [visibleVideos] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(youtubeVideos)
		.where(eq(youtubeVideos.isHidden, false));
	const [hiddenVideos] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(youtubeVideos)
		.where(eq(youtubeVideos.isHidden, true));

	const lastVideoSync = await getLatestVideoSyncTime();

	return {
		users: userCount?.count ?? 0,
		games: {
			total: gameCount?.count ?? 0,
			active: activeGames?.count ?? 0,
			expired: expiredGames?.count ?? 0,
			neverExpire: neverExpireGames?.count ?? 0
		},
		ruleTemplates: {
			enabled: enabledTemplates?.count ?? 0,
			disabled: disabledTemplates?.count ?? 0
		},
		videos: {
			visible: visibleVideos?.count ?? 0,
			hidden: hiddenVideos?.count ?? 0,
			lastSync: lastVideoSync?.toISOString() ?? null
		},
		config: {
			gameTtlDays: getGameTtlDays(),
			videoSyncCacheMinutes: getVideoSyncCacheMinutes()
		}
	};
}

export async function listAuditLog(page: number, pageSize: number) {
	const offset = (page - 1) * pageSize;
	const rows = await db
		.select()
		.from(adminAuditLog)
		.orderBy(desc(adminAuditLog.createdAt))
		.limit(pageSize)
		.offset(offset);

	const [countRow] = await db.select({ total: sql<number>`count(*)::int` }).from(adminAuditLog);
	const total = countRow?.total ?? 0;

	return {
		entries: rows,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: total === 0 ? 0 : Math.ceil(total / pageSize)
		}
	};
}
