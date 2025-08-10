import { pgTable, text, timestamp, uuid, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
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

// Tables
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  videoId: text('video_id').notNull(),
  videoTitle: text('video_title').notNull(),
  videoThumbnail: text('video_thumbnail'),
  intoxicationLevel: integer('intoxication_level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true).notNull()
});

export const rules = pgTable('rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  category: text('category', { enum: [
    CategoryEnum.Camera,
    CategoryEnum.Film,
    CategoryEnum.Technique,
    CategoryEnum.Location,
    CategoryEnum.Equipment,
    CategoryEnum.General
  ] as [string, ...string[]] }).notNull(),
  weight: doublePrecision('weight').notNull(),
  baseDrink: integer('base_drink').notNull(),
  isCustom: boolean('is_custom').default(false).notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const youtubeVideos = pgTable('youtube_videos', {
  id: text('id').primaryKey(), // YouTube video ID
  title: text('title').notNull(),
  thumbnail: text('thumbnail'),
  publishedAt: timestamp('published_at').notNull(),
  description: text('description'),
  lastFetched: timestamp('last_fetched').defaultNow().notNull()
});

// Zod schemas for validation
export const insertGameSchema = createInsertSchema(games);
export const selectGameSchema = createSelectSchema(games);

export const insertRuleSchema = createInsertSchema(rules);
export const selectRuleSchema = createSelectSchema(rules);

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos);
export const selectYoutubeVideoSchema = createSelectSchema(youtubeVideos);

// Questions table for storing data from Google Sheets
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sheetId: text('sheet_id').notNull(), // ID from Google Sheet
  text: text('text').notNull(),
  category: text('category', { enum: [
    CategoryEnum.Camera,
    CategoryEnum.Film,
    CategoryEnum.Technique,
    CategoryEnum.Location,
    CategoryEnum.Equipment,
    CategoryEnum.General
  ] as [string, ...string[]] }).notNull(),
  weight: doublePrecision('weight').notNull(),
  baseDrink: integer('base_drink').notNull(),
  order: integer('order').notNull(),
  lastSynced: timestamp('last_synced').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);

// Types
export type Game = z.infer<typeof selectGameSchema>;
export type NewGame = z.infer<typeof insertGameSchema>;
export type Rule = z.infer<typeof selectRuleSchema>;
export type NewRule = z.infer<typeof insertRuleSchema>;
export type YoutubeVideo = z.infer<typeof selectYoutubeVideoSchema>;
export type NewYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type Question = z.infer<typeof selectQuestionSchema>;
export type NewQuestion = z.infer<typeof insertQuestionSchema>;