import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	doublePrecision,
	boolean,
	primaryKey,
	smallint
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from 'next-auth/adapters';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const DrinkEnum = {
	Sip: 0,
	Gulp: 1,
	Pull: 2,
	Shot: 3
} as const;

export const CategoryEnum = {
	Camera: 'camera',
	Film: 'film',
	Technique: 'technique',
	Location: 'location',
	Equipment: 'equipment',
	General: 'general'
} as const;

export const users = pgTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name'),
	email: text('email').unique(),
	emailVerified: timestamp('emailVerified', { mode: 'date' }),
	image: text('image')
});

export const accounts = pgTable(
	'account',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccount['type']>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId]
		})
	})
);

export const sessions = pgTable('session', {
	sessionToken: text('sessionToken').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const verificationTokens = pgTable(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token]
		})
	})
);

export const games = pgTable('games', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	videoId: text('video_id').notNull(),
	videoTitle: text('video_title').notNull(),
	videoThumbnail: text('video_thumbnail'),
	intoxicationLevel: integer('intoxication_level').notNull(),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	isActive: boolean('is_active').default(true).notNull()
});

const categoryColumn = {
	enum: [
		CategoryEnum.Camera,
		CategoryEnum.Film,
		CategoryEnum.Technique,
		CategoryEnum.Location,
		CategoryEnum.Equipment,
		CategoryEnum.General
	] as [string, ...string[]]
};

export const ruleTemplates = pgTable('rule_templates', {
	id: uuid('id').primaryKey().defaultRandom(),
	text: text('text').notNull(),
	category: text('category', categoryColumn).notNull(),
	weight: doublePrecision('weight').notNull(),
	baseDrink: integer('base_drink').notNull(),
	usageCount: integer('usage_count').default(0).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rules = pgTable('rules', {
	id: uuid('id').primaryKey().defaultRandom(),
	gameId: uuid('game_id')
		.references(() => games.id, { onDelete: 'cascade' })
		.notNull(),
	ruleTemplateId: uuid('rule_template_id').references(() => ruleTemplates.id, {
		onDelete: 'set null'
	}),
	text: text('text').notNull(),
	category: text('category', categoryColumn).notNull(),
	weight: doublePrecision('weight').notNull(),
	baseDrink: integer('base_drink').notNull(),
	isCustom: boolean('is_custom').default(false).notNull(),
	order: integer('order').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const ruleVotes = pgTable(
	'rule_votes',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		ruleTemplateId: uuid('rule_template_id')
			.notNull()
			.references(() => ruleTemplates.id, { onDelete: 'cascade' }),
		vote: smallint('vote').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(ruleVote) => ({
		compoundKey: primaryKey({
			columns: [ruleVote.userId, ruleVote.ruleTemplateId]
		})
	})
);

export const youtubeVideos = pgTable('youtube_videos', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	thumbnail: text('thumbnail'),
	publishedAt: timestamp('published_at').notNull(),
	description: text('description'),
	lastFetched: timestamp('last_fetched').defaultNow().notNull()
});

export const insertGameSchema = createInsertSchema(games);
export const selectGameSchema = createSelectSchema(games);
export const insertRuleTemplateSchema = createInsertSchema(ruleTemplates);
export const selectRuleTemplateSchema = createSelectSchema(ruleTemplates);
export const insertRuleSchema = createInsertSchema(rules);
export const selectRuleSchema = createSelectSchema(rules);
export const insertRuleVoteSchema = createInsertSchema(ruleVotes);
export const selectRuleVoteSchema = createSelectSchema(ruleVotes);
export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos);
export const selectYoutubeVideoSchema = createSelectSchema(youtubeVideos);

export type Game = z.infer<typeof selectGameSchema>;
export type NewGame = z.infer<typeof insertGameSchema>;
export type RuleTemplate = z.infer<typeof selectRuleTemplateSchema>;
export type NewRuleTemplate = z.infer<typeof insertRuleTemplateSchema>;
export type Rule = z.infer<typeof selectRuleSchema>;
export type NewRule = z.infer<typeof insertRuleSchema>;
export type RuleVote = z.infer<typeof selectRuleVoteSchema>;
export type NewRuleVote = z.infer<typeof insertRuleVoteSchema>;
export type YoutubeVideo = z.infer<typeof selectYoutubeVideoSchema>;
export type NewYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
