import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const guildSettings = pgTable("guild_settings", {
  guildId: text("guild_id").primaryKey(),
  prefix: text("prefix").notNull().default("?"),
  aiEnabled: boolean("ai_enabled").notNull().default(true),
  automodEnabled: boolean("automod_enabled").notNull().default(true),
  antiNukeEnabled: boolean("anti_nuke_enabled").notNull().default(true),
  minecraftEnabled: boolean("minecraft_enabled").notNull().default(true),
  ticketPanelChannel: text("ticket_panel_channel").notNull().default("support"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const moderationCases = pgTable("moderation_cases", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  action: text("action").notNull(),
  user: text("user").notNull(),
  moderator: text("moderator").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  number: integer("number").notNull(),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  assignee: text("assignee").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});